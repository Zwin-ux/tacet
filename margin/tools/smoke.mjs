/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Margin dev-build smoke gate (R2+).
//
// Usage: node margin/tools/smoke.mjs <tag> [--skip-prelaunch]
//
// Launches the dev build with a disposable profile and fixture folder, connects to the
// renderer over the Chrome DevTools Protocol (Playwright connectOverCDP) and drives it
// from inside the page. No OS-level input is used: every keystroke is a CDP input event
// delivered to the renderer, and every screenshot is a page capture. Only the process
// tree this script started is stopped at the end.
//
// Checks: launch, type + save (bytes on disk), undo back to the original bytes,
// terminal command creates a file, source control view opens and lists the change.
// Output: margin/evidence/<tag>-*.png and margin/evidence/<tag>-smoke.json.

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, createWriteStream } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const evidence = join(root, 'margin', 'evidence');
const tag = process.argv[2] ?? 'smoke';
const skipPrelaunch = process.argv.includes('--skip-prelaunch');
const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
const scratch = join(tmpdir(), `margin-${tag}-${stamp}`);
const fixtures = join(scratch, 'fixtures');
const note = join(fixtures, 'note.md');
const original = '# Smoke note\n\nFirst line of the note.\n';
const typed = 'Typed by the smoke gate.';

const results = { tag, started: new Date().toISOString() };
const sleep = ms => new Promise(r => setTimeout(r, ms));

function freePort() {
	return new Promise((res, rej) => {
		const server = createServer();
		server.unref();
		server.on('error', rej);
		server.listen(0, '127.0.0.1', () => {
			const { port } = server.address();
			server.close(() => res(port));
		});
	});
}

function git(...args) {
	return spawnSync('git', ['-C', fixtures, '-c', 'user.name=smoke', '-c', 'user.email=smoke@example.invalid', ...args], { encoding: 'utf8' });
}

function prepareFixtures() {
	mkdirSync(fixtures, { recursive: true });
	mkdirSync(join(scratch, 'profile'), { recursive: true });
	mkdirSync(join(scratch, 'ext'), { recursive: true });
	writeFileSync(note, original);
	git('init', '-q');
	git('add', 'note.md');
	git('commit', '-q', '-m', 'fixture');
}

async function connect(port, timeoutMs) {
	const deadline = Date.now() + timeoutMs;
	let lastError;
	while (Date.now() < deadline) {
		try {
			return await chromium.connectOverCDP(`http://127.0.0.1:${port}`, { timeout: 5000 });
		} catch (error) {
			lastError = error;
			await sleep(1000);
		}
	}
	throw new Error(`CDP connect failed on port ${port}: ${lastError?.message}`);
}

async function workbenchPage(browser, timeoutMs) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		for (const context of browser.contexts()) {
			for (const page of context.pages()) {
				if (/workbench(-dev)?\.html/.test(page.url())) {
					return page;
				}
			}
		}
		await sleep(500);
	}
	throw new Error('No workbench page found');
}

async function shot(page, name) {
	const path = join(evidence, `${tag}-${name}.png`);
	await page.screenshot({ path });
	return path;
}

function killTree(pid) {
	// Stops only the process tree rooted at the PID this script spawned.
	if (pid) {
		spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' });
	}
}

async function main() {
	mkdirSync(evidence, { recursive: true });
	prepareFixtures();

	if (!skipPrelaunch) {
		const pre = spawnSync(process.execPath, ['build/lib/preLaunch.ts'], { cwd: root, encoding: 'utf8' });
		writeFileSync(join(evidence, `${tag}-prelaunch.log`), (pre.stdout ?? '') + (pre.stderr ?? ''));
		if (pre.status !== 0) {
			throw new Error('preLaunch failed');
		}
	}

	const port = await freePort();
	results.port = port;
	const log = createWriteStream(join(evidence, `${tag}-launch.log`));
	const child = spawn('cmd.exe', ['/d', '/c', 'scripts\\code.bat',
		`--remote-debugging-port=${port}`,
		'--user-data-dir', join(scratch, 'profile'),
		'--extensions-dir', join(scratch, 'ext'),
		'--disable-workspace-trust',
		'--skip-release-notes',
		fixtures, note
	], { cwd: root, env: { ...process.env, VSCODE_SKIP_PRELAUNCH: '1' }, windowsHide: false, stdio: ['ignore', 'pipe', 'pipe'] });
	child.stdout.pipe(log);
	child.stderr.pipe(log);
	results.launcherPid = child.pid;

	let browser;
	try {
		browser = await connect(port, 240_000);
		const page = await workbenchPage(browser, 60_000);
		await page.waitForSelector('.monaco-workbench', { timeout: 60_000 });
		results.launch = 'PASS';
		results.windowTitle = await page.title();
		await sleep(6000);
		results.screenshots = [await shot(page, 'launch')];

		// Type and save.
		try {
			const editor = page.locator('.monaco-editor[data-uri$="note.md"] .view-lines').first();
			if (await editor.count()) {
				results.noteEditor = 'monaco';
				await editor.click();
			} else {
				results.noteEditor = 'custom';
				await page.locator('.editor-instance').first().click();
			}
			await page.keyboard.press('Control+End');
			await page.keyboard.type(typed, { delay: 15 });
			await sleep(300);
			await page.keyboard.press('Control+s');
			await sleep(1500);
			const onDisk = readFileSync(note, 'utf8');
			results.typeSave = onDisk.includes(typed) ? 'PASS' : `FAIL (disk: ${JSON.stringify(onDisk)})`;
			results.screenshots.push(await shot(page, 'typed'));
		} catch (error) {
			results.typeSave = `FAIL (${error.message.split('\n')[0]})`;
		}

		// Undo back to the original bytes and save.
		try {
			for (let i = 0; i < 40 && readFileSync(note, 'utf8') !== original; i++) {
				await page.keyboard.press('Control+z');
				await sleep(40);
				if (i % 5 === 4) {
					await page.keyboard.press('Control+s');
					await sleep(700);
				}
			}
			await page.keyboard.press('Control+s');
			await sleep(1200);
			const onDisk = readFileSync(note, 'utf8');
			results.undo = onDisk === original ? 'PASS' : `FAIL (disk: ${JSON.stringify(onDisk)})`;
		} catch (error) {
			results.undo = `FAIL (${error.message.split('\n')[0]})`;
		}

		// Terminal.
		try {
			await page.keyboard.press('Control+Shift+Backquote');
			await page.waitForSelector('.terminal-wrapper .xterm', { timeout: 20_000 });
			await sleep(4000);
			await page.keyboard.type('echo ok > term.txt', { delay: 10 });
			await page.keyboard.press('Enter');
			const termFile = join(fixtures, 'term.txt');
			for (let i = 0; i < 20 && !existsSync(termFile); i++) {
				await sleep(500);
			}
			results.terminal = existsSync(termFile) ? 'PASS' : 'FAIL (term.txt not created)';
			results.screenshots.push(await shot(page, 'terminal'));
		} catch (error) {
			results.terminal = `FAIL (${error.message.split('\n')[0]})`;
		}

		// Source control.
		try {
			await page.keyboard.press('Control+Shift+G');
			await page.waitForSelector('div[id="workbench.view.scm"]', { timeout: 20_000 });
			let listed = false;
			for (let i = 0; i < 20 && !listed; i++) {
				listed = await page.locator('div[id="workbench.view.scm"] .monaco-list-row .resource').filter({ hasText: 'term.txt' }).count() > 0;
				if (!listed) {
					await sleep(500);
				}
			}
			const porcelain = git('status', '--porcelain').stdout;
			results.git = listed ? 'PASS (view lists term.txt)' : porcelain.includes('term.txt') ? 'PARTIAL (view open, term.txt not listed)' : 'FAIL';
			results.screenshots.push(await shot(page, 'scm'));
		} catch (error) {
			results.git = `FAIL (${error.message.split('\n')[0]})`;
		}

		// Writing layout: close panel and side bar for the reference screenshot.
		try {
			await page.keyboard.press('Control+j');
			await sleep(300);
			await page.keyboard.press('Control+b');
			await sleep(1000);
			results.screenshots.push(await shot(page, 'writing'));
		} catch (error) {
			results.writingShot = `FAIL (${error.message.split('\n')[0]})`;
		}
	} catch (error) {
		results.error = error.message.split('\n')[0];
	} finally {
		try {
			await browser?.close();
		} catch {
			// ignore
		}
		killTree(child.pid);
		results.scratch = scratch;
		results.finished = new Date().toISOString();
		writeFileSync(join(evidence, `${tag}-smoke.json`), JSON.stringify(results, null, '\t') + '\n');
		console.log(JSON.stringify(results, null, 2));
	}
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

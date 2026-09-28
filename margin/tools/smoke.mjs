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
const REQUIRED_CHECKS = ['launch', 'writingLayout', 'richEditor', 'typeSave', 'undo', 'terminal', 'git'];
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

// Presses Ctrl+S until the file on disk satisfies the predicate (retries a lost keystroke).
async function saveUntil(page, predicate, attempts = 4) {
	for (let attempt = 0; attempt < attempts; attempt++) {
		await page.keyboard.press('Control+s');
		for (let i = 0; i < 10; i++) {
			await sleep(300);
			if (predicate(readFileSync(note, 'utf8'))) {
				return true;
			}
		}
	}
	return false;
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
		// The dev window takes focus when it opens; physical keystrokes typed elsewhere can land in it.
		results.foreignInputBeforeTyping = (await page.title()).startsWith('●');

		// Writing layout by default: no status bar, no panel, no tabs.
		const layout = {
			statusBarVisible: await page.locator('.part.statusbar').first().isVisible().catch(() => false),
			panelVisible: await page.locator('.part.panel').first().isVisible().catch(() => false),
			sideBarVisible: await page.locator('.part.sidebar').first().isVisible().catch(() => false),
			tabs: await page.locator('.tabs-container .tab').count()
		};
		results.writingLayout = !layout.statusBarVisible && !layout.panelVisible && !layout.sideBarVisible && layout.tabs === 0 ? 'PASS' : `FAIL (${JSON.stringify(layout)})`;

		// A .md opens in the rich Markdown editor (a webview), not the Monaco source editor.
		const webview = page.locator('iframe.webview').first();
		try {
			await webview.waitFor({ state: 'visible', timeout: 20_000 });
		} catch {
			// reported below
		}
		const monacoNote = page.locator('.monaco-editor[data-uri$="note.md"] .view-lines').first();
		const hasWebview = await webview.isVisible().catch(() => false);
		const hasMonaco = await monacoNote.isVisible().catch(() => false);
		results.richEditor = hasWebview && !hasMonaco ? 'PASS' : `FAIL (webview: ${hasWebview}, monaco: ${hasMonaco})`;

		// Type and save.
		try {
			if (hasMonaco) {
				results.noteEditor = 'monaco';
				await monacoNote.click();
			} else {
				results.noteEditor = 'rich';
				// The webview host iframe holds the content in #active-frame; the editor (EditContext, not
				// contenteditable) is .md-editor. Click the last line of text to place the caret.
				const content = page.frameLocator('iframe.webview').first().frameLocator('#active-frame').locator('.md-editor').first();
				await content.waitFor({ state: 'visible', timeout: 20_000 });
				await content.getByText('First line of the note.').click();
				await sleep(500);
			}
			await page.keyboard.press('Control+End');
			// Rich editor: 15 ms per key split the line once (sync race, R3 finding); type at a human pace.
			await page.keyboard.type(typed, { delay: hasMonaco ? 15 : 50 });
			await sleep(300);
			const saved = await saveUntil(page, text => text.includes(typed));
			const onDisk = readFileSync(note, 'utf8');
			results.typeSave = saved ? 'PASS' : `FAIL (disk: ${JSON.stringify(onDisk)})`;
			results.screenshots.push(await shot(page, 'typed'));
		} catch (error) {
			results.typeSave = `FAIL (${error.message.split('\n')[0]})`;
		}

		// Undo back to the original bytes and save.
		try {
			// Undo stops at the opened content, so extra presses are harmless.
			for (let i = 0; i < 40; i++) {
				await page.keyboard.press('Control+z');
				await sleep(40);
			}
			const restored = await saveUntil(page, text => text === original);
			const onDisk = readFileSync(note, 'utf8');
			results.undo = restored ? 'PASS' : `FAIL (disk: ${JSON.stringify(onDisk)})`;
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
			for (let i = 0; i < 60 && !listed; i++) {
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
		// MARGIN_SMOKE_INJECT_FAILURE=<check> forces one check to fail (proves the exit code).
		const injected = process.env.MARGIN_SMOKE_INJECT_FAILURE;
		if (injected) {
			results[injected] = 'FAIL (injected)';
		}
		const failed = REQUIRED_CHECKS.filter(check => !String(results[check] ?? '').startsWith('PASS'));
		if (results.error) {
			failed.push('error');
		}
		results.failed = failed;
		writeFileSync(join(evidence, `${tag}-smoke.json`), JSON.stringify(results, null, '\t') + '\n');
		console.log(JSON.stringify(results, null, 2));
		if (failed.length) {
			console.error(`Smoke ${tag} FAILED: ${failed.join(', ')}`);
			process.exitCode = 1;
		}
	}
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

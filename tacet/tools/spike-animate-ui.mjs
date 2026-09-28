/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Spike check: Animate UI (React + Motion) inside a Tacet webview.
//
// Usage: node margin/tools/spike-animate-ui.mjs [--skip-prelaunch] [--reduced-motion]
//
// Launches the dev build with a disposable profile, drives it over CDP only (no OS input),
// runs "Tacet: Show Welcome" from the command palette, screenshots the webview mid-animation
// and at rest, picks Dark, clicks Continue inside the webview frame and checks settings.json.
// With --reduced-motion, prefers-reduced-motion is emulated over CDP (reaches the webview OOPIF).
// Output: margin/evidence/spike-animate-ui-*.png and spike-animate-ui[-reduced].json.

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, createWriteStream } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const evidence = join(root, 'tacet', 'evidence');
const reduced = process.argv.includes('--reduced-motion');
const skipPrelaunch = process.argv.includes('--skip-prelaunch');
const tag = reduced ? 'spike-animate-ui-reduced' : 'spike-animate-ui';
const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
const scratch = join(tmpdir(), `margin-${tag}-${stamp}`);
const settingsFile = join(scratch, 'profile', 'User', 'settings.json');
const results = { tag, reduced, started: new Date().toISOString(), console: [] };
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

// The webview content lives in a nested iframe; find the one that hosts our #root.
async function welcomeFrame(page, timeoutMs) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		for (const frame of page.frames()) {
			try {
				if (await frame.locator('#root main').count()) {
					return frame;
				}
			} catch {
				// frame detached or not ready
			}
		}
		await sleep(50);
	}
	throw new Error('Welcome webview frame not found');
}

async function shot(page, name) {
	const path = join(evidence, `spike-animate-ui-${name}.png`);
	await page.screenshot({ path });
	return path;
}

function killTree(pid) {
	if (pid) {
		spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' });
	}
}

async function main() {
	mkdirSync(evidence, { recursive: true });
	mkdirSync(join(scratch, 'profile'), { recursive: true });
	mkdirSync(join(scratch, 'ext'), { recursive: true });

	if (!skipPrelaunch) {
		const pre = spawnSync(process.execPath, ['build/lib/preLaunch.ts'], { cwd: root, encoding: 'utf8' });
		if (pre.status !== 0) {
			throw new Error('preLaunch failed: ' + pre.stderr);
		}
	}

	const port = await freePort();
	const log = createWriteStream(join(scratch, 'launch.log'));
	const args = ['/d', '/c', 'scripts\\code.bat',
		`--remote-debugging-port=${port}`,
		'--user-data-dir', join(scratch, 'profile'),
		'--extensions-dir', join(scratch, 'ext'),
		'--disable-workspace-trust',
		'--skip-release-notes',
		'--new-window',
	];
	const child = spawn('cmd.exe', args, { cwd: root, env: { ...process.env, VSCODE_SKIP_PRELAUNCH: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
	child.stdout.pipe(log);
	child.stderr.pipe(log);
	results.launcherPid = child.pid;

	let browser;
	try {
		browser = await connect(port, 240_000);
		const page = await workbenchPage(browser, 60_000);
		page.on('console', msg => {
			const text = msg.text();
			if (/Content Security Policy|Refused|margin-welcome|webview/i.test(text)) {
				results.console.push(`${msg.type()}: ${text.slice(0, 300)}`);
			}
		});
		await page.waitForSelector('.monaco-workbench', { timeout: 60_000 });
		await sleep(5000);
		if (reduced) {
			await page.emulateMedia({ reducedMotion: 'reduce' });
		}
		results.workbenchThemeBefore = await page.evaluate(() => document.querySelector('.monaco-workbench')?.className.match(/\bvs(-dark)?\b|hc-\w+/)?.[0]);

		// Command palette, in-page keyboard events only.
		await page.keyboard.press('F1');
		await page.waitForSelector('.quick-input-widget input', { timeout: 10_000 });
		await page.keyboard.type('Tacet: Show Welcome', { delay: 10 });
		await sleep(600);
		const t0 = Date.now();
		await page.keyboard.press('Enter');

		const frame = await welcomeFrame(page, 30_000);
		results.frameUrl = frame.url().slice(0, 120);
		results.frameFoundMs = Date.now() - t0;
		// Same timing in both modes: with reduced motion the 150 ms shot must already be at rest.
		await sleep(150);
		results.midShot = await shot(page, reduced ? 'reduced-150ms' : 'mid');
		results.midShotMs = Date.now() - t0;
		await sleep(2500);
		results.restShot = await shot(page, reduced ? 'reduced' : 'rest');

		results.inFrame = await frame.evaluate(() => ({
			reducedMotionQuery: matchMedia('(prefers-reduced-motion: reduce)').matches,
			dataReducedMotion: document.querySelector('[data-reduced-motion]')?.getAttribute('data-reduced-motion'),
			htmlDark: document.documentElement.classList.contains('dark'),
			bodyClass: document.body.className,
			h1Text: document.querySelector('h1')?.textContent,
			charSpans: document.querySelectorAll('h1 span span span').length,
			cssLoaded: getComputedStyle(document.querySelector('main')).display === 'flex',
			csp: document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute('content'),
		}));

		// Frame-rate sample while hovering the button (icon + scale animation).
		await frame.locator('[data-testid="continue"]').hover();
		results.hoverFps = await frame.evaluate(() => new Promise(res => {
			let n = 0; const start = performance.now();
			const tick = () => { n++; if (performance.now() - start < 1000) { requestAnimationFrame(tick); } else { res(n); } };
			requestAnimationFrame(tick);
		}));

		await frame.locator('[data-testid="theme-dark"]').click();
		await sleep(400);
		if (!reduced) {
			results.pickedShot = await shot(page, 'picked-dark');
		}
		await frame.locator('[data-testid="continue"]').click();

		for (let i = 0; i < 40; i++) {
			await sleep(250);
			if (existsSync(settingsFile) && /colorTheme/.test(readFileSync(settingsFile, 'utf8'))) {
				break;
			}
		}
		await sleep(1500);
		results.settings = existsSync(settingsFile) ? readFileSync(settingsFile, 'utf8') : '(missing)';
		results.panelClosed = (await page.locator('.tab', { hasText: 'Welcome to Tacet' }).count()) === 0;
		results.workbenchThemeAfter = await page.evaluate(() => document.querySelector('.monaco-workbench')?.className.match(/\bvs(-dark)?\b|hc-\w+/)?.[0]);
		if (!reduced) {
			results.afterShot = await shot(page, 'after-continue');
		}
		results.pass = /"workbench\.colorTheme":\s*"[^"]*Dark/.test(results.settings) && results.panelClosed;
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
		writeFileSync(join(evidence, `${tag}.json`), JSON.stringify(results, null, '\t') + '\n');
		console.log(JSON.stringify(results, null, 2));
		if (results.error || results.pass !== true) {
			console.error(`Spike ${tag} FAILED${results.error ? `: ${results.error}` : ''}`);
			process.exitCode = 1;
		}
	}
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Mazen Zwin and Tacet contributors. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// M3 first-boot gate (design/FIRST-BOOT.md).
//
// Usage: node tacet/tools/first-boot.mjs [--skip-prelaunch] [--only=a,b,c,d]
//
// Each case launches the dev build with a FRESH scratch profile and drives it over CDP only
// (Playwright connectOverCDP; every key is a CDP input event, every screenshot a page capture).
// No OS input. The launched process gets a scratch APPDATA (fixture VS Code files), and the
// first-boot test seams TACET_FIRSTBOOT_DOCUMENTS / TACET_FIRSTBOOT_HOME, with the OneDrive*
// variables removed or pointed at scratch folders, so the owner's real VS Code settings,
// Documents folder and registry are never read. Only process trees this script started are stopped.
//
// Cases:
//   a  first launch shows setup; Enter x4 lands on a draft with the caret; second launch shows nothing
//   b  Esc on step 1 writes nothing but the completion flag
//   c  Dark + text size 19 + import from a fixture VS Code + custom notes folder + two Extras
//   d  Documents under OneDrive (1 of 3, no import source), "Keep notes only on this PC", reduced motion
//
// Output: tacet/evidence/m3-*.png and tacet/evidence/m3-first-boot.json.

import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const evidence = join(root, 'tacet', 'evidence');
const skipPrelaunch = process.argv.includes('--skip-prelaunch');
const only = (process.argv.find(a => a.startsWith('--only='))?.slice(7) ?? 'a,b,c,d').split(',');
const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
const scratchRoot = join(tmpdir(), `tacet-m3-${stamp}`);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const results = { started: new Date().toISOString(), scratchRoot, cases: {} };

// ---- fixtures -----------------------------------------------------------------------------------

const FIXTURE_SETTINGS = `// VS Code user settings (M3 fixture). JSONC: comments and a trailing comma.
{
	"editor.fontSize": 15, // copied
	"editor.tabSize": 2,
	"editor.wordWrap": "on",
	"files.trimTrailingWhitespace": true,
	"terminal.integrated.fontSize": 13,
	"[markdown]": { "editor.wordWrap": "bounded", "github.copilot.enable": false },
	/* never copied */
	"editor.minimap.enabled": false,
	"workbench.colorTheme": "Default Dark+",
	"workbench.statusBar.visible": false,
	"github.copilot.enable": { "*": true },
	"git.autofetch": true,
	"extensions.autoUpdate": false,
	"chat.editor.fontSize": 14,
	"foo.unknownSetting": 1,
}
`;
const FIXTURE_KEYBINDINGS = `// VS Code keybindings (M3 fixture)
[
	{ "key": "ctrl+shift+d", "command": "editor.action.copyLinesDownAction", "when": "editorTextFocus" },
	{ "key": "ctrl+shift+k", "command": "-editor.action.deleteLines" },
	{ "key": "ctrl+k ctrl+i", "command": "github.copilot.generate" },
	{ "key": "ctrl+alt+x", "command": "nonexistent.fixture.command" },
]
`;
const EXPECT_IMPORTED = { 'editor.fontSize': 15, 'editor.tabSize': 2, 'editor.wordWrap': 'on', 'files.trimTrailingWhitespace': true, 'terminal.integrated.fontSize': 13, '[markdown]': { 'editor.wordWrap': 'bounded' } };

function writeFixture(dir, files) {
	mkdirSync(dir, { recursive: true });
	for (const [name, text] of Object.entries(files)) {
		writeFileSync(join(dir, name), text);
	}
}

const sha = file => existsSync(file) ? createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 16) : null;

// ---- process + CDP helpers (same approach as smoke.mjs / spike-animate-ui.mjs) ------------------

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

function killTree(pid) {
	if (pid) {
		spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' });
	}
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
		await sleep(250);
	}
	throw new Error('No workbench page found');
}

async function setupFrame(page, timeoutMs) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		for (const frame of page.frames()) {
			try {
				if (await frame.locator('[data-testid="setup"]').count()) {
					return frame;
				}
			} catch {
				// detached
			}
		}
		await sleep(50);
	}
	return null;
}

/** Launches the dev build. env: extra variables; drop: variables to remove. */
async function launch(c, { profile, env, drop = [] }) {
	const port = await freePort();
	const childEnv = { ...process.env, VSCODE_SKIP_PRELAUNCH: '1', ...env };
	for (const k of Object.keys(childEnv)) {
		if (drop.some(d => d.toLowerCase() === k.toLowerCase())) {
			delete childEnv[k];
		}
	}
	const log = createWriteStream(join(profile, '..', `launch-${Date.now()}.log`));
	const t0 = Date.now();
	const child = spawn('cmd.exe', ['/d', '/c', 'scripts\\code.bat',
		`--remote-debugging-port=${port}`,
		'--user-data-dir', profile,
		'--extensions-dir', join(profile, '..', 'ext'),
		'--disable-workspace-trust',
		'--skip-release-notes',
		'--new-window',
	], { cwd: root, env: childEnv, stdio: ['ignore', 'pipe', 'pipe'] });
	child.stdout.pipe(log);
	child.stderr.pipe(log);
	c.pids = [...(c.pids ?? []), child.pid];
	const browser = await connect(port, 240_000);
	const page = await workbenchPage(browser, 60_000);
	await page.waitForSelector('.monaco-workbench', { timeout: 60_000 });
	const workbenchMs = Date.now() - t0;
	return { child, browser, page, t0, workbenchMs };
}

/** Closes the app the way a user does (all windows closed), so storage is flushed. */
async function quit(session) {
	try {
		const cdp = await session.browser.newBrowserCDPSession();
		// The reply may never come (the app is gone); do not let a dead promise end the script.
		await Promise.race([cdp.send('Browser.close').catch(() => undefined), sleep(3000)]);
	} catch {
		// ignore
	}
	for (let i = 0; i < 60 && session.child.exitCode === null; i++) {
		await sleep(500);
	}
	killTree(session.child.pid);
}

const shot = async (page, name) => {
	const path = join(evidence, `m3-${name}.png`);
	await page.screenshot({ path });
	return path;
};

async function stepOf(frame) {
	return frame.evaluate(() => ({
		step: document.querySelector('[data-step]')?.getAttribute('data-step') ?? null,
		line: document.querySelector('[data-testid="step-line"]')?.textContent ?? null,
		active: document.activeElement?.getAttribute('data-testid') ?? document.activeElement?.tagName ?? null,
	})).catch(() => ({ step: null }));
}

async function waitStep(frame, step, timeoutMs = 5000) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		const s = await stepOf(frame);
		if (s.step === step) {
			// Let the 160 ms enter fade settle before a screenshot.
			return s;
		}
		await sleep(40);
	}
	throw new Error(`step ${step} did not appear (at ${(await stepOf(frame)).step})`);
}

async function press(page, key, wait = 250) {
	await page.keyboard.press(key);
	await sleep(wait);
}

function readSettings(profile) {
	const file = join(profile, 'User', 'settings.json');
	if (!existsSync(file)) {
		return {};
	}
	const text = readFileSync(file, 'utf8').replace(/\/\/.*$/gm, '').trim();
	return text ? JSON.parse(text) : {};
}

function readFlag(profile) {
	const db = join(profile, 'User', 'globalStorage', 'state.vscdb');
	if (!existsSync(db)) {
		return '(no state.vscdb)';
	}
	try {
		const conn = new DatabaseSync(db, { readOnly: true });
		const row = conn.prepare(`SELECT value FROM ItemTable WHERE key = 'vscode.tacet-welcome'`).get();
		conn.close();
		return row ? JSON.parse(row.value)['tacet.firstBoot.completed'] ?? '(key missing)' : '(no row)';
	} catch (error) {
		return `(read failed: ${error.message})`;
	}
}

/** Waits until the setup webview is gone and a draft editor has focus; returns the caret facts. */
async function landing(page) {
	for (let i = 0; i < 40; i++) {
		const facts = await page.evaluate(() => {
			const a = document.activeElement;
			const ed = a?.closest('.monaco-editor');
			return { focusInEditor: !!ed, uri: ed?.getAttribute('data-uri') ?? null, tag: a?.tagName ?? null };
		});
		if (facts.focusInEditor && facts.uri?.startsWith('untitled:')) {
			return facts;
		}
		await sleep(250);
	}
	return page.evaluate(() => ({ focusInEditor: false, tag: document.activeElement?.tagName, cls: document.activeElement?.className?.toString().slice(0, 80) }));
}

async function typeProbe(page) {
	await page.keyboard.type('Caret ready.', { delay: 20 });
	await sleep(400);
	// Monaco renders spaces as U+00A0.
	return page.evaluate(() => (document.querySelector('.monaco-editor[data-uri^="untitled:"] .view-lines')?.textContent ?? '').replace(/\u00a0/g, ' '));
}

function scratchCase(id) {
	const dir = join(scratchRoot, id);
	const dirs = { dir, profile: join(dir, 'profile'), appData: join(dir, 'appdata'), docs: join(dir, 'docs'), home: join(dir, 'home') };
	for (const d of Object.values(dirs)) {
		mkdirSync(d, { recursive: true });
	}
	mkdirSync(join(dir, 'ext'), { recursive: true });
	return dirs;
}

const DROP_ONEDRIVE = ['OneDrive', 'OneDriveConsumer', 'OneDriveCommercial'];

function eq(a, b) {
	return JSON.stringify(a) === JSON.stringify(b);
}

// ---- cases ----------------------------------------------------------------------------------------

async function caseA(c) {
	const s = scratchCase('a');
	const codeUser = join(s.appData, 'Code', 'User');
	writeFixture(codeUser, { 'settings.json': FIXTURE_SETTINGS, 'keybindings.json': FIXTURE_KEYBINDINGS });
	const env = { APPDATA: s.appData, TACET_FIRSTBOOT_DOCUMENTS: s.docs, TACET_FIRSTBOOT_HOME: s.home };
	let session = await launch(c, { profile: s.profile, env, drop: DROP_ONEDRIVE });
	const { page } = session;
	const frame = await setupFrame(page, 30_000);
	c.appearedAutomatically = !!frame;
	c.workbenchMs = session.workbenchMs;
	c.setupFirstFrameMs = Date.now() - session.t0;
	if (!frame) {
		throw new Error('first boot did not appear');
	}
	c.initialFocus = (await stepOf(frame)).active;
	await sleep(1100); // the mark's 880 ms draw
	c.steps = [];
	c.steps.push({ ...(await waitStep(frame, 'look')), shot: await shot(page, '1-look') });
	await press(page, 'Enter', 400);
	c.steps.push({ ...(await waitStep(frame, 'import')), shot: await shot(page, '2-import') });
	c.importPreviewDefaultSelected = await frame.evaluate(() => document.querySelector('[data-testid="source-defaults"]')?.getAttribute('aria-checked'));
	await press(page, 'Enter', 400);
	c.steps.push({ ...(await waitStep(frame, 'notes')), shot: await shot(page, '3-notes') });
	await press(page, 'Enter', 400);
	c.steps.push({ ...(await waitStep(frame, 'extras')), shot: await shot(page, '4-extras') });
	await press(page, 'Enter', 200);
	c.landing = await landing(page);
	await sleep(300);
	c.landingShot = await shot(page, '5-landing');
	c.typed = await typeProbe(page);
	c.settings = readSettings(s.profile);
	c.notesFolderCreated = existsSync(join(s.docs, 'Notes'));
	c.fixtureUnchanged = readFileSync(join(codeUser, 'settings.json'), 'utf8') === FIXTURE_SETTINGS && readFileSync(join(codeUser, 'keybindings.json'), 'utf8') === FIXTURE_KEYBINDINGS;
	await quit(session);
	c.flagAfterQuit = readFlag(s.profile);

	// Second launch, same profile: no setup.
	session = await launch(c, { profile: s.profile, env, drop: DROP_ONEDRIVE });
	await sleep(8000);
	c.secondLaunchShowsSetup = !!(await setupFrame(session.page, 2000));
	c.secondLaunchShot = await shot(session.page, 'a-second-launch');
	await quit(session);

	const expected = {
		'window.autoDetectColorScheme': true,
		'workbench.preferredLightColorTheme': 'Tacet Light',
		'workbench.preferredDarkColorTheme': 'Tacet Dark',
		'tacet.notes.folder': join(s.docs, 'Notes'),
	};
	c.expectedSettings = expected;
	c.pass = c.appearedAutomatically && eq(c.steps.map(x => x.line), ['1 of 4', '2 of 4', '3 of 4', '4 of 4'])
		&& c.landing.focusInEditor && c.typed.includes('Caret ready.')
		&& eq(Object.keys(c.settings).sort(), Object.keys(expected).sort()) && Object.entries(expected).every(([k, v]) => eq(c.settings[k], v))
		&& c.notesFolderCreated && c.flagAfterQuit === true && !c.secondLaunchShowsSetup;
}

async function caseB(c) {
	const s = scratchCase('b');
	const env = { APPDATA: s.appData, TACET_FIRSTBOOT_DOCUMENTS: s.docs, TACET_FIRSTBOOT_HOME: s.home };
	const session = await launch(c, { profile: s.profile, env, drop: DROP_ONEDRIVE });
	const frame = await setupFrame(session.page, 30_000);
	if (!frame) {
		throw new Error('first boot did not appear');
	}
	await waitStep(frame, 'look');
	c.stepLine = (await stepOf(frame)).line;
	await press(session.page, 'Escape', 200);
	c.landing = await landing(session.page);
	c.shot = await shot(session.page, 'b-skip-landing');
	await sleep(500);
	c.settingsFileExists = existsSync(join(s.profile, 'User', 'settings.json'));
	c.settings = readSettings(s.profile);
	c.notesFolders = { documents: existsSync(join(s.docs, 'Notes')), local: existsSync(join(s.home, 'Tacet')) };
	await quit(session);
	c.flagAfterQuit = readFlag(s.profile);
	c.pass = Object.keys(c.settings).length === 0 && c.flagAfterQuit === true && c.landing.focusInEditor && !c.notesFolders.documents && !c.notesFolders.local;
}

async function caseC(c) {
	const s = scratchCase('c');
	const codeUser = join(s.appData, 'Code', 'User');
	writeFixture(codeUser, { 'settings.json': FIXTURE_SETTINGS, 'keybindings.json': FIXTURE_KEYBINDINGS });
	// A second source with a corrupt settings.json: must be shown, not crash.
	writeFixture(join(s.appData, 'Code - Insiders', 'User'), { 'settings.json': '{ "editor.fontSize": 14, oops' });
	const before = { settings: sha(join(codeUser, 'settings.json')), keybindings: sha(join(codeUser, 'keybindings.json')) };
	// The in-window folder picker (files.simpleDialog.enable) replaces the native dialog so CDP can drive it.
	writeFixture(join(s.profile, 'User'), { 'settings.json': '{\n\t"files.simpleDialog.enable": true\n}\n' });
	const custom = join(s.dir, 'my notes');
	mkdirSync(custom, { recursive: true });
	const env = { APPDATA: s.appData, TACET_FIRSTBOOT_DOCUMENTS: s.docs, TACET_FIRSTBOOT_HOME: s.home };
	const session = await launch(c, { profile: s.profile, env, drop: DROP_ONEDRIVE });
	const { page } = session;
	const frame = await setupFrame(page, 30_000);
	if (!frame) {
		throw new Error('first boot did not appear');
	}
	await waitStep(frame, 'look');
	// Theme: System -> Light -> Dark with arrows (live preview), then Tab to the size value, + + => 19.
	await press(page, 'ArrowRight', 300);
	await press(page, 'ArrowRight', 800);
	c.themeWhilePreviewing = await page.evaluate(() => document.querySelector('.monaco-workbench')?.classList.contains('vs-dark'));
	await press(page, 'Tab', 100);
	await press(page, 'Tab', 100);
	await press(page, '+', 100);
	await press(page, '+', 300);
	c.sizeShown = await frame.evaluate(() => document.querySelector('[data-testid="size-value"]')?.textContent);
	c.lookShot = await shot(page, 'c-1-look-dark');
	await press(page, 'Enter', 400);
	await waitStep(frame, 'import');
	await press(page, 'ArrowUp', 300); // defaults -> the last source row above it
	await press(page, 'ArrowUp', 400); // -> Copy from VS Code
	c.importSelected = await frame.evaluate(() => [...document.querySelectorAll('[role="radio"][aria-checked="true"]')].map(e => e.getAttribute('data-testid')));
	c.importPreview = await frame.evaluate(() => [...document.querySelectorAll('[data-testid="import-preview"]')].map(e => e.textContent));
	c.importShot = await shot(page, 'c-2-import');
	await press(page, 'Enter', 500);
	await waitStep(frame, 'notes');
	await sleep(600);
	c.importResult = await frame.evaluate(() => document.querySelector('[data-testid="import-result"]')?.textContent ?? null);
	await press(page, 'ArrowDown', 300); // -> A folder I choose
	await press(page, 'Enter', 1200); // no folder yet: Enter opens the picker
	c.pickerOpen = await page.locator('.quick-input-widget input').first().isVisible().catch(() => false);
	c.pickerShot = await shot(page, 'c-3-picker');
	if (c.pickerOpen) {
		await page.keyboard.press('Control+a');
		await page.keyboard.type(custom + '\\', { delay: 5 });
		await sleep(600);
		for (let i = 0; i < 3 && await page.locator('.quick-input-widget input').first().isVisible().catch(() => false); i++) {
			await press(page, 'Enter', 900);
		}
	}
	await sleep(500);
	c.customShown = await frame.evaluate(() => document.querySelector('[data-testid="notes-custom"]')?.textContent);
	c.focusAfterPicker = await frame.evaluate(() => document.hasFocus() ? document.activeElement?.getAttribute('data-testid') : '(webview not focused)');
	c.notesShot = await shot(page, 'c-3-notes-custom');
	await press(page, 'Enter', 500);
	await waitStep(frame, 'extras');
	await press(page, ' ', 250); // Show a status line
	await press(page, 'ArrowDown', 100);
	await press(page, 'ArrowDown', 100);
	await press(page, 'ArrowDown', 100); // Check spelling
	await press(page, ' ', 400);
	c.extrasShot = await shot(page, 'c-4-extras-on');
	await press(page, 'Enter', 200);
	c.landing = await landing(page);
	await sleep(300);
	c.landingShot = await shot(page, 'c-5-landing-dark');
	c.settings = readSettings(s.profile);
	c.keybindings = existsSync(join(s.profile, 'User', 'keybindings.json')) ? readFileSync(join(s.profile, 'User', 'keybindings.json'), 'utf8') : null;
	c.fixtureUnchanged = before.settings === sha(join(codeUser, 'settings.json')) && before.keybindings === sha(join(codeUser, 'keybindings.json'));
	await quit(session);

	const expected = {
		'files.simpleDialog.enable': true, // pre-seeded by this harness
		'window.autoDetectColorScheme': false,
		'workbench.colorTheme': 'Tacet Dark',
		'tacet.document.fontSize': 19,
		...EXPECT_IMPORTED,
		'tacet.notes.folder': custom,
		'workbench.statusBar.visible': true,
		'tacet.spelling.enabled': true,
	};
	c.expectedSettings = expected;
	c.unexpectedKeys = Object.keys(c.settings).filter(k => !(k in expected));
	c.missingOrWrong = Object.keys(expected).filter(k => !eq(c.settings[k], expected[k]));
	c.keybindingsOk = !!c.keybindings && c.keybindings.includes('editor.action.copyLinesDownAction') && c.keybindings.includes('-editor.action.deleteLines')
		&& !c.keybindings.includes('copilot') && !c.keybindings.includes('nonexistent.fixture.command');
	c.pass = c.unexpectedKeys.length === 0 && c.missingOrWrong.length === 0 && c.keybindingsOk && c.fixtureUnchanged && c.landing.focusInEditor;
}

async function caseD(c) {
	const s = scratchCase('d');
	const oneDrive = join(s.dir, 'OneDrive');
	const docs = join(oneDrive, 'Documents');
	mkdirSync(docs, { recursive: true });
	// No VS Code under APPDATA: the import step is skipped (1 of 3). OneDrive points at scratch.
	const env = { APPDATA: s.appData, TACET_FIRSTBOOT_DOCUMENTS: docs, TACET_FIRSTBOOT_HOME: s.home, OneDrive: oneDrive };
	const session = await launch(c, { profile: s.profile, env, drop: ['OneDriveConsumer', 'OneDriveCommercial'] });
	const { page } = session;
	await page.emulateMedia({ reducedMotion: 'reduce' });
	const frame = await setupFrame(page, 30_000);
	if (!frame) {
		throw new Error('first boot did not appear');
	}
	await waitStep(frame, 'look');
	c.reducedFlag = await frame.evaluate(() => document.documentElement.dataset.reducedMotion);
	c.markAnimation = await frame.evaluate(() => { const el = document.querySelector('.mm'); return el ? getComputedStyle(el).animationName + ' ' + getComputedStyle(el).animationDuration : null; });
	c.stepLine = (await stepOf(frame)).line;
	c.lookShot = await shot(page, 'd-1-look-reduced');
	// Reduced motion: the next step is fully visible almost at once.
	await page.keyboard.press('Enter');
	const t = Date.now();
	let opacity = null;
	for (let i = 0; i < 40; i++) {
		opacity = await frame.evaluate(() => { const el = document.querySelector('[data-step="notes"]'); return el ? getComputedStyle(el).opacity : null; });
		if (opacity === '1') {
			break;
		}
		await sleep(10);
	}
	c.stepChangeMs = Date.now() - t;
	c.stepChangeOpacity = opacity;
	c.notesStepLine = (await stepOf(frame)).line;
	c.oneDriveLine = await frame.evaluate(() => document.querySelector('[data-testid="onedrive-line"]')?.textContent ?? null);
	await sleep(300);
	c.notesShot = await shot(page, 'd-2-notes-onedrive');
	await press(page, 'ArrowDown', 300); // -> Keep notes only on this PC
	c.selected = await frame.evaluate(() => document.querySelector('[role="radio"][aria-checked="true"]')?.getAttribute('data-testid'));
	c.notesLocalShot = await shot(page, 'd-2-notes-local');
	await press(page, 'Enter', 300);
	await waitStep(frame, 'extras');
	c.extrasLine = (await stepOf(frame)).line;
	await press(page, 'Escape', 200); // skip keeps what was confirmed
	c.landing = await landing(page);
	c.settings = readSettings(s.profile);
	c.localCreated = existsSync(join(s.home, 'Tacet'));
	c.documentsNotesCreated = existsSync(join(docs, 'Notes'));
	await quit(session);
	const expected = {
		'window.autoDetectColorScheme': true,
		'workbench.preferredLightColorTheme': 'Tacet Light',
		'workbench.preferredDarkColorTheme': 'Tacet Dark',
		'tacet.notes.folder': join(s.home, 'Tacet'),
	};
	c.expectedSettings = expected;
	c.pass = c.reducedFlag === 'true' && c.stepChangeOpacity === '1' && c.stepChangeMs < 150 && c.stepLine === '1 of 3' && c.extrasLine === '3 of 3'
		&& !!c.oneDriveLine && c.selected === 'notes-local'
		&& eq(Object.keys(c.settings).sort(), Object.keys(expected).sort()) && Object.entries(expected).every(([k, v]) => eq(c.settings[k], v))
		&& c.localCreated && !c.documentsNotesCreated && c.landing.focusInEditor;
}

async function main() {
	mkdirSync(evidence, { recursive: true });
	mkdirSync(scratchRoot, { recursive: true });
	if (!skipPrelaunch) {
		const pre = spawnSync(process.execPath, ['build/lib/preLaunch.ts'], { cwd: root, encoding: 'utf8' });
		if (pre.status !== 0) {
			throw new Error('preLaunch failed: ' + pre.stderr);
		}
	}
	const cases = { a: caseA, b: caseB, c: caseC, d: caseD };
	for (const id of only) {
		const c = results.cases[id] = { started: new Date().toISOString() };
		try {
			await cases[id](c);
		} catch (error) {
			c.error = error.message.split('\n')[0];
			c.pass = false;
		} finally {
			for (const pid of c.pids ?? []) {
				killTree(pid);
			}
		}
		console.log(`case ${id}: ${c.pass ? 'PASS' : 'FAIL'}${c.error ? ` (${c.error})` : ''}`);
	}
	results.finished = new Date().toISOString();
	results.pass = Object.values(results.cases).every(c => c.pass);
	writeFileSync(join(evidence, 'm3-first-boot.json'), JSON.stringify(results, null, '\t') + '\n');
	if (!results.pass) {
		process.exitCode = 1;
	}
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

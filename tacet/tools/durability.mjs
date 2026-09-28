/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Mazen Zwin and Tacet contributors. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Tacet durability gate (G2).
//
// Usage: node tacet/tools/durability.mjs <tag> [--skip-prelaunch] [--only name,name]
//
// Written from the spec (tacet/docs/02-DOCUMENT-CONTRACT.md D-01..D-13, D-21..D-24 and
// 08-ACCEPTANCE.md), independently of the implementation, so it is an honest check that
// drafts and files cannot be lost. Same harness as smoke.mjs: dev build launched with a
// disposable profile, renderer driven over CDP (Playwright connectOverCDP) with CDP key
// events only, only this script's own process trees are stopped.
//
// Scratch profile settings (written to <profile>/User/settings.json):
//   files.simpleDialog.enable = true   Save As is an in-page quick-input, drivable over CDP
//   window.dialogStyle = "custom"      confirmations are in-page, readable over CDP
// Native OS dialogs cannot be driven from CDP, so the gate checks the in-page path.
//
// Scenarios (each PASS/FAIL with detail in tacet/evidence/<tag>-durability.json):
//   new-draft-survives-restart, renderer-kill, save-as-cancel, save-as-then-no-duplicate,
//   save-failure, external-change-conflict, open-save-byte-identical, fixtures-untouched.
// Some scenarios may legitimately FAIL on a build that does not implement G2 yet.
// TACET_DURABILITY_INJECT_FAILURE=<scenario> forces one scenario to FAIL (proves the exit code).

import { spawn, spawnSync } from 'node:child_process';
import { chmodSync, copyFileSync, createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createServer } from 'node:net';
import { tmpdir, userInfo } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const evidence = join(root, 'tacet', 'evidence');
const tag = process.argv[2]?.startsWith('--') ? 'durability' : (process.argv[2] ?? 'durability');
const skipPrelaunch = process.argv.includes('--skip-prelaunch');
const onlyArg = process.argv.indexOf('--only');
const only = onlyArg > 0 ? process.argv[onlyArg + 1].split(',') : undefined;
const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
const scratch = join(tmpdir(), `tacet-${tag}-${stamp}`);

const sleep = ms => new Promise(r => setTimeout(r, ms));
const isMac = process.platform === 'darwin';
const isWin = process.platform === 'win32';
const KEY = {
	mod: isMac ? 'Meta' : 'Control',
	docEnd: isMac ? 'Meta+ArrowDown' : 'Control+End',
};
const sha = buf => createHash('sha256').update(buf).digest('hex');
const FAILURE_NOTICE = /couldn.?t save|failed to save|unable to save|could not save|permission denied|EACCES|EPERM|read-only|not writable/i;
const CONFLICT_NOTICE = /newer|changed outside|conflict|compare|overwrite|modified since|file on disk/i;

// ---- Fixture bookkeeping (check 8) ----------------------------------------------------------

const tracked = new Map(); // working path -> sha256 at creation
const intended = new Set(); // working paths a scenario is allowed to change
const pristine = new Map(); // read-only reference copy path -> sha256
const cleanups = []; // always run at the end (restore permissions)
const allScenarios = [];

function underScratch(path) {
	if (!resolve(path).startsWith(scratch + sep)) {
		throw new Error(`refusing to touch a path outside the scratch dir: ${path}`);
	}
	return path;
}

// Writes fixture files into the scenario folder and a read-only reference copy under scratch/pristine.
function makeFixtures(sc, files) {
	const paths = {};
	for (const [name, content] of Object.entries(files)) {
		const path = underScratch(join(sc.fixtures, name));
		writeFileSync(path, content);
		const ref = underScratch(join(scratch, 'pristine', sc.name, name));
		mkdirSync(dirname(ref), { recursive: true });
		copyFileSync(path, ref);
		chmodSync(ref, 0o444);
		tracked.set(path, sha(readFileSync(path)));
		pristine.set(ref, sha(readFileSync(ref)));
		paths[name] = path;
	}
	return paths;
}

// ---- Scratch profile + app harness ------------------------------------------------------------

function mkScenario(name) {
	const dir = underScratch(join(scratch, name));
	const sc = { name, dir, profile: join(dir, 'profile'), ext: join(dir, 'ext'), fixtures: join(dir, 'fixtures'), launches: 0, apps: [] };
	allScenarios.push(sc);
	for (const d of [sc.profile, sc.ext, sc.fixtures]) {
		mkdirSync(d, { recursive: true });
	}
	return sc;
}

function writeSettings(profile) {
	const file = join(profile, 'User', 'settings.json');
	if (!existsSync(file)) {
		mkdirSync(dirname(file), { recursive: true });
		writeFileSync(file, JSON.stringify({ 'files.simpleDialog.enable': true, 'window.dialogStyle': 'custom' }, null, '\t'));
	}
}

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

function killTree(sc, pid) {
	// Only the tree this script spawned; macOS Electron leaves the launcher's group, so match the scenario's unique path.
	if (isMac) {
		try { process.kill(-pid, 'SIGTERM'); } catch { /* already gone */ }
		spawnSync('pkill', ['-f', sc.dir], { stdio: 'ignore' });
	} else if (isWin) {
		spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' });
	} else {
		try { process.kill(-pid, 'SIGTERM'); } catch { /* already gone */ }
	}
}

// open: files/folders passed on the command line ([] = empty window, restores the last session).
async function launch(sc, { open = [], profile = sc.profile } = {}) {
	writeSettings(profile);
	const port = await freePort();
	const n = ++sc.launches;
	const log = createWriteStream(join(evidence, `${tag}-${sc.name}-launch${n}.log`));
	const [launcher, ...launcherArgs] = isWin ? ['cmd.exe', '/d', '/c', 'scripts\\code.bat'] : ['scripts/code.sh'];
	const child = spawn(launcher, [...launcherArgs,
		`--remote-debugging-port=${port}`,
		'--user-data-dir', profile,
		'--extensions-dir', sc.ext,
		'--disable-workspace-trust',
		'--skip-release-notes',
		...open.map(underScratch)
	], { cwd: root, env: { ...process.env, VSCODE_SKIP_PRELAUNCH: '1' }, windowsHide: false, detached: !isWin, stdio: ['ignore', 'pipe', 'pipe'] });
	child.stdout.pipe(log);
	child.stderr.pipe(log);
	const app = { sc, child, profile, disconnected: false, exited: false };
	child.once('exit', () => { app.exited = true; });
	sc.apps.push(app);
	try {
		app.browser = await connect(port, 240_000);
		app.browser.on('disconnected', () => { app.disconnected = true; });
		app.page = await workbenchPage(app.browser, 60_000);
		await app.page.waitForSelector('.monaco-workbench', { timeout: 60_000 });
		await sleep(4000);
	} catch (error) {
		killTree(sc, child.pid);
		throw error;
	}
	return app;
}

// Normal exit through the Quit command (palette), falling back to Browser.close; reports which worked.
async function quitApp(app) {
	const t0 = Date.now();
	const gone = () => app.disconnected || app.exited;
	const waitGone = async ms => { for (let end = Date.now() + ms; Date.now() < end && !gone();) { await sleep(300); } return gone(); };
	let method = 'palette-quit';
	try {
		await app.page.keyboard.press(`${KEY.mod}+Shift+p`);
		await sleep(700);
		await app.page.keyboard.type(isWin ? 'Exit' : 'Quit', { delay: 30 });
		await sleep(700);
		await app.page.keyboard.press('Enter');
	} catch { /* fall through */ }
	if (!await waitGone(30_000)) {
		method = 'Browser.close';
		try { await (await app.browser.newBrowserCDPSession()).send('Browser.close'); } catch { /* ignore */ }
		if (!await waitGone(15_000)) {
			method = 'killed (quit did not exit)';
		}
	}
	await sleep(1000);
	killTree(app.sc, app.child.pid);
	return { method, clean: method !== 'killed (quit did not exit)', ms: Date.now() - t0 };
}

async function shot(app, name) {
	const path = join(evidence, `${tag}-${app.sc.name}-${name}.png`);
	await app.page.screenshot({ path }).catch(() => undefined);
	return path;
}

// ---- Editor + profile probes ---------------------------------------------------------------------

async function until(fn, ms, step = 250) {
	for (const end = Date.now() + ms; Date.now() < end;) {
		const value = await fn();
		if (value) {
			return value;
		}
		await sleep(step);
	}
	return false;
}

// Text as the visible editor holds it: rich editor (EditContext) first, Monaco otherwise.
async function shownText(page) {
	for (const frame of page.frames()) {
		if (!frame.url().startsWith('vscode-webview://')) {
			continue;
		}
		const text = await frame.evaluate(() => document.querySelector('.md-editor')?.editContext?.text).catch(() => undefined);
		if (typeof text === 'string') {
			return text;
		}
	}
	const monaco = await page.evaluate(() => [...document.querySelectorAll('.monaco-editor .view-lines')].map(e => e.innerText).join('\n')).catch(() => '');
	return monaco.replace(/ /g, ' ');
}

async function focusEditor(page) {
	try {
		await page.frameLocator('iframe.webview').first().frameLocator('#active-frame').locator('.md-editor').first().click({ timeout: 3000 });
		return;
	} catch { /* not the rich editor */ }
	await page.locator('.monaco-editor .view-lines').first().click({ timeout: 3000 }).catch(() => undefined);
}

async function typeUntil(page, text) {
	for (let attempt = 0; attempt < 3; attempt++) {
		await page.keyboard.type(text, { delay: 15 });
		if (await until(async () => (await shownText(page)).includes(text.slice(0, 8)), 2000, 200)) {
			await sleep(300);
			return (await shownText(page)).includes(text);
		}
		await focusEditor(page); // keystrokes lost: refocus and retry
	}
	return false;
}

async function newNote(page) {
	await page.keyboard.press(`${KEY.mod}+n`);
	await sleep(1500);
}

const isDirty = async page => (await page.title()).includes('●');

async function notices(page) {
	return page.evaluate(() => [...document.querySelectorAll('.notifications-toasts .notification-toast, .notifications-center .notification-list-item, .monaco-dialog-box, .quick-input-message')]
		.map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean)).catch(() => []);
}

async function simpleDialogOpen(page) {
	return page.locator('.quick-input-widget').first().isVisible().catch(() => false);
}

// Drives the in-page Save As: mod+S, replace the suggested path, Enter. Returns false if no dialog appeared.
async function saveAsTo(page, path) {
	await page.keyboard.press(`${KEY.mod}+s`);
	if (!await until(() => simpleDialogOpen(page), 8000, 200)) {
		return false;
	}
	await sleep(300);
	await page.keyboard.press(`${KEY.mod}+a`);
	await page.keyboard.type(path, { delay: 5 });
	await sleep(300);
	await page.keyboard.press('Enter');
	return true;
}

function walk(dir, out = []) {
	if (!existsSync(dir)) {
		return out;
	}
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) {
			walk(path, out);
		} else if (!/\.(vscdb|sqlite)(-journal|\.backup)?$/.test(entry.name)) {
			out.push(path);
		}
	}
	return out;
}

function scan(profile, subdirs, marker) {
	const hits = [];
	for (const file of subdirs.flatMap(d => walk(join(profile, ...d)))) {
		let text;
		try { text = statSync(file).size < 5_000_000 ? readFileSync(file, 'utf8') : ''; } catch { continue; }
		if (text.includes(marker)) {
			hits.push({ file: relative(profile, file), header: text.split('\n', 1)[0].slice(0, 100), occurrences: text.split(marker).length - 1 });
		}
	}
	return hits;
}

// Hot-exit working-copy backups: one file per dirty document/draft; first line is "<resource> <meta>".
const backupHits = (profile, marker) => scan(profile, [['Backups']], marker);
const otherStoreHits = (profile, marker) => scan(profile, [['User', 'globalStorage'], ['User', 'workspaceStorage']], marker);

function otherBackups(profile, marker) {
	return walk(join(profile, 'Backups')).filter(f => !/workspaces\.json$/.test(f)).map(f => {
		const text = readFileSync(f, 'utf8');
		return { file: relative(profile, f), header: text.split('\n', 1)[0].slice(0, 100), body: text.slice(text.indexOf('\n') + 1).trim(), hit: text.includes(marker) };
	}).filter(b => !b.hit && b.body.length > 0);
}

// ---- Scenarios -------------------------------------------------------------------------------------
// Each returns { fails: [...], info: {...} }; an empty fails list is PASS.

const scenarios = {};

scenarios['new-draft-survives-restart'] = async () => {
	const sc = mkScenario('new-draft-survives-restart');
	const marker = `Draft restart survivor ${stamp}`;
	const fails = [];
	const info = {};
	let app = await launch(sc);
	await newNote(app.page);
	if (!await typeUntil(app.page, marker)) {
		fails.push('could not type into a new note');
	}
	await sleep(1500);
	info.checkpointBeforeQuit = backupHits(sc.profile, marker).length > 0;
	info.quit = await quitApp(app);
	if (!info.quit.clean) {
		fails.push(`normal quit did not exit: ${info.quit.method}`);
	}
	app = await launch(sc);
	const restored = await until(async () => (await shownText(app.page)).includes(marker), 30_000);
	const shown = await shownText(app.page);
	info.screenshot = await shot(app, 'restored');
	info.occurrencesInEditor = shown.split(marker).length - 1;
	info.backupHits = backupHits(sc.profile, marker);
	info.otherStoreHits = otherStoreHits(sc.profile, marker);
	info.extraDrafts = otherBackups(sc.profile, marker);
	if (!restored) {
		fails.push('draft text did not come back after a normal restart');
	}
	if (info.occurrencesInEditor > 1) {
		fails.push(`draft text appears ${info.occurrencesInEditor} times in the editor`);
	}
	if (info.backupHits.length > 1) {
		fails.push(`${info.backupHits.length} backup copies of the same draft`);
	}
	if (info.extraDrafts.length) {
		fails.push(`${info.extraDrafts.length} extra non-empty draft(s) besides the typed one`);
	}
	return { fails, info };
};

scenarios['renderer-kill'] = async () => {
	const sc = mkScenario('renderer-kill');
	const a = `Renderer kill checkpointed ${stamp}`;
	const b = ` tail typed just before the crash ${stamp}`;
	const fails = [];
	const info = {};
	let app = await launch(sc);
	await newNote(app.page);
	if (!await typeUntil(app.page, a)) {
		fails.push('could not type into a new note');
	}
	const typedAt = Date.now();
	info.checkpointMs = await until(() => backupHits(sc.profile, a).length > 0 ? Date.now() - typedAt : 0, 8000, 50) || null;
	info.checkpointWithin500ms = info.checkpointMs !== null && info.checkpointMs <= 500; // D-22 target (informational)
	if (info.checkpointMs === null) {
		fails.push('no checkpoint of the draft within 8 s of typing');
	}
	await sleep(1000);
	await app.page.keyboard.type(b, { delay: 5 });
	const cdp = await app.page.context().newCDPSession(app.page);
	await cdp.send('Page.crash').catch(() => undefined); // renderer dies immediately after the last keystroke
	await sleep(2500);
	info.screenshot = await shot(app, 'crashed');
	killTree(sc, app.child.pid);
	await sleep(1500);
	app = await launch(sc);
	const recovered = await until(async () => (await shownText(app.page)).includes(a), 30_000);
	const shown = await shownText(app.page);
	info.recoveredCheckpointedText = Boolean(recovered);
	info.recoveredTail = shown.includes(b.trim());
	info.lossWindow = info.recoveredTail ? 'none observed' : `tail typed <${Date.now() - typedAt} ms before the crash was lost`;
	info.occurrencesInEditor = shown.split(a).length - 1;
	if (!recovered) {
		fails.push('checkpointed text not recovered after renderer kill');
	}
	if (info.occurrencesInEditor > 1) {
		fails.push(`recovered text appears ${info.occurrencesInEditor} times`);
	}
	return { fails, info };
};

scenarios['save-as-cancel'] = async () => {
	const sc = mkScenario('save-as-cancel');
	const marker = `Save As cancel keeps me ${stamp}`;
	const fails = [];
	const info = { simpleDialogSettings: true };
	const app = await launch(sc);
	await newNote(app.page);
	if (!await typeUntil(app.page, marker)) {
		fails.push('could not type into a new note');
	}
	await sleep(1200);
	await app.page.keyboard.press(`${KEY.mod}+s`);
	info.dialogOpened = Boolean(await until(() => simpleDialogOpen(app.page), 8000, 200));
	info.screenshot = await shot(app, 'dialog');
	if (!info.dialogOpened) {
		fails.push('Ctrl/Cmd+S on a draft did not open an in-page Save As (native dialog? not drivable)');
	}
	await app.page.keyboard.press('Escape');
	await sleep(1500);
	info.dialogClosed = !await simpleDialogOpen(app.page);
	const shown = await shownText(app.page);
	info.textIntact = shown.includes(marker);
	info.dirtyOrBackedUp = await isDirty(app.page) || backupHits(sc.profile, marker).length > 0;
	info.filesCreated = walk(sc.fixtures);
	if (!info.dialogClosed) {
		fails.push('Save As dialog still open after Escape');
	}
	if (!info.textIntact) {
		fails.push('draft text changed or vanished after cancelling Save As');
	}
	if (!info.dirtyOrBackedUp) {
		fails.push('draft neither dirty nor backed up after cancel (not recoverable)');
	}
	if (info.filesCreated.length) {
		fails.push('cancel created a file on disk');
	}
	return { fails, info };
};

scenarios['save-as-then-no-duplicate'] = async () => {
	const sc = mkScenario('save-as-then-no-duplicate');
	const marker = `Saved once, drafted never again ${stamp}`;
	const target = underScratch(join(sc.fixtures, 'saved-draft.md'));
	tracked.set(target, ''); // created by the test on purpose
	intended.add(target);
	const fails = [];
	const info = { simpleDialogSettings: true };
	let app = await launch(sc);
	await newNote(app.page);
	if (!await typeUntil(app.page, marker)) {
		fails.push('could not type into a new note');
	}
	await sleep(1500);
	const before = await shownText(app.page);
	if (!await saveAsTo(app.page, target)) {
		fails.push('Save As did not open in-page');
	}
	const written = await until(() => existsSync(target) && readFileSync(target, 'utf8').includes(marker), 15_000);
	const disk = existsSync(target) ? readFileSync(target, 'utf8') : '';
	info.screenshot = await shot(app, 'saved');
	info.bytesEqualEditorText = disk === before;
	info.disk = disk.slice(0, 200);
	if (!written) {
		fails.push('file with the typed text was not written');
	} else if (!info.bytesEqualEditorText) {
		fails.push(`file bytes differ from the editor text: disk ${JSON.stringify(disk)} vs editor ${JSON.stringify(before)}`);
	}
	const diskHash = sha(readFileSync(target));
	info.backupGoneAfterSaveMs = await until(() => backupHits(sc.profile, marker).length === 0 ? 1 : 0, 6000, 200) ? 'retired' : 'backup still present';
	if (info.backupGoneAfterSaveMs !== 'retired') {
		fails.push('recovery copy of the draft still present after Save As');
	}
	info.quit = await quitApp(app);
	if (!info.quit.clean) {
		fails.push(`normal quit did not exit: ${info.quit.method}`);
	}
	app = await launch(sc);
	await sleep(4000);
	info.leftoverBackups = backupHits(sc.profile, marker);
	info.otherStoreHits = otherStoreHits(sc.profile, marker);
	info.titleAfterRelaunch = await app.page.title();
	info.screenshotAfter = await shot(app, 'relaunched');
	if (info.leftoverBackups.length) {
		fails.push(`${info.leftoverBackups.length} mutable draft copy/copies with the saved content after relaunch`);
	}
	if (sha(readFileSync(target)) !== diskHash) {
		fails.push('saved file changed across relaunch');
	}
	return { fails, info };
};

scenarios['save-failure'] = async () => {
	const sc = mkScenario('save-failure');
	const marker = `Save failure must keep me ${stamp}`;
	const ro = underScratch(join(sc.dir, 'readonly'));
	mkdirSync(ro);
	const target = join(ro, 'draft.md');
	const restore = () => {
		if (isWin) {
			spawnSync('icacls', [ro, '/remove:d', userInfo().username], { stdio: 'ignore' });
		} else {
			chmodSync(ro, 0o755);
		}
	};
	cleanups.push(restore);
	if (isWin) {
		spawnSync('icacls', [ro, '/deny', `${userInfo().username}:(OI)(CI)(WD,AD)`], { stdio: 'ignore' });
	} else {
		chmodSync(ro, 0o555);
	}
	const fails = [];
	const info = { readonlyMechanism: isWin ? 'icacls deny write' : 'chmod 555', runningAsRoot: !isWin && process.getuid?.() === 0 };
	const app = await launch(sc);
	await newNote(app.page);
	if (!await typeUntil(app.page, marker)) {
		fails.push('could not type into a new note');
	}
	await sleep(1500);
	if (!await saveAsTo(app.page, target)) {
		fails.push('Save As did not open in-page');
	}
	const seen = await until(async () => (await notices(app.page)).find(t => FAILURE_NOTICE.test(t)), 12_000, 300);
	info.failureNotice = seen || null;
	info.allNotices = await notices(app.page);
	info.screenshot = await shot(app, 'failed');
	await sleep(500);
	info.textIntact = (await shownText(app.page)).includes(marker);
	info.dirtyOrBackedUp = await isDirty(app.page) || backupHits(sc.profile, marker).length > 0;
	info.targetExists = existsSync(target);
	info.successClaim = info.allNotices.find(t => /^saved\b|successfully saved|saved to/i.test(t)) || null;
	if (!seen) {
		fails.push('no visible failure notice (looked for "Couldn\'t save"/"Failed to save"/permission text)');
	}
	if (!info.textIntact) {
		fails.push('text no longer in the editor after a failed save');
	}
	if (!info.dirtyOrBackedUp) {
		fails.push('document neither dirty nor backed up after a failed save');
	}
	if (info.targetExists || info.successClaim) {
		fails.push('save reported or produced success despite the read-only destination');
	}
	return { fails, info };
};

scenarios['external-change-conflict'] = async () => {
	const sc = mkScenario('external-change-conflict');
	const typed = ` LOCAL EDIT ${stamp}`;
	const external = `# External\n\nWritten by the test script while the note was open. ${stamp}\n`;
	const { 'conflict.md': note } = makeFixtures(sc, { 'conflict.md': '# Original\n\nOriginal body.\n' });
	intended.add(note);
	const fails = [];
	const info = {};
	const app = await launch(sc, { open: [sc.fixtures, note] });
	if (!await until(async () => (await shownText(app.page)).includes('Original body'), 30_000)) {
		fails.push('fixture did not open');
	}
	await focusEditor(app.page);
	await app.page.keyboard.press(KEY.docEnd);
	if (!await typeUntil(app.page, typed)) {
		fails.push('could not type into the opened file');
	}
	await sleep(1200); // mtime resolution: make the external write clearly newer
	writeFileSync(note, external);
	await sleep(2000);
	const preSave = await notices(app.page);
	await app.page.keyboard.press(`${KEY.mod}+s`);
	const seen = await until(async () => (await notices(app.page)).find(t => CONFLICT_NOTICE.test(t)), 12_000, 300);
	info.conflictNotice = seen || preSave.find(t => CONFLICT_NOTICE.test(t)) || null;
	info.allNotices = await notices(app.page);
	info.screenshot = await shot(app, 'conflict');
	const disk = readFileSync(note, 'utf8');
	const siblings = walk(sc.fixtures).filter(f => f !== note).map(f => ({ file: relative(sc.fixtures, f), text: readFileSync(f, 'utf8') }));
	info.diskAfter = disk.slice(0, 200);
	info.siblingCopies = siblings.map(s => s.file);
	const externalKept = disk.includes('Written by the test script') || siblings.some(s => s.text.includes('Written by the test script'));
	const typedKept = (await shownText(app.page)).includes(typed.trim()) || backupHits(sc.profile, typed.trim()).length > 0
		|| disk.includes(typed.trim()) || siblings.some(s => s.text.includes(typed.trim()));
	info.silentOverwrite = disk.includes(typed.trim()) && !externalKept;
	if (!info.conflictNotice && !siblings.length) {
		fails.push('no conflict path (no "file is newer"/compare/"Changed outside Tacet" UI, no keep-both copy)');
	}
	if (!externalKept) {
		fails.push('the version written to disk by the script was lost');
	}
	if (!typedKept) {
		fails.push('the local unsaved text was lost');
	}
	return { fails, info };
};

scenarios['open-save-byte-identical'] = async () => {
	const sc = mkScenario('open-save-byte-identical');
	const files = makeFixtures(sc, {
		'crlf.md': '# CRLF\r\n\r\nline one\r\nline two\r\n',
		'bom.md': Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from('# BOM note\n\nBody text.\n')]),
		'trailing.md': '# Trailing\n\nhard break  \nnext line   \nlast\n',
		'nofinal.md': '# No final newline\n\nlast line without newline',
		'frontmatter.md': '---\ntitle: Front matter\ntags: [a, b]\n---\n\n# Body\n\ntext\n'
	});
	const fails = [];
	const info = {};
	for (const [name, path] of Object.entries(files)) {
		const original = readFileSync(path);
		const originalHash = sha(original);
		const mtime = statSync(path).mtimeMs;
		const row = {};
		info[name] = row;
		const app = await launch(sc, { open: [sc.fixtures, path], profile: join(sc.dir, `profile-${name}`) });
		try {
			await until(async () => (await shownText(app.page)).length > 0, 30_000);
			await sleep(2500);
			row.unchangedAfterOpen = sha(readFileSync(path)) === originalHash && statSync(path).mtimeMs === mtime;
			// Edit then revert (x + Backspace): the document is dirty with identical text, so Save runs the full write path.
			await focusEditor(app.page);
			await app.page.keyboard.press(KEY.docEnd);
			await app.page.keyboard.type('x', { delay: 20 });
			await app.page.keyboard.press('Backspace');
			await sleep(600);
			row.dirtyBeforeSave = await isDirty(app.page);
			for (let attempt = 0; attempt < 3; attempt++) {
				await app.page.keyboard.press(`${KEY.mod}+s`);
				if (await until(async () => !await isDirty(app.page), 4000, 250)) {
					break;
				}
			}
			await sleep(1000);
			row.dirtyAfterSave = await isDirty(app.page);
			const after = readFileSync(path);
			row.sha256Before = originalHash;
			row.sha256After = sha(after);
			row.identical = row.sha256After === originalHash;
			row.screenshot = await shot(app, name);
			if (!row.unchangedAfterOpen) {
				fails.push(`${name}: opening the file wrote to it (D-13)`);
			}
			if (!row.identical) {
				fails.push(`${name}: bytes changed after save (${JSON.stringify(after.toString('latin1').slice(0, 80))})`);
			}
			if (row.dirtyAfterSave) {
				fails.push(`${name}: still dirty after save`);
			}
		} finally {
			killTree(sc, app.child.pid);
			await sleep(1500);
		}
	}
	return { fails, info };
};

// ---- Runner -----------------------------------------------------------------------------------------

function checkFixturesUntouched() {
	const fails = [];
	const info = { workingFiles: tracked.size, pristineFiles: pristine.size };
	for (const [path, hash] of tracked) {
		if (!intended.has(path) && existsSync(path) && sha(readFileSync(path)) !== hash) {
			fails.push(`fixture changed unexpectedly: ${relative(scratch, path)}`);
		}
	}
	for (const [path, hash] of pristine) {
		if (!existsSync(path) || sha(readFileSync(path)) !== hash) {
			fails.push(`read-only reference copy changed: ${relative(scratch, path)}`);
		}
	}
	return { fails, info };
}

async function main() {
	mkdirSync(evidence, { recursive: true });
	mkdirSync(scratch, { recursive: true });
	if (!skipPrelaunch) {
		const pre = spawnSync(process.execPath, ['build/lib/preLaunch.ts'], { cwd: root, encoding: 'utf8' });
		writeFileSync(join(evidence, `${tag}-prelaunch.log`), (pre.stdout ?? '') + (pre.stderr ?? ''));
		if (pre.status !== 0) {
			throw new Error('preLaunch failed');
		}
	}
	const results = { tag, platform: process.platform, started: new Date().toISOString(), scratch, dialogs: 'files.simpleDialog.enable=true, window.dialogStyle=custom', checks: {} };
	const names = Object.keys(scenarios).filter(n => !only || only.includes(n));
	for (const name of names) {
		const started = Date.now();
		let outcome;
		try {
			outcome = await scenarios[name]();
		} catch (error) {
			outcome = { fails: [`error: ${error.message.split('\n')[0]}`], info: {} };
		}
		for (const sc of allScenarios) { // stop anything this scenario left running
			for (const app of sc.apps) {
				killTree(sc, app.child.pid);
			}
		}
		results.checks[name] = { status: outcome.fails.length ? 'FAIL' : 'PASS', fails: outcome.fails, seconds: Math.round((Date.now() - started) / 1000), info: outcome.info };
		console.log(`${results.checks[name].status} ${name}${outcome.fails.length ? ': ' + outcome.fails.join('; ') : ''}`);
	}
	const untouched = checkFixturesUntouched();
	results.checks['fixtures-untouched'] = { status: untouched.fails.length ? 'FAIL' : 'PASS', fails: untouched.fails, info: untouched.info };
	console.log(`${results.checks['fixtures-untouched'].status} fixtures-untouched${untouched.fails.length ? ': ' + untouched.fails.join('; ') : ''}`);

	const injected = process.env.TACET_DURABILITY_INJECT_FAILURE;
	if (injected && results.checks[injected]) {
		results.checks[injected] = { ...results.checks[injected], status: 'FAIL', fails: [...results.checks[injected].fails, 'injected'] };
	}
	results.failed = Object.entries(results.checks).filter(([, c]) => c.status !== 'PASS').map(([n]) => n);
	results.finished = new Date().toISOString();
	writeFileSync(join(evidence, `${tag}-durability.json`), JSON.stringify(results, null, '\t') + '\n');
	if (results.failed.length) {
		console.error(`Durability ${tag} FAILED: ${results.failed.join(', ')}`);
		process.exitCode = 1;
	}
}

process.on('exit', () => { // last resort: restore permissions on the read-only fixture
	for (const fn of cleanups) {
		try { fn(); } catch { /* ignore */ }
	}
});

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

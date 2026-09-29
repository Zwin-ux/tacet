/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Mazen Zwin and Tacet contributors. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Tacet gate G2: durable notes (M5).
//
// Usage: node tacet/tools/g2.mjs <tag> [--skip-prelaunch]
//
// Launches the dev build four times on one disposable profile and tries to lose text:
//   run 1  draft survives Save As cancel and a failed Save As; an external change is not
//          overwritten; a read-only file keeps the typed text; then a normal window close
//   run 2  everything above is restored; a new draft is typed, the renderer is crashed and
//          the whole process tree is killed
//   run 3  everything is restored again; a draft is saved with Save As; normal close
//   run 4  the saved draft exists once: as the file, not also as a draft
// Evidence is the backup store on disk plus the text each restored editor shows.
//
// Like smoke.mjs, input is CDP only (no OS input), and only this script's process tree is
// stopped. The gate profile turns on files.simpleDialog.enable so Save As is an in-window
// dialog that CDP can drive; that setting is a test affordance, not a product default.
// Output: tacet/evidence/<tag>-g2.json and screenshots.

import { spawn, spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync, createWriteStream } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const evidence = join(root, 'tacet', 'evidence');
const tag = process.argv[2] ?? 'g2';
const skipPrelaunch = process.argv.includes('--skip-prelaunch');
const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
const scratch = join(tmpdir(), `tacet-${tag}-${stamp}`);
const fixtures = join(scratch, 'fixtures');
const profile = join(scratch, 'profile');

const isMac = process.platform === 'darwin';
const MOD = isMac ? 'Meta' : 'Control';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const TEXT = {
	draftOne: 'Draft one outlives cancel, failure, exit and crash.',
	draftTwo: 'Draft two outlives a killed renderer.',
	draftSaved: 'Draft three becomes a file and stops being a draft.',
	extOriginal: 'External file, first version.\n',
	extChanged: 'External file, changed by another program.\n',
	extTyped: 'Typed while another program changed the file.',
	roOriginal: 'Read-only file.\n',
	roTyped: 'Typed into a read-only file.',
	blocker: 'A file where Save As expects a folder.\n',
};
const FILES = {
	ext: join(fixtures, 'external.txt'),
	ro: join(fixtures, 'readonly.txt'),
	blocker: join(fixtures, 'blocker.txt'),
	saved: join(fixtures, 'saved.md'),
};

const results = { tag, started: new Date().toISOString(), checks: {} };
const REQUIRED_CHECKS = ['saveAsCancel', 'saveAsFailure', 'externalChange', 'readOnly', 'normalExit', 'rendererKill', 'saveAsTransfer', 'noDuplicate', 'userFilesUntouched'];

function check(name, pass, detail) {
	results.checks[name] = pass ? `PASS${detail ? ` (${detail})` : ''}` : `FAIL${detail ? ` (${detail})` : ''}`;
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

function prepare() {
	mkdirSync(fixtures, { recursive: true });
	mkdirSync(join(profile, 'User'), { recursive: true });
	mkdirSync(join(scratch, 'ext'), { recursive: true });
	writeFileSync(FILES.ext, TEXT.extOriginal);
	writeFileSync(FILES.ro, TEXT.roOriginal);
	chmodSync(FILES.ro, 0o444);
	writeFileSync(FILES.blocker, TEXT.blocker);
	writeFileSync(join(profile, 'User', 'settings.json'), JSON.stringify({ 'files.simpleDialog.enable': true }, null, '\t'));
}

function killTree(pid) {
	if (!pid) {
		return;
	}
	if (isMac) {
		try { process.kill(-pid, 'SIGKILL'); } catch { /* already gone */ }
		spawnSync('pkill', ['-9', '-f', scratch], { stdio: 'ignore' });
	} else {
		spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' });
		// A crashed window's processes can outlive the launcher's tree; match this run's scratch path.
		spawnSync('powershell.exe', ['-NoProfile', '-Command', `Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*${scratch}*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`], { stdio: 'ignore' });
	}
}

async function launch(run, args = []) {
	const port = await freePort();
	const log = createWriteStream(join(evidence, `${tag}-${run}-launch.log`));
	const [launcher, ...launcherArgs] = isMac ? ['scripts/code.sh'] : ['cmd.exe', '/d', '/c', 'scripts\\code.bat'];
	const child = spawn(launcher, [...launcherArgs,
		`--remote-debugging-port=${port}`,
		'--user-data-dir', profile,
		'--extensions-dir', join(scratch, 'ext'),
		'--disable-workspace-trust',
		'--skip-release-notes',
		...args
	], { cwd: root, env: { ...process.env, VSCODE_SKIP_PRELAUNCH: '1', TACET_FIRST_BOOT: 'off' }, detached: isMac, stdio: ['ignore', 'pipe', 'pipe'] });
	child.stdout.pipe(log);
	child.stderr.pipe(log);
	const exited = new Promise(r => child.once('exit', () => r(true)));

	const deadline = Date.now() + 240_000;
	let browser;
	while (!browser && Date.now() < deadline) {
		try {
			browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`, { timeout: 5000 });
		} catch {
			await sleep(1000);
		}
	}
	if (!browser) {
		killTree(child.pid);
		throw new Error(`${run}: CDP connect failed`);
	}
	let page;
	while (!page && Date.now() < deadline) {
		page = browser.contexts().flatMap(c => c.pages()).find(p => /workbench(-dev)?\.html/.test(p.url()));
		if (!page) {
			await sleep(500);
		}
	}
	if (!page) {
		killTree(child.pid);
		throw new Error(`${run}: no workbench page`);
	}
	await page.waitForSelector('.monaco-workbench', { timeout: 60_000 });
	await sleep(5000); // restore and extension host settle
	return { run, child, browser, page, exited };
}

async function shot(app, name) {
	await app.page.screenshot({ path: join(evidence, `${tag}-${app.run}-${name}.png`) }).catch(() => undefined);
}

// Text of the active editor: the Monaco model when the source editor is showing, else the rich
// Markdown editor's EditContext.
async function activeText(page) {
	const monaco = await page.evaluate(() => {
		const lines = [...document.querySelectorAll('.editor-group-container.active .monaco-editor .view-lines')]
			.find(el => el.offsetParent !== null);
		return lines ? lines.innerText.replace(/ /g, ' ') : undefined;
	}).catch(() => undefined);
	if (monaco !== undefined) {
		return monaco; // a hidden rich editor keeps its frame alive; only read it when no source editor shows
	}
	const texts = [];
	for (const frame of page.frames()) {
		if (!frame.url().startsWith('vscode-webview://')) {
			continue;
		}
		const text = await frame.evaluate(() => document.querySelector('.md-editor')?.editContext?.text).catch(() => undefined);
		if (typeof text === 'string') {
			texts.push(text);
		}
	}
	return texts.join('\n');
}

// Walks every open editor (Ctrl+PageDown cycles within the group; Tacet hides tabs) and
// returns the text each one shows.
async function allEditorTexts(page, max = 10) {
	const seen = [];
	for (let i = 0; i < max; i++) {
		const title = await page.title();
		const text = await activeText(page);
		if (seen.some(s => s.title === title && s.text === text)) {
			break;
		}
		seen.push({ title, text });
		await page.keyboard.press(`${MOD}+PageDown`);
		await sleep(700);
	}
	return seen;
}

// Every backup the profile holds, with the text after the metadata line.
function backups() {
	const out = [];
	const walk = dir => {
		if (!existsSync(dir)) {
			return;
		}
		for (const name of readdirSync(dir)) {
			const path = join(dir, name);
			if (statSync(path).isDirectory()) {
				walk(path);
			} else {
				const raw = readFileSync(path, 'utf8');
				const newline = raw.indexOf('\n');
				out.push({ path, kind: path.includes(`${isMac ? '/' : '\\'}untitled${isMac ? '/' : '\\'}`) ? 'untitled' : 'file', meta: raw.slice(0, newline), text: raw.slice(newline + 1) });
			}
		}
	};
	walk(join(profile, 'Backups'));
	return out;
}

async function newDraft(page, text) {
	await page.keyboard.press(`${MOD}+n`);
	await sleep(1500);
	await page.keyboard.type(text, { delay: 15 });
	await sleep(2500); // past the working copy backup delay
}

async function quickInputVisible(page) {
	return page.locator('.quick-input-widget').first().isVisible().catch(() => false);
}

async function openFile(page, path) {
	await page.keyboard.press(`${MOD}+p`);
	await sleep(800);
	await page.keyboard.type(path, { delay: 5 });
	await sleep(1200);
	await page.keyboard.press('Enter');
	await sleep(2000);
}

// Ctrl+S on a draft opens the (simple) Save As dialog; types a path and accepts or cancels.
async function saveAs(page, path, accept) {
	await page.keyboard.press(`${MOD}+s`);
	await sleep(1500);
	const opened = await quickInputVisible(page);
	if (!opened) {
		return 'no dialog';
	}
	if (path) {
		const input = page.locator('.quick-input-widget input').first();
		await input.fill(path);
		await sleep(800);
	}
	await page.keyboard.press(accept ? 'Enter' : 'Escape');
	await sleep(2500);
	if (await quickInputVisible(page)) {
		// The dialog refused the path (validation); leave it.
		await page.keyboard.press('Escape');
		await sleep(800);
		return 'refused';
	}
	return 'closed';
}

async function closeWindow(app) {
	await app.page.keyboard.press(`${MOD}+Shift+w`);
	const closed = await Promise.race([app.exited, sleep(30_000).then(() => false)]);
	await app.browser.close().catch(() => undefined);
	if (!closed) {
		killTree(app.child.pid);
	}
	return closed;
}

async function crash(app) {
	try {
		const cdp = await app.page.context().newCDPSession(app.page);
		cdp.send('Page.crash').catch(() => undefined); // not awaited: the reply never comes once the renderer is gone
	} catch {
		// the session dies with the renderer
	}
	await sleep(2000);
	await app.browser.close().catch(() => undefined);
	killTree(app.child.pid);
	await Promise.race([app.exited, sleep(10_000)]);
}

const has = (list, text) => list.some(e => e.text.includes(text));

async function main() {
	mkdirSync(evidence, { recursive: true });
	prepare();
	if (!skipPrelaunch) {
		const pre = spawnSync(process.execPath, ['build/lib/preLaunch.ts'], { cwd: root, encoding: 'utf8' });
		if (pre.status !== 0) {
			throw new Error('preLaunch failed');
		}
	}

	// Run 1
	let app = await launch('run1', [FILES.ext, FILES.ro]);
	try {
		const page = app.page;
		results.run1Title = await page.title();

		await newDraft(page, TEXT.draftOne);
		const cancel = await saveAs(page, undefined, false);
		const afterCancel = await activeText(page);
		check('saveAsCancel', cancel !== 'no dialog' && afterCancel.includes(TEXT.draftOne), `dialog: ${cancel}`);

		const fail = await saveAs(page, join(FILES.blocker, 'draft.md'), true);
		const afterFail = await activeText(page);
		check('saveAsFailure', fail !== 'no dialog' && afterFail.includes(TEXT.draftOne) && readFileSync(FILES.blocker, 'utf8') === TEXT.blocker, `dialog: ${fail}`);
		await shot(app, 'draft');

		await openFile(page, FILES.ext);
		await page.keyboard.press(`${MOD}+End`);
		await page.keyboard.type(TEXT.extTyped, { delay: 0 });
		writeFileSync(FILES.ext, TEXT.extChanged); // before the autosave delay runs out
		await sleep(4000);
		const extShown = await activeText(page);
		const extDisk = readFileSync(FILES.ext, 'utf8');
		check('externalChange', extDisk === TEXT.extChanged && extShown.includes(TEXT.extTyped), `disk ${JSON.stringify(extDisk)}`);
		await shot(app, 'external');

		await openFile(page, FILES.ro);
		await page.keyboard.press(`${MOD}+End`);
		await page.keyboard.type(TEXT.roTyped, { delay: 15 });
		await sleep(4000);
		const roShown = await activeText(page);
		const roDisk = readFileSync(FILES.ro, 'utf8');
		results.readOnlyDisk = roDisk;
		// Either outcome keeps the text: the save is refused and the typing stays, or the user's
		// typing reached the disk. Silently dropping the typing is the failure.
		check('readOnly', roShown.includes(TEXT.roTyped) || roDisk.includes(TEXT.roTyped), roDisk === TEXT.roOriginal ? 'save refused, text kept' : 'saved');
		await shot(app, 'readonly');

		results.run1Backups = backups().map(b => ({ kind: b.kind, text: b.text.slice(0, 80) }));
		results.run1Closed = await closeWindow(app);
	} catch (error) {
		results.run1Error = error.message.split('\n')[0];
		killTree(app.child.pid);
	}

	// Run 2
	app = await launch('run2');
	try {
		const page = app.page;
		const editors = await allEditorTexts(page);
		results.run2Editors = editors.map(e => ({ title: e.title, text: e.text.slice(0, 80) }));
		check('normalExit', has(editors, TEXT.draftOne) && has(editors, TEXT.extTyped) && has(editors, TEXT.roTyped) || (has(editors, TEXT.draftOne) && has(editors, TEXT.extTyped) && readFileSync(FILES.ro, 'utf8').includes(TEXT.roTyped)), `${editors.length} editors`);
		await shot(app, 'restored');

		await newDraft(page, TEXT.draftTwo);
		results.run2Backups = backups().map(b => ({ kind: b.kind, text: b.text.slice(0, 80) }));
		await crash(app);
	} catch (error) {
		results.run2Error = error.message.split('\n')[0];
		killTree(app.child.pid);
	}

	// Run 3
	app = await launch('run3');
	try {
		const page = app.page;
		const editors = await allEditorTexts(page);
		results.run3Editors = editors.map(e => ({ title: e.title, text: e.text.slice(0, 80) }));
		check('rendererKill', has(editors, TEXT.draftTwo) && has(editors, TEXT.draftOne), `${editors.length} editors`);
		await shot(app, 'restored');

		await newDraft(page, TEXT.draftSaved);
		const saved = await saveAs(page, FILES.saved, true);
		await sleep(1500);
		const onDisk = existsSync(FILES.saved) ? readFileSync(FILES.saved, 'utf8') : undefined;
		check('saveAsTransfer', onDisk !== undefined && onDisk.includes(TEXT.draftSaved), `dialog: ${saved}, disk: ${JSON.stringify(onDisk)}`);
		results.run3Closed = await closeWindow(app);
	} catch (error) {
		results.run3Error = error.message.split('\n')[0];
		killTree(app.child.pid);
	}

	// Run 4
	app = await launch('run4');
	try {
		const page = app.page;
		const editors = await allEditorTexts(page);
		results.run4Editors = editors.map(e => ({ title: e.title, text: e.text.slice(0, 80) }));
		const draftCopies = backups().filter(b => b.kind === 'untitled' && b.text.includes(TEXT.draftSaved)).length;
		const shownCopies = editors.filter(e => e.text.includes(TEXT.draftSaved)).length;
		check('noDuplicate', draftCopies === 0 && shownCopies <= 1 && has(editors, TEXT.draftOne) && has(editors, TEXT.draftTwo), `untitled backups with it: ${draftCopies}, editors showing it: ${shownCopies}`);
		results.run4Closed = await closeWindow(app);
	} catch (error) {
		results.run4Error = error.message.split('\n')[0];
		killTree(app.child.pid);
	}

	// Every file the gate touched lives under its scratch folder.
	check('userFilesUntouched', [profile, fixtures].every(p => p.startsWith(scratch)) && readFileSync(FILES.blocker, 'utf8') === TEXT.blocker, scratch);
}

main().catch(error => {
	results.error = error.message.split('\n')[0];
}).finally(() => {
	try { chmodSync(FILES.ro, 0o644); } catch { /* ignore */ }
	results.scratch = scratch;
	results.finished = new Date().toISOString();
	const failed = REQUIRED_CHECKS.filter(c => !String(results.checks[c] ?? '').startsWith('PASS'));
	if (results.error) {
		failed.push('error');
	}
	results.failed = failed;
	writeFileSync(join(evidence, `${tag}-g2.json`), JSON.stringify(results, null, '\t') + '\n');
	console.log(JSON.stringify(results, null, 2));
	if (failed.length) {
		console.error(`G2 ${tag} FAILED: ${failed.join(', ')}`);
		process.exitCode = 1;
	}
});

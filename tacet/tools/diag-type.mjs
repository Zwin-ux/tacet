// TEMP diagnostic (delete before commit): trace rich-editor caret for a key sequence.
// Usage: node diag-type.mjs <clickText> <key1> <key2> ...
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const scratch = join(tmpdir(), `margin-diag-${Date.now()}`);
const fixtures = join(scratch, 'fixtures');
const note = join(fixtures, 'note.md');
const original = '# Smoke note\n\nFirst line of the note.\n\n- first item\n- second item\n\nLast line of the note.\n';
const sleep = ms => new Promise(r => setTimeout(r, ms));

function freePort() {
	return new Promise((res, rej) => {
		const s = createServer(); s.unref(); s.on('error', rej);
		s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => res(port)); });
	});
}

mkdirSync(fixtures, { recursive: true });
mkdirSync(join(scratch, 'profile'), { recursive: true });
mkdirSync(join(scratch, 'ext'), { recursive: true });
writeFileSync(note, original);

const port = await freePort();
const child = spawn('cmd.exe', ['/d', '/c', 'scripts\\code.bat', `--remote-debugging-port=${port}`, '--user-data-dir', join(scratch, 'profile'), '--extensions-dir', join(scratch, 'ext'), '--disable-workspace-trust', '--skip-release-notes', fixtures, note], { cwd: root, env: { ...process.env, VSCODE_SKIP_PRELAUNCH: '1' }, stdio: 'ignore' });
let browser;
try {
	for (let i = 0; i < 240 && !browser; i++) {
		try { browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`, { timeout: 5000 }); } catch { await sleep(1000); }
	}
	let page;
	for (let i = 0; i < 120 && !page; i++) {
		for (const c of browser.contexts()) { for (const p of c.pages()) { if (/workbench(-dev)?\.html/.test(p.url())) { page = p; } } }
		if (!page) { await sleep(500); }
	}
	await page.waitForSelector('.monaco-workbench', { timeout: 60000 });
	await sleep(6000);
	console.log('title', await page.title());
	const content = page.frameLocator('iframe.webview').first().frameLocator('#active-frame').locator('.md-editor').first();
	await content.waitFor({ state: 'visible', timeout: 20000 });
	const af = page.frames().filter(f => f.url().startsWith('vscode-webview://')).pop();
	const state = async label => {
		const s = await af.evaluate(() => {
			const ec = document.querySelector('.md-editor')?.editContext;
			return { ss: ec.selectionStart, se: ec.selectionEnd, around: ec.text.slice(Math.max(0, ec.selectionStart - 12), ec.selectionStart) + '|' + ec.text.slice(ec.selectionStart, ec.selectionStart + 12) };
		});
		console.log(label, JSON.stringify(s));
	};
	await af.evaluate(() => { window.__msgs = []; window.addEventListener('message', e => { const d = e.data; if (d && typeof d === 'object' && d.type && d.type !== 'highlightResult') { window.__msgs.push({ t: d.type, epoch: d.editEpoch, len: typeof d.content === 'string' ? d.content.length : undefined, at: Math.round(performance.now()) }); } }); });
	await content.getByText('First line of the note.').click();
	await sleep(500);
	await page.keyboard.press('Control+End');
	await page.keyboard.type('Typed by the smoke gate.', { delay: Number(process.argv[2] ?? 50) });
	await sleep(1500);
	const shown = await af.evaluate(() => document.querySelector('.md-editor').editContext.text);
	await page.keyboard.press('Control+s');
	await sleep(1500);
	console.log('msgs', JSON.stringify(await af.evaluate(() => window.__msgs)));
	console.log('shown', JSON.stringify(shown));
	console.log('disk ', JSON.stringify(readFileSync(note, 'utf8')));} catch (e) {
	console.error(e);
} finally {
	try { await browser?.close(); } catch { }
	spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
}

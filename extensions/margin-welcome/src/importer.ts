/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// First boot step 2: copy editor settings and keyboard shortcuts from VS Code (and forks).
// One way and non-destructive: the source files are only read, never written.

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { parseJsonc } from './jsonc';

interface SourceDef {
	id: string;
	/** Folder under %APPDATA%. */
	folder: string;
	/** Product name shown in "Copy from {0}". Not localized (product names). */
	name: string;
}

const SOURCE_DEFS: SourceDef[] = [
	{ id: 'code', folder: 'Code', name: 'VS Code' },
	{ id: 'code-insiders', folder: 'Code - Insiders', name: 'VS Code Insiders' },
	{ id: 'vscodium', folder: 'VSCodium', name: 'VSCodium' },
	{ id: 'cursor', folder: 'Cursor', name: 'Cursor' },
	{ id: 'windsurf', folder: 'Windsurf', name: 'Windsurf' },
];

export interface SourceInfo {
	id: string;
	name: string;
	userDir: string;
}

export interface KeybindingEntry {
	key: string;
	command: string;
	when?: string;
	args?: unknown;
}

export interface ImportPlan {
	source: SourceInfo;
	settings: { key: string; value: unknown }[];
	keybindings: KeybindingEntry[];
	skipped: { item: string; reason: string }[];
	unreadable: string[];
}

/** Settings a user may bring over. Everything else is left behind. */
const ALLOWED_PREFIXES = ['editor.', 'files.', 'search.', '[', 'diffEditor.ignoreTrimWhitespace', 'terminal.integrated.fontSize', 'terminal.integrated.fontFamily', 'terminal.integrated.fontWeight', 'terminal.integrated.lineHeight', 'terminal.integrated.cursorStyle', 'terminal.integrated.cursorBlinking', 'keyboard.dispatch'];

/** Never copied (FIRST-BOOT section 4): Tacet owns the look and the writing layout. */
const DENIED_KEYS = new Set([
	'workbench.colorTheme', 'workbench.iconTheme', 'workbench.productIconTheme', 'workbench.statusBar.visible',
	'workbench.preferredLightColorTheme', 'workbench.preferredDarkColorTheme', 'window.autoDetectColorScheme',
]);

/** Setting keys that fight the writing layout (Code view line numbers are a first-boot Extra). */
const DENIED_PREFIXES = ['editor.minimap', 'editor.lineNumbers', 'editor.glyphMargin', 'editor.folding', 'editor.inlineSuggest', 'editor.experimental', 'editor.stickyScroll', 'files.autoSave'];

/** Any key with one of these segments is AI, account or a removed feature (debug, tasks, git, scm, remote, sync). */
const DENIED_SEGMENTS = new Set([
	'copilot', 'chat', 'inlinechat', 'github', 'git', 'scm', 'debug', 'launch', 'tasks', 'remote', 'settingssync', 'sync',
	'account', 'accounts', 'telemetry', 'extensions', 'ai', 'mcp', 'agent', 'agents', 'notebook', 'testing', 'update',
]);

const DENIED_COMMAND = /^(github\.|copilot|workbench\.action\.chat|inlineChat|chat\.|git\.|scm\.|debug\.|workbench\.action\.debug|remote)/i;

export function findSources(appData: string | undefined): SourceInfo[] {
	if (!appData) {
		return [];
	}
	const found: SourceInfo[] = [];
	for (const def of SOURCE_DEFS) {
		const userDir = path.join(appData, def.folder, 'User');
		try {
			if (fs.statSync(userDir).isDirectory()) {
				found.push({ id: def.id, name: def.name, userDir });
			}
		} catch {
			// not installed
		}
	}
	return found;
}

function readJsonc(file: string): { value: unknown; state: 'ok' | 'missing' | 'unreadable' } {
	let text: string;
	try {
		text = fs.readFileSync(file, 'utf8');
	} catch {
		return { value: undefined, state: 'missing' };
	}
	if (!text.trim()) {
		return { value: undefined, state: 'ok' };
	}
	const value = parseJsonc(text);
	return value === undefined ? { value, state: 'unreadable' } : { value, state: 'ok' };
}

function isRegistered(key: string): boolean {
	return vscode.workspace.getConfiguration().inspect(key)?.defaultValue !== undefined;
}

/** Why a settings key is not copied, or undefined when it is. */
function settingSkipReason(key: string): string | undefined {
	if (DENIED_KEYS.has(key) || DENIED_PREFIXES.some(p => key.startsWith(p))) {
		return vscode.l10n.t('Tacet sets this itself.');
	}
	if (key.split('.').some(seg => DENIED_SEGMENTS.has(seg.toLowerCase()))) {
		return vscode.l10n.t('Not part of Tacet.');
	}
	if (!ALLOWED_PREFIXES.some(p => key.startsWith(p))) {
		return vscode.l10n.t('Not an editor setting.');
	}
	if (!isRegistered(key)) {
		return vscode.l10n.t('Tacet does not have this setting.');
	}
	return undefined;
}

export function planImport(source: SourceInfo, commands: Set<string>): ImportPlan {
	const plan: ImportPlan = { source, settings: [], keybindings: [], skipped: [], unreadable: [] };

	const settings = readJsonc(path.join(source.userDir, 'settings.json'));
	if (settings.state === 'unreadable') {
		plan.unreadable.push('settings.json');
	}
	if (settings.value && typeof settings.value === 'object' && !Array.isArray(settings.value)) {
		for (const [key, value] of Object.entries(settings.value as Record<string, unknown>)) {
			if (key.startsWith('[')) {
				// Language block, e.g. "[markdown]": keep only the allowed keys inside it.
				if (!value || typeof value !== 'object' || Array.isArray(value)) {
					continue;
				}
				const kept: Record<string, unknown> = {};
				for (const [inner, innerValue] of Object.entries(value as Record<string, unknown>)) {
					const reason = settingSkipReason(inner);
					if (reason) {
						plan.skipped.push({ item: `${key} ${inner}`, reason });
					} else {
						kept[inner] = innerValue;
					}
				}
				if (Object.keys(kept).length) {
					plan.settings.push({ key, value: kept });
				}
				continue;
			}
			const reason = settingSkipReason(key);
			if (reason) {
				plan.skipped.push({ item: key, reason });
			} else {
				plan.settings.push({ key, value });
			}
		}
	}

	const keybindings = readJsonc(path.join(source.userDir, 'keybindings.json'));
	if (keybindings.state === 'unreadable') {
		plan.unreadable.push('keybindings.json');
	}
	if (Array.isArray(keybindings.value)) {
		for (const entry of keybindings.value as unknown[]) {
			if (!entry || typeof entry !== 'object') {
				continue;
			}
			const e = entry as Partial<KeybindingEntry>;
			if (typeof e.key !== 'string' || typeof e.command !== 'string') {
				continue;
			}
			const base = e.command.replace(/^-/, '');
			if (DENIED_COMMAND.test(base) || !commands.has(base)) {
				plan.skipped.push({ item: `${e.key} ${e.command}`, reason: vscode.l10n.t('Tacet does not have this command.') });
				continue;
			}
			const kept: KeybindingEntry = { key: e.key, command: e.command };
			if (typeof e.when === 'string') {
				kept.when = e.when;
			}
			if (e.args !== undefined) {
				kept.args = e.args;
			}
			plan.keybindings.push(kept);
		}
	}
	return plan;
}

export interface ImportResult {
	shortcuts: number;
	settings: number;
	notApplied: number;
	report: string;
}

/** Applies the plan to Tacet's user settings and keybindings. Never touches the source files. */
export async function applyImport(plan: ImportPlan, userDir: string, withShortcuts: boolean, withSettings: boolean): Promise<ImportResult> {
	const copiedSettings: string[] = [];
	const failed: { item: string; reason: string }[] = [];
	if (withSettings) {
		const config = vscode.workspace.getConfiguration();
		for (const { key, value } of plan.settings) {
			try {
				let next = value;
				if (key.startsWith('[')) {
					const current = config.inspect(key)?.globalValue;
					next = { ...(current && typeof current === 'object' ? current as object : {}), ...(value as object) };
				}
				await config.update(key, next, vscode.ConfigurationTarget.Global);
				copiedSettings.push(key);
			} catch (error) {
				failed.push({ item: key, reason: error instanceof Error ? error.message : String(error) });
			}
		}
	}

	let copiedShortcuts: KeybindingEntry[] = [];
	if (withShortcuts && plan.keybindings.length) {
		try {
			appendKeybindings(path.join(userDir, 'keybindings.json'), plan.keybindings);
			copiedShortcuts = plan.keybindings;
		} catch (error) {
			failed.push({ item: 'keybindings.json', reason: error instanceof Error ? error.message : String(error) });
		}
	}

	const notApplied = plan.skipped.length + failed.length;
	const lines: string[] = [
		`# ${vscode.l10n.t('Import report')}`,
		'',
		vscode.l10n.t('Source: {0}', plan.source.userDir),
		'',
		`## ${vscode.l10n.t('Copied settings ({0})', copiedSettings.length)}`,
		...copiedSettings.map(k => `- \`${k}\``),
		'',
		`## ${vscode.l10n.t('Copied shortcuts ({0})', copiedShortcuts.length)}`,
		...copiedShortcuts.map(k => `- \`${k.key}\` ${k.command}`),
		'',
		`## ${vscode.l10n.t('Not copied ({0})', notApplied)}`,
		...[...plan.skipped, ...failed].map(s => `- \`${s.item}\`: ${s.reason}`),
	];
	if (plan.unreadable.length) {
		lines.push('', vscode.l10n.t('Could not read: {0}', plan.unreadable.join(', ')));
	}
	return { shortcuts: copiedShortcuts.length, settings: copiedSettings.length, notApplied, report: lines.join('\n') + '\n' };
}

/** Appends entries to Tacet's user keybindings.json, keeping what is there (comments included). */
function appendKeybindings(file: string, entries: KeybindingEntry[]): void {
	const block = entries.map(e => '\t' + JSON.stringify(e)).join(',\n');
	let text = '';
	try {
		text = fs.readFileSync(file, 'utf8');
	} catch {
		// no file yet
	}
	const existing = text.trim() ? parseJsonc(text) : [];
	if (!Array.isArray(existing)) {
		throw new Error(vscode.l10n.t('Tacet keybindings.json is not a list; nothing was changed.'));
	}
	let next: string;
	if (!text.trim() || existing.length === 0 && text.lastIndexOf(']') < 0) {
		next = `// ${vscode.l10n.t('Copied from VS Code by Tacet first boot.')}\n[\n${block}\n]\n`;
	} else {
		const close = text.lastIndexOf(']');
		const head = text.slice(0, close).replace(/\s*$/, '');
		const sep = existing.length ? ',' : '';
		next = `${head}${sep}\n${block}\n${text.slice(close)}`;
	}
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, next, 'utf8');
}

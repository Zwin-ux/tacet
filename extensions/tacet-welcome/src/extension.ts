/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Mazen Zwin and Tacet contributors. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Tacet first boot (tacet/design/FIRST-BOOT.md). A React + Animate UI webview that runs once on
// the first launch. Each step writes only its own settings when the user continues; Skip writes
// nothing except the completion flag.

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { applyImport, findSources, planImport, type SourceInfo } from './importer';
import { notesLocations, type NotesLocations } from './notes';

type ThemeChoice = 'system' | 'light' | 'dark';
type NotesChoice = 'documents' | 'local' | 'custom';
interface Extras { statusBar: boolean; lineNumbers: boolean; terminal: boolean; spelling: boolean }

type FromWebview =
	| { type: 'ready' }
	| { type: 'previewTheme'; theme: ThemeChoice }
	| { type: 'commitLook'; theme: ThemeChoice; fontSize: number }
	| { type: 'commitImport'; sourceId: string | null; shortcuts: boolean; settings: boolean }
	| { type: 'pickFolder' }
	| { type: 'commitNotes'; choice: NotesChoice; path: string }
	| { type: 'commitExtras'; extras: Extras }
	| { type: 'done'; how: 'finish' | 'skip' };

/** Completion flag (FIRST-BOOT section 9). */
const COMPLETED_KEY = 'tacet.firstBoot.completed';
const REPORT_KEY = 'tacet.firstBoot.importReport';
/** Set to "off" to never show the first boot automatically (harnesses that launch a bare window). */
const ENV_OFF = 'TACET_FIRST_BOOT';

const DEFAULT_FONT_SIZE = 17;
const LIGHT_CANDIDATES = ['Tacet Light', 'Light Modern', 'Default Light Modern'];
const DARK_CANDIDATES = ['Tacet Dark', 'Dark Modern', 'Default Dark Modern'];
const THEME_KEYS = ['workbench.colorTheme', 'window.autoDetectColorScheme', 'workbench.preferredLightColorTheme', 'workbench.preferredDarkColorTheme'];

const EXTRA_KEYS: Record<keyof Extras, string> = {
	statusBar: 'workbench.statusBar.visible',
	lineNumbers: 'tacet.code.lineNumbers',
	terminal: 'tacet.terminal.shortcut',
	spelling: 'tacet.spelling.enabled',
};

let current: FirstBoot | undefined;

export function activate(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		vscode.commands.registerCommand('tacet.firstBoot.show', () => FirstBoot.show(context, false)),
		vscode.commands.registerCommand('tacet.firstBoot.showImportReport', () => showImportReport(context)),
	);
	if (!context.globalState.get<boolean>(COMPLETED_KEY) && process.env[ENV_OFF] !== 'off' && !openedWithContent()) {
		FirstBoot.show(context, true);
	}
}

export function deactivate(): void { /* nothing */ }

/** A launch with a file or folder argument skips setup for that launch (FIRST-BOOT section 9). */
function openedWithContent(): boolean {
	if (vscode.workspace.workspaceFolders?.length) {
		return true;
	}
	return vscode.window.tabGroups.all.some(g => g.tabs.some(isFileTab));
}

function isFileTab(tab: vscode.Tab): boolean {
	const input = tab.input as { uri?: vscode.Uri } | undefined;
	return !!input?.uri && input.uri.scheme === 'file';
}

async function showImportReport(context: vscode.ExtensionContext): Promise<void> {
	const report = context.globalState.get<string>(REPORT_KEY);
	if (!report) {
		vscode.window.showInformationMessage(vscode.l10n.t('Nothing was copied from VS Code.'));
		return;
	}
	const doc = await vscode.workspace.openTextDocument({ content: report, language: 'markdown' });
	await vscode.window.showTextDocument(doc);
}

class FirstBoot {
	private readonly disposables: vscode.Disposable[] = [];
	private sources: SourceInfo[] = [];
	private commands: Set<string> | undefined;
	/** Theme values last confirmed with Continue; a skip restores them after a live preview. */
	private themeBaseline = new Map<string, unknown>();
	private themePreviewed = false;
	private notesFolder: string | undefined;
	private initialExtras: Extras = { statusBar: false, lineNumbers: false, terminal: false, spelling: false };
	private interacted = false;
	private queue: Promise<void> = Promise.resolve();
	private finished = false;

	static async show(context: vscode.ExtensionContext, auto: boolean): Promise<void> {
		if (current) {
			current.panel.reveal();
			return;
		}
		const media = vscode.Uri.joinPath(context.extensionUri, 'media');
		// Create the panel first so the webview starts loading while the init data is gathered.
		const panel = vscode.window.createWebviewPanel('tacet.firstBoot', vscode.l10n.t('Setup'), vscode.ViewColumn.One, {
			enableScripts: true,
			localResourceRoots: [media],
			retainContextWhenHidden: true,
		});
		current = new FirstBoot(context, panel, media, auto);
		await current.init();
	}

	private constructor(
		private readonly context: vscode.ExtensionContext,
		readonly panel: vscode.WebviewPanel,
		private readonly media: vscode.Uri,
		auto: boolean,
	) {
		// Shelf, panel and secondary side bar closed: the page is the whole window (FIRST-BOOT section 2).
		for (const command of ['workbench.action.closeSidebar', 'workbench.action.closePanel', 'workbench.action.closeAuxiliaryBar']) {
			vscode.commands.executeCommand(command).then(undefined, () => undefined);
		}
		this.disposables.push(
			panel.onDidDispose(() => this.onDisposed()),
			// Messages are handled one at a time, in order (theme previews can arrive in quick bursts).
			panel.webview.onDidReceiveMessage((m: FromWebview) => { this.queue = this.queue.then(() => this.onMessage(m)).catch(() => undefined); }),
			vscode.workspace.onDidChangeConfiguration(e => {
				if (e.affectsConfiguration('workbench.reduceMotion')) {
					panel.webview.postMessage({ type: 'reduceMotion', value: reduceMotion() });
				}
			}),
		);
		if (auto) {
			// The extension host can start before a file argument's editor opens. If one opens before
			// the user touches setup, this launch had a file: leave quietly and ask again next launch.
			const watch = vscode.window.tabGroups.onDidChangeTabs(e => {
				if (!this.interacted && e.opened.some(isFileTab)) {
					this.panel.dispose();
				}
			});
			this.disposables.push(watch);
			setTimeout(() => watch.dispose(), 8000);
		}
	}

	private async init(): Promise<void> {
		const config = vscode.workspace.getConfiguration();
		for (const key of THEME_KEYS) {
			this.themeBaseline.set(key, config.inspect(key)?.globalValue);
		}
		for (const k of Object.keys(EXTRA_KEYS) as (keyof Extras)[]) {
			this.initialExtras[k] = config.inspect(EXTRA_KEYS[k])?.globalValue === true;
		}
		this.sources = findSources(process.env.APPDATA);
		const [notes, commands] = await Promise.all([notesLocations(), vscode.commands.getCommands(false)]);
		this.commands = new Set(commands);
		this.panel.webview.html = this.render(this.initData(notes));
	}

	private initData(notes: NotesLocations) {
		const config = vscode.workspace.getConfiguration();
		const t = vscode.l10n.t;
		const autoDetect = config.inspect<boolean>('window.autoDetectColorScheme')?.globalValue;
		const colorTheme = config.inspect<string>('workbench.colorTheme')?.globalValue;
		const theme: ThemeChoice = autoDetect ? 'system' : colorTheme && DARK_CANDIDATES.includes(colorTheme) ? 'dark' : colorTheme && LIGHT_CANDIDATES.includes(colorTheme) ? 'light' : 'system';
		const folder = config.inspect<string>('tacet.notes.folder')?.globalValue;
		const choice: NotesChoice = !folder || folder === notes.documentsNotes ? 'documents' : folder === notes.localNotes && notes.oneDrive ? 'local' : 'custom';

		return {
			strings: {
				stepOf: t('{0} of {1}', '{0}', '{1}'),
				stepAnnounce: t('Step {0} of {1}.', '{0}', '{1}'),
				continue: t('Continue'),
				enter: t('Enter'),
				back: t('Back'),
				skip: t('Skip setup'),
				esc: t('Esc'),
				lookHeading: 'Tacet',
				lookLine: t('Choose how the page looks. You can change this later in Settings.'),
				theme: t('Theme'),
				system: t('System'),
				light: t('Light'),
				dark: t('Dark'),
				textSize: t('Text size'),
				decrease: t('Smaller text'),
				increase: t('Larger text'),
				reset: t('Reset'),
				sample: t('Leave the phone in the kitchen. Open the window.'),
				importHeading: t('Use your VS Code settings?'),
				importLine: t('Tacet can copy your keyboard shortcuts and editor settings. Your VS Code files do not change.'),
				defaults: t('Start with Tacet defaults'),
				shortcuts: t('Keyboard shortcuts'),
				editorSettings: t('Editor settings'),
				noExtensions: t('Tacet does not copy extensions.'),
				copyAndContinue: t('Copy and continue'),
				notesHeading: t('Where your notes live'),
				notesLine: t('New notes are drafts. Tacet keeps them safe until you save them to a folder.'),
				notesDocuments: t('Notes folder in Documents'),
				willCreate: t('Tacet makes this folder'),
				oneDriveLine: t('Documents is synced by OneDrive. Your notes will sync too.'),
				notesLocal: t('Keep notes only on this PC'),
				notesCustom: t('A folder I choose'),
				chooseFolder: t('Choose Folder…'),
				extrasHeading: t('Extras'),
				extrasLine: t('All are off. You can turn them on later in Settings.'),
				statusLine: t('Show a status line'),
				lineNumbers: t('Show line numbers in Code view'),
				terminal: process.platform === 'darwin' ? t('Open a terminal with Control-`') : t('Open a terminal with Ctrl+`'),
				spelling: t('Check spelling'),
				startWriting: t('Start writing'),
			},
			theme,
			fontSize: config.inspect<number>('tacet.document.fontSize')?.globalValue ?? DEFAULT_FONT_SIZE,
			sources: this.sources.map(source => {
				const plan = planImport(source, this.commands ?? new Set());
				let preview = t('{0} shortcuts and {1} settings can be copied. {2} do not apply.', plan.keybindings.length, plan.settings.length, plan.skipped.length);
				if (plan.unreadable.length) {
					preview += ' ' + t('Could not read {0}.', plan.unreadable.join(', '));
				}
				return { id: source.id, label: t('Copy from {0}', source.name), path: source.userDir, preview };
			}),
			notes: {
				documentsPath: notes.documentsNotes,
				documentsExists: notes.documentsNotesExists,
				oneDrive: notes.oneDrive,
				localPath: notes.localNotes,
				localExists: notes.localNotesExists,
				choice,
				customPath: choice === 'custom' ? folder : undefined,
			},
			extras: this.initialExtras,
			reduceMotion: reduceMotion(),
		};
	}

	private async onMessage(m: FromWebview): Promise<void> {
		if (m.type !== 'ready') {
			this.interacted = true;
		}
		const config = vscode.workspace.getConfiguration();
		const global = vscode.ConfigurationTarget.Global;
		switch (m.type) {
			case 'previewTheme':
				this.themePreviewed = true;
				await applyTheme(m.theme);
				break;
			case 'commitLook': {
				await applyTheme(m.theme);
				for (const key of THEME_KEYS) {
					this.themeBaseline.set(key, config.inspect(key)?.globalValue);
				}
				this.themePreviewed = false;
				const size = Math.round(Math.min(28, Math.max(12, m.fontSize)));
				const stored = config.inspect<number>('tacet.document.fontSize')?.globalValue;
				if (size !== (stored ?? DEFAULT_FONT_SIZE)) {
					await config.update('tacet.document.fontSize', size === DEFAULT_FONT_SIZE ? undefined : size, global);
				}
				break;
			}
			case 'commitImport': {
				const source = this.sources.find(s => s.id === m.sourceId);
				let line = '';
				if (source && (m.shortcuts || m.settings)) {
					const plan = planImport(source, this.commands ?? new Set(await vscode.commands.getCommands(false)));
					const result = await applyImport(plan, userDir(this.context), m.shortcuts, m.settings);
					await this.context.globalState.update(REPORT_KEY, result.report);
					line = vscode.l10n.t('Copied {0} shortcuts and {1} settings. {2} do not apply.', result.shortcuts, result.settings, result.notApplied);
				}
				this.panel.webview.postMessage({ type: 'importResult', line });
				break;
			}
			case 'pickFolder': {
				const picked = await vscode.window.showOpenDialog({
					canSelectFolders: true,
					canSelectFiles: false,
					canSelectMany: false,
					openLabel: vscode.l10n.t('Use This Folder'),
					title: vscode.l10n.t('Where your notes live'),
				});
				// fsPath lower-cases the drive letter; show and store it the way Explorer does.
				const fsPath = picked?.[0]?.fsPath.replace(/^[a-z](?=:)/, d => d.toUpperCase()) ?? null;
				this.panel.webview.postMessage({ type: 'folderPicked', path: fsPath });
				break;
			}
			case 'commitNotes':
				if (m.path && path.isAbsolute(m.path)) {
					await config.update('tacet.notes.folder', m.path, global);
					this.notesFolder = m.path;
				}
				break;
			case 'commitExtras':
				for (const k of Object.keys(EXTRA_KEYS) as (keyof Extras)[]) {
					const on = m.extras[k] === true;
					if (on !== this.initialExtras[k]) {
						await config.update(EXTRA_KEYS[k], on ? true : undefined, global);
					}
				}
				break;
			case 'done':
				await this.finish(m.how);
				break;
		}
	}

	private async finish(how: 'finish' | 'skip'): Promise<void> {
		if (this.finished) {
			return;
		}
		this.finished = true;
		if (how === 'skip') {
			await this.revertPreview();
		}
		await this.context.globalState.update(COMPLETED_KEY, true);
		if (this.notesFolder) {
			// The Notes folder is made when setup finishes, never earlier (FIRST-BOOT section 5).
			try {
				fs.mkdirSync(this.notesFolder, { recursive: true });
			} catch {
				// Save will ask for a folder; nothing else depends on it.
			}
		}
		this.panel.dispose();
		// Landing: a new draft with the caret ready.
		await vscode.commands.executeCommand('workbench.action.files.newUntitledFile');
		await vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup');
	}

	private async revertPreview(): Promise<void> {
		if (!this.themePreviewed) {
			return;
		}
		this.themePreviewed = false;
		const config = vscode.workspace.getConfiguration();
		for (const key of THEME_KEYS) {
			if (config.inspect(key)?.globalValue !== this.themeBaseline.get(key)) {
				await config.update(key, this.themeBaseline.get(key), vscode.ConfigurationTarget.Global);
			}
		}
	}

	private onDisposed(): void {
		if (!this.finished) {
			// Closed mid-setup: confirmed choices stay, an unconfirmed theme preview does not.
			this.revertPreview().then(undefined, () => undefined);
		}
		vscode.Disposable.from(...this.disposables).dispose();
		current = undefined;
	}

	private render(init: unknown): string {
		const webview = this.panel.webview;
		const nonce = makeNonce();
		const script = webview.asWebviewUri(vscode.Uri.joinPath(this.media, 'welcome.js'));
		const style = webview.asWebviewUri(vscode.Uri.joinPath(this.media, 'welcome.css'));
		const csp = [
			`default-src 'none'`,
			`style-src ${webview.cspSource}`,
			`img-src ${webview.cspSource} data:`,
			`script-src 'nonce-${nonce}'`,
		].join('; ');
		// JSON in a non-executing script block; "<" is escaped so the data cannot end the block.
		const data = JSON.stringify(init).replace(/</g, '\\u003c');
		return `<!DOCTYPE html>
<html lang="${vscode.env.language}">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="Content-Security-Policy" content="${csp}">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="stylesheet" href="${style}">
	<title>${vscode.l10n.t('Setup')}</title>
</head>
<body>
	<div id="root"></div>
	<script id="tacet-init" type="application/json">${data}</script>
	<script type="module" nonce="${nonce}" src="${script}"></script>
</body>
</html>`;
	}
}

function reduceMotion(): 'on' | 'off' | 'auto' {
	const value = vscode.workspace.getConfiguration('workbench').get<string>('reduceMotion');
	return value === 'on' || value === 'off' ? value : 'auto';
}

/** Tacet's user folder (settings.json, keybindings.json): globalStorage is <User>/globalStorage/<id>. */
function userDir(context: vscode.ExtensionContext): string {
	return path.dirname(path.dirname(context.globalStorageUri.fsPath));
}

/** Theme ids contributed by installed extensions (ids are what workbench.colorTheme stores). */
function installedThemeIds(): Set<string> {
	const ids = new Set<string>();
	for (const ext of vscode.extensions.all) {
		const themes = ext.packageJSON?.contributes?.themes;
		if (Array.isArray(themes)) {
			for (const t of themes) {
				if (typeof t?.id === 'string') {
					ids.add(t.id);
				}
				if (typeof t?.label === 'string') {
					ids.add(t.label);
				}
			}
		}
	}
	return ids;
}

function pick(candidates: string[], installed: Set<string>): string {
	return candidates.find(c => installed.has(c)) ?? candidates[candidates.length - 1];
}

/** FIRST-BOOT section 3 writes. Contrast Themes still win (window.autoDetectHighContrast is untouched). */
async function applyTheme(choice: ThemeChoice): Promise<void> {
	const installed = installedThemeIds();
	const light = pick(LIGHT_CANDIDATES, installed);
	const dark = pick(DARK_CANDIDATES, installed);
	const target = vscode.ConfigurationTarget.Global;
	const workbench = vscode.workspace.getConfiguration('workbench');
	const win = vscode.workspace.getConfiguration('window');
	if (choice === 'system') {
		await workbench.update('preferredLightColorTheme', light, target);
		await workbench.update('preferredDarkColorTheme', dark, target);
		await win.update('autoDetectColorScheme', true, target);
		return;
	}
	await win.update('autoDetectColorScheme', false, target);
	await workbench.update('colorTheme', choice === 'dark' ? dark : light, target);
}

function makeNonce(): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let out = '';
	for (let i = 0; i < 32; i++) {
		out += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return out;
}

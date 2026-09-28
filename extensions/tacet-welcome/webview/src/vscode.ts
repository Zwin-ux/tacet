/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Mazen Zwin and Tacet contributors. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Host bridge and the message contract shared with src/extension.ts (keep both in sync).

export type ThemeChoice = 'system' | 'light' | 'dark';
export type NotesChoice = 'documents' | 'local' | 'custom';
export type ReduceMotion = 'on' | 'off' | 'auto';

export interface Extras {
	statusBar: boolean;
	lineNumbers: boolean;
	terminal: boolean;
	spelling: boolean;
}

export interface ImportSource {
	id: string;
	/** "Copy from VS Code" etc., already localized. */
	label: string;
	path: string;
	/** "42 shortcuts and 18 settings can be copied. 6 do not apply." */
	preview: string;
}

export interface NotesInfo {
	documentsPath: string;
	documentsExists: boolean;
	oneDrive: boolean;
	localPath: string;
	localExists: boolean;
	choice: NotesChoice;
	customPath?: string;
}

/** All user-visible strings, localized by the host with vscode.l10n. */
export interface Strings {
	[key: string]: string;
}

export interface InitData {
	strings: Strings;
	theme: ThemeChoice;
	fontSize: number;
	sources: ImportSource[];
	notes: NotesInfo;
	extras: Extras;
	reduceMotion: ReduceMotion;
}

export type ToHost =
	| { type: 'ready' }
	| { type: 'previewTheme'; theme: ThemeChoice }
	| { type: 'commitLook'; theme: ThemeChoice; fontSize: number }
	| { type: 'commitImport'; sourceId: string | null; shortcuts: boolean; settings: boolean }
	| { type: 'pickFolder' }
	| { type: 'commitNotes'; choice: NotesChoice; path: string }
	| { type: 'commitExtras'; extras: Extras }
	| { type: 'done'; how: 'finish' | 'skip' };

export type FromHost =
	| { type: 'importResult'; line: string }
	| { type: 'folderPicked'; path: string | null }
	| { type: 'reduceMotion'; value: ReduceMotion };

type VsCodeApi = { postMessage(message: unknown): void };
declare global {
	interface Window { acquireVsCodeApi?: () => VsCodeApi }
}

const api: VsCodeApi | undefined = typeof window.acquireVsCodeApi === 'function' ? window.acquireVsCodeApi() : undefined;

export function post(message: ToHost): void {
	if (api) {
		api.postMessage(message);
	} else {
		console.log('[tacet-welcome] (no host)', message);
	}
}

export function onHostMessage(handler: (message: FromHost) => void): () => void {
	const listener = (event: MessageEvent) => handler(event.data as FromHost);
	window.addEventListener('message', listener);
	return () => window.removeEventListener('message', listener);
}

/** English strings for the dev server only; in the product every string comes from the host (vscode.l10n). */
const DEV_STRINGS: Strings = {
	stepOf: '{0} of {1}', stepAnnounce: 'Step {0} of {1}.', continue: 'Continue', enter: 'Enter', back: 'Back', skip: 'Skip setup', esc: 'Esc',
	lookHeading: 'Tacet', lookLine: 'Choose how the page looks. You can change this later in Settings.', theme: 'Theme', system: 'System',
	light: 'Light', dark: 'Dark', textSize: 'Text size', decrease: 'Smaller text', increase: 'Larger text', reset: 'Reset',
	sample: 'Leave the phone in the kitchen. Open the window.', importHeading: 'Use your VS Code settings?',
	importLine: 'Tacet can copy your keyboard shortcuts and editor settings. Your VS Code files do not change.',
	defaults: 'Start with Tacet defaults', shortcuts: 'Keyboard shortcuts', editorSettings: 'Editor settings',
	noExtensions: 'Tacet does not copy extensions.', copyAndContinue: 'Copy and continue', notesHeading: 'Where your notes live',
	notesLine: 'New notes are drafts. Tacet keeps them safe until you save them to a folder.', notesDocuments: 'Notes folder in Documents',
	willCreate: 'Tacet makes this folder', oneDriveLine: 'Documents is synced by OneDrive. Your notes will sync too.',
	notesLocal: 'Keep notes only on this PC', notesCustom: 'A folder I choose', chooseFolder: 'Choose Folder…', extrasHeading: 'Extras',
	extrasLine: 'All are off. You can turn them on later in Settings.', statusLine: 'Show a status line',
	lineNumbers: 'Show line numbers in Code view', terminal: 'Open a terminal with Ctrl+`', spelling: 'Check spelling', startWriting: 'Start writing',
};

/** Reads the init block the host renders into the page, so the first frame needs no round trip. */
export function readInit(): InitData {
	const el = document.getElementById('tacet-init');
	if (el?.textContent) {
		return JSON.parse(el.textContent) as InitData;
	}
	// Dev server (npm run dev) without a host: English defaults.
	return {
		strings: DEV_STRINGS,
		theme: 'system',
		fontSize: 17,
		sources: [{ id: 'code', label: 'Copy from VS Code', path: 'C:\\Users\\Alex\\AppData\\Roaming\\Code\\User', preview: '42 shortcuts and 18 settings can be copied. 6 do not apply.' }],
		notes: { documentsPath: 'C:\\Users\\Alex\\Documents\\Notes', documentsExists: false, oneDrive: true, localPath: 'C:\\Users\\Alex\\Tacet', localExists: false, choice: 'documents' },
		extras: { statusBar: false, lineNumbers: false, terminal: false, spelling: false },
		reduceMotion: 'auto',
	};
}

/** Mirror the VS Code webview body class onto <html class="dark">. */
export function syncDarkClass(): void {
	const apply = () => {
		const b = document.body.classList;
		const dark = b.contains('vscode-dark') || b.contains('vscode-high-contrast');
		document.documentElement.classList.toggle('dark', dark);
	};
	apply();
	new MutationObserver(apply).observe(document.body, { attributes: true, attributeFilter: ['class'] });
}

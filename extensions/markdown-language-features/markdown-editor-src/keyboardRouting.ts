/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { commands, vscodeKeyboardProfile, type EditorControllerOptions, type KeyboardPlatform } from '@vscode/markdown-editor';

/**
 * Keyboard routing for the Markdown editor webview.
 *
 * Margin: every editor chord (cursor movement, Enter, Backspace, Delete, undo, ...)
 * runs synchronously in the webview, in the same event order as typed text.
 *
 * The upstream wiring forwarded these chords to the workbench keybinding service,
 * which ran the command in the extension host and posted it back to the webview.
 * Typed characters are applied locally and at once, so a chord's command landed
 * after the keystrokes that followed it: `Ctrl+End` then typing wrote the first
 * character at the old caret and the rest at the end of the document
 * (`note.T\nyped ...`); a fast `Enter` or `Backspace` split or deleted in the wrong
 * place. Handling the chords locally keeps one ordered input stream. The host
 * commands stay registered for the Command Palette and menus, and undo/redo still
 * run against the TextDocument's history through the history strategy.
 */
export const webviewKeyboardRouting: Pick<EditorControllerOptions, 'keyboardProfile' | 'forwardedKeyboardProfile'> = {
	keyboardProfile: vscodeKeyboardProfile,
	forwardedKeyboardProfile: undefined,
};

/** The subset of a keyboard event that identifies a chord. */
export interface KeyChord {
	readonly key: string;
	readonly ctrlKey: boolean;
	readonly shiftKey: boolean;
	readonly altKey: boolean;
	readonly metaKey: boolean;
}

/** Returns the keyboard platform for a user agent string. */
export function keyboardPlatformOf(userAgent: string): KeyboardPlatform {
	return /Macintosh|Mac OS X/.test(userAgent) ? 'macos' : userAgent.includes('Windows') ? 'windows' : 'linux';
}

/** Whether the chord runs "move to visual line end" (End, Shift+End, Cmd+Right on macOS). */
export function isVisualLineEndChord(chord: KeyChord, platform: KeyboardPlatform): boolean {
	return commands.some(command => command.action.kind === 'cursor'
		&& command.action.command === 'visualLineEnd'
		&& command.keybindings.some(binding => binding.key === chord.key
			&& (!binding.platforms || binding.platforms.includes(platform))
			&& !!binding.modifiers?.ctrl === chord.ctrlKey
			&& !!binding.modifiers?.shift === chord.shiftKey
			&& !!binding.modifiers?.alt === chord.altKey
			&& !!binding.modifiers?.meta === chord.metaKey));
}

/**
 * Keeps a "line end" caret move on its own source line.
 *
 * The editor measures the end of the last visual line of a block past the block's
 * trailing line break, so `End` put the caret on the blank line after a heading,
 * paragraph or list item and the next keystroke started a new line
 * (`# Smoke note\ny`). A line-end move never crosses a line break: when the move
 * from `from` to `to` passes one, the caret stops before it.
 */
export function clampLineEndMove(text: string, from: number, to: number): number {
	if (to <= from) {
		return to;
	}
	const lineBreak = text.indexOf('\n', from);
	if (lineBreak === -1 || lineBreak >= to) {
		return to;
	}
	return lineBreak > from && text[lineBreak - 1] === '\r' ? lineBreak - 1 : lineBreak;
}

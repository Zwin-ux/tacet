/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Run: node --test markdown-editor-src/keyboardRouting.test.mts (from extensions/markdown-language-features)

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { commands } from '@vscode/markdown-editor/commands';
import type { KeyboardBinding, KeyboardPlatform } from '@vscode/markdown-editor';
import { clampLineEndMove, isVisualLineEndChord, keyboardPlatformOf, webviewKeyboardRouting, type KeyChord } from './keyboardRouting.ts';

const platforms: readonly KeyboardPlatform[] = ['windows', 'linux', 'macos'];

function sameChord(a: Omit<KeyboardBinding, 'action'>, b: Omit<KeyboardBinding, 'action'>, platform: KeyboardPlatform): boolean {
	return a.key === b.key
		&& (!a.platforms || a.platforms.includes(platform))
		&& (!b.platforms || b.platforms.includes(platform))
		&& !!a.modifiers?.ctrl === !!b.modifiers?.ctrl
		&& !!a.modifiers?.shift === !!b.modifiers?.shift
		&& !!a.modifiers?.alt === !!b.modifiers?.alt
		&& !!a.modifiers?.meta === !!b.modifiers?.meta;
}

describe('Markdown editor webview keyboard routing', () => {
	// Regression (Margin R3): chords routed through the host arrive after the text typed
	// behind them, so Ctrl+End + typing split the text ('note.T\nyped ...').
	it('handles every editor chord in the webview and forwards none to the host', () => {
		const bindings = webviewKeyboardRouting.keyboardProfile?.bindings ?? [];
		const notLocal: string[] = [];
		for (const command of commands) {
			for (const chord of command.keybindings) {
				for (const platform of platforms) {
					if (chord.platforms && !chord.platforms.includes(platform)) {
						continue;
					}
					const first = bindings.find(binding => sameChord(binding, chord, platform));
					if (!first || JSON.stringify(first.action) !== JSON.stringify(command.action)) {
						notLocal.push(`${command.id} ${platform} ${JSON.stringify(chord)}`);
					}
				}
			}
		}
		assert.deepEqual({ notLocal, forwarded: webviewKeyboardRouting.forwardedKeyboardProfile }, { notLocal: [], forwarded: undefined });
	});
});

describe('Markdown editor line-end move', () => {
	const chord = (key: string, modifiers: Partial<KeyChord> = {}): KeyChord => ({ key, ctrlKey: false, shiftKey: false, altKey: false, metaKey: false, ...modifiers });
	const note = '# Smoke note\n\nFirst line of the note.\n\n- first item\n- second item\n\nLast line of the note.\n';

	it('recognizes the line-end chords per platform', () => {
		assert.deepEqual([
			isVisualLineEndChord(chord('End'), 'windows'),
			isVisualLineEndChord(chord('End', { shiftKey: true }), 'linux'),
			isVisualLineEndChord(chord('ArrowRight', { metaKey: true }), 'macos'),
			isVisualLineEndChord(chord('End', { ctrlKey: true }), 'windows'),
			isVisualLineEndChord(chord('ArrowRight'), 'windows'),
			keyboardPlatformOf('Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
		], [true, true, true, false, false, 'windows']);
	});

	// Regression (Margin R3): End from a heading, paragraph or list item landed on the
	// blank line after the block, so typing split the block.
	it('stops before the line break it would cross', () => {
		const headingEnd = note.indexOf('\n');
		const itemEnd = note.indexOf('\n', note.indexOf('second item'));
		assert.deepEqual([
			clampLineEndMove(note, 2, headingEnd + 1),
			clampLineEndMove(note, headingEnd, headingEnd + 1),
			clampLineEndMove(note, note.indexOf('second'), itemEnd + 1),
			clampLineEndMove(note, 2, 7),
			clampLineEndMove(note, headingEnd + 1, headingEnd + 1),
			clampLineEndMove('a\r\nb', 0, 3),
			clampLineEndMove(note, 10, 4),
		], [headingEnd, headingEnd, itemEnd, 7, headingEnd + 1, 1, 4]);
	});
});

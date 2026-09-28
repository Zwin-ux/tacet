/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Mazen Zwin and Tacet contributors. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * Removes // and /* *\/ comments and trailing commas from JSONC text, keeping strings intact.
 * VS Code's settings.json and keybindings.json are JSONC.
 */
export function stripJsonc(text: string): string {
	let out = '';
	let i = 0;
	const n = text.length;
	while (i < n) {
		const ch = text[i];
		if (ch === '"') {
			const start = i++;
			while (i < n && text[i] !== '"') {
				i += text[i] === '\\' ? 2 : 1;
			}
			i++;
			out += text.slice(start, i);
		} else if (ch === '/' && text[i + 1] === '/') {
			while (i < n && text[i] !== '\n') {
				i++;
			}
		} else if (ch === '/' && text[i + 1] === '*') {
			i += 2;
			while (i < n && !(text[i] === '*' && text[i + 1] === '/')) {
				i++;
			}
			i += 2;
		} else {
			out += ch;
			i++;
		}
	}
	// Trailing commas: a comma followed only by whitespace before } or ].
	return out.replace(/,(?<space>\s*)(?<close>[}\]])/g, '$<space>$<close>');
}

/** Parses JSONC. Returns undefined for empty or invalid content (never throws). */
export function parseJsonc(text: string): unknown {
	const body = stripJsonc(text.replace(/^﻿/, '')).trim();
	if (!body) {
		return undefined;
	}
	try {
		return JSON.parse(body);
	} catch {
		return undefined;
	}
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Mazen Zwin and Tacet contributors. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Document contract D-03: the name Save As suggests for a draft. The same name is safe on
// Windows, macOS and Linux, so a note saved on one machine opens on the others.

const INVALID_CHARS = /[<>:"/\\|?*\u0000-\u001f\u007f‮]/g;
const WINDOWS_RESERVED = /^(con|prn|aux|nul|com[0-9¹²³]|lpt[0-9¹²³])$/i;
const MAX_LENGTH = 80;

/** A draft title (first line, may start with `#`) made into a file name without extension. */
export function sanitizeNoteTitle(title: string): string {
	let name = title
		.replace(/^\s*#{1,6}\s+/, '')
		.replace(INVALID_CHARS, ' ')
		.replace(/\s+/g, ' ')
		.replace(/^[\s.]+|[\s.]+$/g, ''); // leading dots hide the file; trailing dots and spaces are invalid on Windows

	name = Array.from(name).slice(0, MAX_LENGTH).join('').replace(/[\s.]+$/, '');

	if (!name) {
		return 'Untitled';
	}

	// Windows reserves these names, with or without an extension ("con", "con.txt").
	if (WINDOWS_RESERVED.test(name.split('.')[0].trimEnd())) {
		return `_${name}`;
	}

	return name;
}

/** The suggested Save As file name for a draft: sanitized title plus `.md`. */
export function suggestNoteFilename(title: string): string {
	return `${sanitizeNoteTitle(title)}.md`;
}

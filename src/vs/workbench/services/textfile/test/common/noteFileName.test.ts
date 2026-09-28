/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Mazen Zwin and Tacet contributors. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import { sanitizeNoteTitle, suggestNoteFilename } from '../../common/noteFileName.js';

suite('Tacet note file names (D-03)', () => {

	ensureNoDisposablesAreLeakedInTestSuite();

	test('plain title gets .md', () => {
		assert.strictEqual(suggestNoteFilename('Leave the phone in the kitchen'), 'Leave the phone in the kitchen.md');
	});

	test('heading markers are dropped', () => {
		assert.strictEqual(sanitizeNoteTitle('## Trip plan'), 'Trip plan');
	});

	test('invalid characters, control characters and whitespace runs', () => {
		assert.strictEqual(sanitizeNoteTitle('a<b>:c"/d\\e|f?g*h\ti'), 'a b c d e f g h i');
	});

	test('trailing dots and spaces, leading dots', () => {
		assert.strictEqual(sanitizeNoteTitle('  ..notes. . '), 'notes');
	});

	test('empty and punctuation-only titles fall back to Untitled', () => {
		assert.strictEqual(sanitizeNoteTitle(''), 'Untitled');
		assert.strictEqual(sanitizeNoteTitle(' ?*: '), 'Untitled');
		assert.strictEqual(suggestNoteFilename('...'), 'Untitled.md');
	});

	test('Windows reserved names are prefixed, also with an extension part', () => {
		assert.strictEqual(sanitizeNoteTitle('CON'), '_CON');
		assert.strictEqual(sanitizeNoteTitle('nul'), '_nul');
		assert.strictEqual(sanitizeNoteTitle('COM1'), '_COM1');
		assert.strictEqual(sanitizeNoteTitle('lpt9.txt'), '_lpt9.txt');
		assert.strictEqual(sanitizeNoteTitle('console'), 'console');
	});

	test('long titles are capped without splitting a character', () => {
		const name = sanitizeNoteTitle('\u{1F600}'.repeat(200));
		assert.strictEqual(Array.from(name).length, 80);
	});

	test('right-to-left override is removed', () => {
		assert.strictEqual(sanitizeNoteTitle('abc‮txt.exe'), 'abc txt.exe');
	});
});

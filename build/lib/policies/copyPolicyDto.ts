/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fs from 'fs';
import * as path from 'path';

const sourceFile = path.join(import.meta.dirname, '../../../src/vs/workbench/contrib/policyExport/common/policyDto.ts');
const destFile = path.join(import.meta.dirname, 'policyDto.ts');

try {
	// Margin: the policy export contribution is removed from src, so the
	// checked-in copy next to this script is the source of truth. Copy only
	// when the upstream source still exists.
	if (!fs.existsSync(sourceFile)) {
		if (!fs.existsSync(destFile)) {
			console.error(`Error: Neither ${sourceFile} nor ${destFile} exists.`);
			process.exit(1);
		}
		process.exit(0);
	}

	// Copy the file
	fs.copyFileSync(sourceFile, destFile);
} catch (error) {
	console.error(`Error copying policyDto.ts: ${(error as Error).message}`);
	process.exit(1);
}

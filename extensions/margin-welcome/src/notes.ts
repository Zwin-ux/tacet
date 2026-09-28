/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// First boot step 3: where notes live. Detects the real Documents folder and whether OneDrive
// syncs it (Known Folder Move), so the step can say so (CRITICISM.md C2).

import * as cp from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

/** Test seams: the first-boot harness sets these so tests never read the owner's registry or folders. */
export const ENV_DOCUMENTS = 'MARGIN_FIRSTBOOT_DOCUMENTS';
export const ENV_HOME = 'MARGIN_FIRSTBOOT_HOME';

export interface NotesLocations {
	documentsNotes: string;
	documentsNotesExists: boolean;
	oneDrive: boolean;
	localNotes: string;
	localNotesExists: boolean;
}

function exists(p: string): boolean {
	try {
		return fs.statSync(p).isDirectory();
	} catch {
		return false;
	}
}

function expandEnv(value: string, env: NodeJS.ProcessEnv): string {
	return value.replace(/%(?<name>[^%]+)%/g, (m, name: string) => {
		const hit = Object.keys(env).find(k => k.toLowerCase() === name.toLowerCase());
		return hit ? env[hit] ?? m : m;
	});
}

/** Documents folder: the shell folder from the registry (it follows OneDrive and redirection). */
async function documentsFolder(env: NodeJS.ProcessEnv): Promise<string> {
	if (env[ENV_DOCUMENTS]) {
		return env[ENV_DOCUMENTS]!;
	}
	const fallback = path.join(os.homedir(), 'Documents');
	if (process.platform !== 'win32') {
		return fallback;
	}
	const key = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders';
	const out = await new Promise<string>(resolve => {
		cp.execFile('reg.exe', ['query', key, '/v', 'Personal'], { windowsHide: true, timeout: 3000 }, (error, stdout) => resolve(error ? '' : stdout));
	});
	const match = /Personal\s+REG_(?:EXPAND_)?SZ\s+(?<value>.+)/.exec(out);
	return match?.groups ? expandEnv(match.groups.value.trim(), env) : fallback;
}

function isUnder(child: string, parent: string): boolean {
	const rel = path.relative(parent.toLowerCase(), child.toLowerCase());
	return rel === '' || (!!rel && !rel.startsWith('..') && !path.isAbsolute(rel));
}

/** OneDrive syncs a path when it is under one of the OneDrive roots, or under a folder named "OneDrive" / "OneDrive - Org". */
export function isOneDrivePath(p: string, env: NodeJS.ProcessEnv): boolean {
	const roots = ['OneDrive', 'OneDriveConsumer', 'OneDriveCommercial'].map(k => env[k]).filter((v): v is string => !!v);
	if (roots.some(r => isUnder(p, r))) {
		return true;
	}
	return p.split(/[\\/]/).some(seg => /^OneDrive( - .+)?$/i.test(seg));
}

export async function notesLocations(env: NodeJS.ProcessEnv = process.env): Promise<NotesLocations> {
	const documents = await documentsFolder(env);
	const documentsNotes = path.join(documents, 'Notes');
	const localNotes = path.join(env[ENV_HOME] || os.homedir(), 'Margin');
	return {
		documentsNotes,
		documentsNotesExists: exists(documentsNotes),
		oneDrive: isOneDrivePath(documents, env),
		localNotes,
		localNotesExists: exists(localNotes),
	};
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import vfs from 'vinyl-fs';
import { filter, jsonEditor } from './gulp/facade.ts';
import * as util from './util.ts';
import { getElectronVersion } from './electronVersion.ts';
import { getVersion } from './getVersion.ts';
import { downloadFeedPackage } from './azureFeed.ts';
import electron from '@vscode/gulp-electron';

type DarwinDocumentType = {
	name: string;
	role: string;
	ostypes: string[];
	extensions: string[];
	iconFile: string;
	utis?: string[];
};

const root = path.dirname(path.dirname(import.meta.dirname));
const product = JSON.parse(fs.readFileSync(path.join(root, 'product.json'), 'utf8'));
const commit = getVersion(root);
const useVersionedUpdate = process.platform === 'win32' && (product as typeof product & { win32VersionedUpdate?: boolean })?.win32VersionedUpdate;
const versionedResourcesFolder = useVersionedUpdate ? commit!.substring(0, 10) : '';

function createTemplate(input: string): (params: Record<string, string>) => string {
	return (params: Record<string, string>) => {
		return input.replace(/<%=\s*([^\s]+)\s*%>/g, (match, key) => {
			return params[key] || match;
		});
	};
}

const darwinCreditsTemplate = product.darwinCredits && createTemplate(fs.readFileSync(path.join(root, product.darwinCredits), 'utf8'));

/**
 * Tacet is a notes app: it owns Markdown and plain text (role `Editor`) and is only offered for a
 * short list of text-ish types (role `Viewer`, which Launch Services ranks below `Editor`).
 * `@vscode/gulp-electron` cannot emit `LSHandlerRank`, so `Viewer` stands in for `Alternate`.
 */
function darwinBundleDocumentType(name: string, extensions: string[], icon: string, role: 'Editor' | 'Viewer', utis?: string[]): DarwinDocumentType {
	return {
		name,
		role,
		ostypes: ['TEXT', 'utxt', 'TUTX'],
		extensions,
		iconFile: 'resources/darwin/' + icon + '.icns',
		utis
	};
}

const { electronVersion, msBuildId } = getElectronVersion();

// In product builds, `@vscode/gulp-electron` is given an asset resolver (via the
// `repo` option) that fetches the prebuilt Electron archives on demand from the
// Azure Artifacts feed named by `product.electronArtifactFeed` using the `az`
// CLI, instead of downloading them from electron's official GitHub releases
// (which OSS builds use when no feed is configured). Each universal package
// contains exactly one file, which is streamed back as a `Response` and
// validated against the feed's `SHASUMS256.txt`.
const electronFeed: string | undefined = product.electronArtifactFeed;

// Maps the artifact file name `@vscode/gulp-electron` requests to the matching
// universal package name in the feed, or `undefined` when it is not mirrored.
function feedPackageName(fileName: string): string | undefined {
	if (fileName === 'SHASUMS256.txt') {
		return 'shasums256';
	}
	if (fileName.endsWith('-symbols.zip')) {
		return undefined;
	}
	return fileName.replace(/\.zip$/, '');
}

const electronAssetResolver = electronFeed
	? async ({ fileName }: { url: string; fileName: string }): Promise<Response> => {
		const name = feedPackageName(fileName);
		if (!name) {
			return new Response(null, { status: 404 });
		}
		const version = `${electronVersion}-${msBuildId}`;
		const filePath = await downloadFeedPackage(root, 'electron-feed', { feed: electronFeed, name, version });
		const size = (await fs.promises.stat(filePath)).size;
		const body = Readable.toWeb(fs.createReadStream(filePath)) as ReadableStream<Uint8Array>;
		return new Response(body, { status: 200, headers: { 'Content-Length': String(size) } });
	}
	: undefined;

export const config = {
	version: electronVersion,
	productAppName: product.nameLong,
	companyName: 'Mazen Zwin',
	copyright: 'Copyright (C) 2026 Mazen Zwin and Tacet contributors. Based on Code - OSS, Copyright (C) Microsoft Corporation. MIT License.',
	darwinExecutable: product.nameShort,
	darwinIcon: 'resources/darwin/code.icns',
	darwinBundleIdentifier: product.darwinBundleIdentifier,
	darwinApplicationCategoryType: 'public.app-category.developer-tools',
	darwinHelpBookFolder: 'VS Code HelpBook',
	darwinHelpBookName: 'VS Code HelpBook',
	darwinBundleDocumentTypes: [
		// Owned: what Finder opens with a double-click. `.mdc` is the Cursor rule format (Markdown).
		darwinBundleDocumentType('Markdown document', ['md', 'markdown', 'mdown', 'mkd', 'mkdn', 'mdwn', 'mdtext', 'mdtxt', 'mdoc', 'mdc'], 'tacet-md', 'Editor'),
		darwinBundleDocumentType('Plain text document', ['txt', 'text', 'log'], 'tacet-txt', 'Editor'),
		// Offered in Open With only; Tacet's Code mode edits these but never claims them.
		darwinBundleDocumentType('Data and configuration file', ['json', 'yaml', 'yml', 'toml', 'ini', 'csv'], 'tacet-txt', 'Viewer'),
		// Folder support (drop a folder on the Dock icon)
		darwinBundleDocumentType('Folder', [], 'default', 'Editor', ['public.folder'])
	],
	darwinBundleURLTypes: [{
		role: 'Viewer',
		name: product.nameLong,
		urlSchemes: [product.urlProtocol]
	}],
	darwinForceDarkModeSupport: true,
	darwinCredits: darwinCreditsTemplate ? Buffer.from(darwinCreditsTemplate({ commit: commit, date: new Date().toISOString() })) : undefined,
	linuxExecutableName: product.applicationName,
	winIcon: 'resources/win32/code.ico',
	token: process.env['GITHUB_TOKEN'],
	repo: electronAssetResolver,
	validateChecksum: true,
	checksumFile: path.join(root, 'build', 'checksums', 'electron.txt'),
	createVersionedResources: useVersionedUpdate,
	productVersionString: versionedResourcesFolder,
};

function getElectron(arch: string): () => NodeJS.ReadWriteStream {
	return () => {
		const electronOpts = {
			...config,
			platform: process.platform,
			arch: arch === 'armhf' ? 'arm' : arch,
			ffmpegChromium: false,
			keepDefaultApp: true
		};

		return vfs.src('package.json')
			.pipe(jsonEditor({ name: product.nameShort }))
			.pipe(electron(electronOpts))
			.pipe(filter(['**', '!**/app/package.json']))
			.pipe(vfs.dest('.build/electron'));
	};
}

async function main(arch: string = process.arch): Promise<void> {
	const electronPath = path.join(root, '.build', 'electron');
	await util.rimraf(electronPath)();
	await util.streamToPromise(getElectron(arch)());
}

if (import.meta.main) {
	main(process.argv[2]).catch(err => {
		console.error(err);
		process.exit(1);
	});
}

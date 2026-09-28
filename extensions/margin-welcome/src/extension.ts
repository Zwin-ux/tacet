/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Margin: first-boot welcome (spike). Hosts a React + Animate UI bundle in a webview.

import * as vscode from 'vscode';

type ThemeChoice = 'light' | 'dark' | 'system';
type WebviewMessage = { type: 'continue'; theme: ThemeChoice } | { type: 'ready' };

const LIGHT_CANDIDATES = ['Margin Light', 'Light Modern', 'Default Light Modern'];
const DARK_CANDIDATES = ['Margin Dark', 'Dark Modern', 'Default Dark Modern'];

let currentPanel: vscode.WebviewPanel | undefined;

export function activate(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		vscode.commands.registerCommand('margin.welcome.show', () => showWelcome(context))
	);
}

function showWelcome(context: vscode.ExtensionContext): vscode.WebviewPanel {
	if (currentPanel) {
		currentPanel.reveal();
		return currentPanel;
	}
	const mediaRoot = vscode.Uri.joinPath(context.extensionUri, 'media');
	const panel = vscode.window.createWebviewPanel(
		'margin.welcome',
		'Welcome to Margin',
		vscode.ViewColumn.Active,
		{
			enableScripts: true,
			localResourceRoots: [mediaRoot],
			retainContextWhenHidden: false,
		}
	);
	currentPanel = panel;
	panel.onDidDispose(() => { currentPanel = undefined; });
	panel.webview.html = renderHtml(panel.webview, mediaRoot);
	panel.webview.onDidReceiveMessage(async (msg: WebviewMessage) => {
		if (msg?.type === 'continue') {
			await applyTheme(msg.theme);
			panel.dispose();
		}
	});
	return panel;
}

/** Theme ids contributed by installed extensions (ids are what workbench.colorTheme stores). */
function installedThemeIds(): Set<string> {
	const ids = new Set<string>();
	for (const ext of vscode.extensions.all) {
		const themes = ext.packageJSON?.contributes?.themes;
		if (Array.isArray(themes)) {
			for (const t of themes) {
				if (typeof t?.id === 'string') { ids.add(t.id); }
				if (typeof t?.label === 'string') { ids.add(t.label); }
			}
		}
	}
	return ids;
}

function pick(candidates: string[], installed: Set<string>): string {
	return candidates.find(c => installed.has(c)) ?? candidates[candidates.length - 1];
}

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

function renderHtml(webview: vscode.Webview, mediaRoot: vscode.Uri): string {
	const nonce = makeNonce();
	const script = webview.asWebviewUri(vscode.Uri.joinPath(mediaRoot, 'welcome.js'));
	const style = webview.asWebviewUri(vscode.Uri.joinPath(mediaRoot, 'welcome.css'));
	const csp = [
		`default-src 'none'`,
		`style-src ${webview.cspSource}`,
		`img-src ${webview.cspSource} data:`,
		`script-src 'nonce-${nonce}'`,
	].join('; ');
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="Content-Security-Policy" content="${csp}">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="stylesheet" href="${style}">
	<title>Welcome to Margin</title>
</head>
<body>
	<div id="root"></div>
	<script type="module" nonce="${nonce}" src="${script}"></script>
</body>
</html>`;
}

function makeNonce(): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let out = '';
	for (let i = 0; i < 32; i++) {
		out += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return out;
}

export function deactivate(): void { /* nothing */ }

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { getLocation, JSONPath, parse, Location } from 'jsonc-parser';
import * as vscode from 'vscode';
import { SettingsDocument } from './settingsDocumentHelper';
import { provideInstalledExtensionProposals } from './extensionsProposals';
import './importExportProfiles';

export function activate(context: vscode.ExtensionContext): void {
	//settings.json suggestions
	context.subscriptions.push(registerSettingsCompletions());

	//extensions suggestions
	context.subscriptions.push(...registerExtensionsCompletions());

	// keybindings.json/package.json context key suggestions
	context.subscriptions.push(registerContextKeyCompletions());
}

function registerSettingsCompletions(): vscode.Disposable {
	return vscode.languages.registerCompletionItemProvider({ language: 'jsonc', pattern: '**/settings.json' }, {
		provideCompletionItems(document, position, token) {
			return new SettingsDocument(document).provideCompletionItems(position, token);
		}
	});
}

function isCompletingInsidePropertyStringValue(document: vscode.TextDocument, location: Location, pos: vscode.Position) {
	if (location.isAtPropertyKey) {
		return false;
	}
	const previousNode = location.previousNode;
	if (previousNode && previousNode.type === 'string') {
		const offset = document.offsetAt(pos);
		return offset > previousNode.offset && offset < previousNode.offset + previousNode.length;
	}
	return false;
}

interface IExtensionsContent {
	recommendations: string[];
}

function registerExtensionsCompletions(): vscode.Disposable[] {
	return [registerExtensionsCompletionsInExtensionsDocument(), registerExtensionsCompletionsInWorkspaceConfigurationDocument()];
}

function registerExtensionsCompletionsInExtensionsDocument(): vscode.Disposable {
	return vscode.languages.registerCompletionItemProvider({ pattern: '**/extensions.json' }, {
		provideCompletionItems(document, position, _token) {
			const location = getLocation(document.getText(), document.offsetAt(position));
			if (location.path[0] === 'recommendations') {
				const range = getReplaceRange(document, location, position);
				const extensionsContent = <IExtensionsContent>parse(document.getText());
				return provideInstalledExtensionProposals(extensionsContent && extensionsContent.recommendations || [], '', range, false);
			}
			return [];
		}
	});
}

function registerExtensionsCompletionsInWorkspaceConfigurationDocument(): vscode.Disposable {
	return vscode.languages.registerCompletionItemProvider({ pattern: '**/*.code-workspace' }, {
		provideCompletionItems(document, position, _token) {
			const location = getLocation(document.getText(), document.offsetAt(position));
			if (location.path[0] === 'extensions' && location.path[1] === 'recommendations') {
				const range = getReplaceRange(document, location, position);
				const extensionsContent = <IExtensionsContent>parse(document.getText())['extensions'];
				return provideInstalledExtensionProposals(extensionsContent && extensionsContent.recommendations || [], '', range, false);
			}
			return [];
		}
	});
}

function getReplaceRange(document: vscode.TextDocument, location: Location, position: vscode.Position) {
	const node = location.previousNode;
	if (node) {
		const nodeStart = document.positionAt(node.offset), nodeEnd = document.positionAt(node.offset + node.length);
		if (nodeStart.isBeforeOrEqual(position) && nodeEnd.isAfterOrEqual(position)) {
			return new vscode.Range(nodeStart, nodeEnd);
		}
	}
	return new vscode.Range(position, position);
}

function registerContextKeyCompletions(): vscode.Disposable {
	type ContextKeyInfo = { key: string; type?: string; description?: string };

	const paths = new Map<vscode.DocumentFilter, JSONPath[]>([
		[{ language: 'jsonc', pattern: '**/keybindings.json' }, [
			['*', 'when']
		]],
		[{ language: 'json', pattern: '**/package.json' }, [
			['contributes', 'menus', '*', '*', 'when'],
			['contributes', 'views', '*', '*', 'when'],
			['contributes', 'viewsWelcome', '*', 'when'],
			['contributes', 'keybindings', '*', 'when'],
			['contributes', 'keybindings', 'when'],
		]]
	]);

	return vscode.languages.registerCompletionItemProvider(
		[...paths.keys()],
		{
			async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {

				const location = getLocation(document.getText(), document.offsetAt(position));

				if (location.isAtPropertyKey) {
					return;
				}

				let isValidLocation = false;
				for (const [key, value] of paths) {
					if (vscode.languages.match(key, document)) {
						if (value.some(location.matches.bind(location))) {
							isValidLocation = true;
							break;
						}
					}
				}

				if (!isValidLocation || !isCompletingInsidePropertyStringValue(document, location, position)) {
					return;
				}

				const replacing = document.getWordRangeAtPosition(position, /[a-zA-Z.]+/) || new vscode.Range(position, position);
				const inserting = replacing.with(undefined, position);

				const data = await vscode.commands.executeCommand<ContextKeyInfo[]>('getContextKeyInfo');
				if (token.isCancellationRequested || !data) {
					return;
				}

				const result = new vscode.CompletionList();
				for (const item of data) {
					const completion = new vscode.CompletionItem(item.key, vscode.CompletionItemKind.Constant);
					completion.detail = item.type;
					completion.range = { replacing, inserting };
					completion.documentation = item.description;
					result.items.push(completion);
				}
				return result;
			}
		}
	);
}

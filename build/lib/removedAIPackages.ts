/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * Tacet is AI-free. Returns a glob filter that drops every package that only
 * served removed AI features (Copilot, agent SDKs, on-device dictation, agent
 * sandbox), so a packaging run can never bundle them even if they are still
 * present in a node_modules folder.
 */
export function getRemovedAIPackagesExcludeFilter(): string[] {
	return [
		'**',
		'!**/node_modules/@github/copilot{,-*}/**',
		'!**/node_modules/@vscode/copilot-api/**',
		'!**/node_modules/@anthropic-ai/**',
		'!**/node_modules/@openai/codex{,-*}/**',
		'!**/node_modules/foundry-local-sdk/**',
		'!**/node_modules/@microsoft/mxc-sdk/**',
	];
}

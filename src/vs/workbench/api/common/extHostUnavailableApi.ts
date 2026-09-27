/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type * as vscode from 'vscode';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { Event } from '../../../base/common/event.js';
import { Disposable } from './extHostTypes.js';

// Margin does not include a debugger, tasks or testing. The implementations below keep the
// stable `vscode.debug`, `vscode.tasks` and `vscode.tests` shapes so that extensions still
// activate, but nothing is ever debugged, run as a task or run as a test.

function notAvailable(feature: string): Error {
	return new Error(`${feature} is not available in Margin.`);
}

/**
 * Creates the `vscode.debug` namespace: no sessions, no breakpoints, providers are accepted and ignored.
 */
export function createUnavailableDebugApi(): typeof vscode.debug {
	return {
		activeDebugSession: undefined,
		activeDebugConsole: {
			append() { },
			appendLine() { }
		},
		breakpoints: [],
		activeStackItem: undefined,
		onDidChangeActiveDebugSession: Event.None,
		onDidStartDebugSession: Event.None,
		onDidReceiveDebugSessionCustomEvent: Event.None,
		onDidTerminateDebugSession: Event.None,
		onDidChangeBreakpoints: Event.None,
		onDidChangeActiveStackItem: Event.None,
		registerDebugConfigurationProvider: () => new Disposable(() => { }),
		registerDebugAdapterDescriptorFactory: () => new Disposable(() => { }),
		registerDebugAdapterTrackerFactory: () => new Disposable(() => { }),
		startDebugging: () => Promise.resolve(false),
		stopDebugging: () => Promise.resolve(),
		addBreakpoints() { },
		removeBreakpoints() { },
		asDebugSourceUri: () => {
			throw notAvailable('Debugging');
		}
	};
}

/**
 * Creates the `vscode.tasks` namespace: no tasks exist and none can be executed.
 */
export function createUnavailableTasksApi(): typeof vscode.tasks {
	return {
		registerTaskProvider: () => new Disposable(() => { }),
		fetchTasks: () => Promise.resolve([]),
		executeTask: () => Promise.reject(notAvailable('Tasks')),
		taskExecutions: [],
		onDidStartTask: Event.None,
		onDidEndTask: Event.None,
		onDidStartTaskProcess: Event.None,
		onDidEndTaskProcess: Event.None
	};
}

class UnavailableTestItemCollection implements vscode.TestItemCollection {

	private readonly items = new Map<string, vscode.TestItem>();

	constructor(private readonly owner: UnavailableTestItem | undefined) { }

	get size(): number {
		return this.items.size;
	}

	replace(items: readonly vscode.TestItem[]): void {
		this.items.clear();
		for (const item of items) {
			this.add(item);
		}
	}

	forEach(callback: (item: vscode.TestItem, collection: vscode.TestItemCollection) => unknown, thisArg?: unknown): void {
		for (const item of this.items.values()) {
			callback.call(thisArg, item, this);
		}
	}

	add(item: vscode.TestItem): void {
		if (item instanceof UnavailableTestItem) {
			item.parent = this.owner;
		}
		this.items.set(item.id, item);
	}

	delete(itemId: string): void {
		this.items.delete(itemId);
	}

	get(itemId: string): vscode.TestItem | undefined {
		return this.items.get(itemId);
	}

	[Symbol.iterator](): Iterator<[id: string, testItem: vscode.TestItem]> {
		return this.items.entries();
	}
}

class UnavailableTestItem implements vscode.TestItem {

	readonly children = new UnavailableTestItemCollection(this);
	parent: vscode.TestItem | undefined;
	tags: readonly vscode.TestTag[] = [];
	canResolveChildren = false;
	busy = false;
	description?: string;
	sortText?: string;
	range: vscode.Range | undefined;
	error: string | vscode.MarkdownString | undefined;

	constructor(
		readonly id: string,
		public label: string,
		readonly uri: vscode.Uri | undefined
	) { }
}

function createUnavailableTestRun(name: string | undefined, isPersisted: boolean): vscode.TestRun {
	return {
		name,
		token: CancellationToken.None,
		isPersisted,
		enqueued() { },
		started() { },
		skipped() { },
		failed() { },
		errored() { },
		passed() { },
		appendOutput() { },
		addCoverage() { },
		end() { },
		onDidDispose: Event.None
	};
}

/**
 * Creates the `vscode.tests` namespace: controllers and items can be created, but no test is ever run.
 */
export function createUnavailableTestsApi(): typeof vscode.tests {
	return {
		createTestController(id: string, label: string): vscode.TestController {
			return {
				id,
				label,
				items: new UnavailableTestItemCollection(undefined),
				createRunProfile: (profileLabel, kind, runHandler, isDefault = false, tag, supportsContinuousRun = false) => ({
					label: profileLabel,
					kind,
					isDefault,
					onDidChangeDefault: Event.None,
					supportsContinuousRun,
					tag,
					configureHandler: undefined,
					runHandler,
					dispose() { }
				}),
				resolveHandler: undefined,
				refreshHandler: undefined,
				createTestRun: (_request, name, persist = true) => createUnavailableTestRun(name, persist),
				createTestItem: (itemId, itemLabel, uri) => new UnavailableTestItem(itemId, itemLabel, uri),
				invalidateTestResults() { },
				dispose() { }
			};
		}
	};
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Mazen Zwin and Tacet contributors. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RunOnceScheduler } from '../../../../base/common/async.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { hash } from '../../../../base/common/hash.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { Schemas } from '../../../../base/common/network.js';
import { dirname, joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { ILifecycleService } from '../../../services/lifecycle/common/lifecycle.js';
import { sanitizeNoteTitle } from '../../../services/textfile/common/noteFileName.js';
import { IUntitledTextEditorService } from '../../../services/untitled/common/untitledTextEditorService.js';
import { IWorkingCopy, WorkingCopyCapabilities } from '../../../services/workingCopy/common/workingCopy.js';
import { IWorkingCopyService } from '../../../services/workingCopy/common/workingCopyService.js';

/** The folder of readable copies of drafts, next to the app's own `Backups` folder. */
function draftsFolder(environmentService: IWorkbenchEnvironmentService): URI {
	return joinPath(dirname(environmentService.userRoamingDataHome).with({ scheme: Schemas.file }), 'Drafts');
}

/**
 * Ship plan R3: drafts are readable files on disk, findable by title.
 *
 * The working-copy backup stays the recovery authority (document contract D-21). Its files have
 * hashed names and a metadata line, so no other app can read them. This keeps a plain `.md` copy of
 * every draft that has text, named `Title - id.md`, in the `Drafts` folder of the app data. The
 * copy is written at most 500 ms after an edit, and removed when the draft is saved to a file or
 * discarded. Closing a window or quitting keeps it. Editing the copy does not change the draft.
 */
export class DraftsMirror extends Disposable implements IWorkbenchContribution {

	static readonly ID = 'workbench.contrib.tacetDraftsMirror';

	private static readonly DELAY = 500;

	private readonly folder: URI;
	private readonly schedulers = new Map<string, RunOnceScheduler>();
	private readonly written = new Map<string, URI>();

	constructor(
		@IWorkingCopyService workingCopyService: IWorkingCopyService,
		@IUntitledTextEditorService private readonly untitledService: IUntitledTextEditorService,
		@IFileService private readonly fileService: IFileService,
		@IWorkbenchEnvironmentService environmentService: IWorkbenchEnvironmentService,
		@IWorkspaceContextService private readonly contextService: IWorkspaceContextService,
		@ILifecycleService private readonly lifecycleService: ILifecycleService,
		@ILogService private readonly logService: ILogService
	) {
		super();

		this.folder = draftsFolder(environmentService);

		const isDraft = (workingCopy: IWorkingCopy) => !!(workingCopy.capabilities & WorkingCopyCapabilities.Untitled) && workingCopy.resource.scheme === Schemas.untitled;

		this._register(workingCopyService.onDidRegister(wc => isDraft(wc) && this.schedule(wc)));
		this._register(workingCopyService.onDidChangeContent(wc => isDraft(wc) && this.schedule(wc)));
		this._register(workingCopyService.onDidUnregister(wc => {
			if (isDraft(wc)) {
				this.onGone(wc);
			}
		}));
	}

	private key(workingCopy: IWorkingCopy): string {
		return workingCopy.resource.toString();
	}

	private schedule(workingCopy: IWorkingCopy): void {
		const key = this.key(workingCopy);
		let scheduler = this.schedulers.get(key);
		if (!scheduler) {
			scheduler = this._register(new RunOnceScheduler(() => this.write(workingCopy), DraftsMirror.DELAY));
			this.schedulers.set(key, scheduler);
		}

		// Not a debounce: typing without a pause must not push the copy out.
		if (!scheduler.isScheduled()) {
			scheduler.schedule();
		}
	}

	private async write(workingCopy: IWorkingCopy): Promise<void> {
		const key = this.key(workingCopy);
		const text = this.untitledService.getValue(workingCopy.resource);
		if (text === undefined) {
			return; // not loaded yet, or already gone
		}

		try {
			const previous = this.written.get(key);

			if (!text.trim()) {
				await this.remove(key); // an empty draft leaves nothing to read
				return;
			}

			const id = (hash(`${this.contextService.getWorkspace().id}|${key}`) >>> 0).toString(16).padStart(8, '0');
			const target = joinPath(this.folder, `${sanitizeNoteTitle(workingCopy.name)} - ${id}.md`);
			await this.fileService.writeFile(target, VSBuffer.fromString(text));
			if (!this.schedulers.has(key)) {
				await this.fileService.del(target).catch(() => undefined); // the draft was closed while this was writing
				return;
			}
			this.written.set(key, target);

			// The title changed: drop the copy under the old name once the new one exists.
			if (previous && previous.toString() !== target.toString()) {
				await this.fileService.del(previous).catch(() => undefined);
			}
		} catch (error) {
			// The backup still protects the text, so a failed copy is only logged.
			this.logService.warn('[tacet drafts] could not write the readable copy of a draft', error);
		}
	}

	private onGone(workingCopy: IWorkingCopy): void {
		const key = this.key(workingCopy);
		this.schedulers.get(key)?.dispose();
		this.schedulers.delete(key);

		// Closing a window or quitting disposes drafts too, and they must stay readable.
		// Only a draft that is closed while the app keeps running was saved or discarded.
		if (!this.lifecycleService.willShutdown) {
			this.remove(key).catch(error => this.logService.warn('[tacet drafts] could not remove the readable copy of a draft', error));
		}
	}

	private async remove(key: string): Promise<void> {
		const target = this.written.get(key);
		if (target) {
			this.written.delete(key);
			await this.fileService.del(target).catch(() => undefined);
		}
	}
}

// ponytail: copies left by a crash between "saved" and "cleanup" are not swept; add a startup sweep against the backups if users report stale copies.

registerAction2(class ShowDraftsFolder extends Action2 {

	constructor() {
		super({
			id: 'tacet.drafts.showFolder',
			title: localize2('tacet.drafts.showFolder', "Tacet: Show Drafts Folder"),
			f1: true
		});
	}

	async run(accessor: ServicesAccessor): Promise<void> {
		const fileService = accessor.get(IFileService);
		const folder = draftsFolder(accessor.get(IWorkbenchEnvironmentService));
		await fileService.createFolder(folder);
		await accessor.get(ICommandService).executeCommand('revealFileInOS', folder);
	}
});

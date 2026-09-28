/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Mazen Zwin and Tacet contributors. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import './media/tacet.css';
import { registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { DraftsMirror } from './draftsMirror.js';

registerWorkbenchContribution2(DraftsMirror.ID, DraftsMirror, WorkbenchPhase.AfterRestored);

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ServicesAccessor } from '../../../../editor/browser/editorExtensions.js';
import { Range } from '../../../../editor/common/core/range.js';
import { ITextModel } from '../../../../editor/common/model.js';

/**
 * Tacet has no source control, so there is never an original to diff against.
 * `null` tells callers there is no source control.
 */
export async function getModifiedRanges(_accessor: ServicesAccessor, _modified: ITextModel): Promise<Range[] | undefined | null> {
	return null;
}

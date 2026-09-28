/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Mazen Zwin and Tacet contributors. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/** Joins class names. No class merging: Tacet components never pass conflicting utilities. */
export function cn(...parts: (string | false | null | undefined)[]): string {
	return parts.filter(Boolean).join(' ');
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { URI } from '../../../../base/common/uri.js';

/**
 * The GitHub API endpoints, derived from an optional GitHub Enterprise base URI.
 * All values are string URIs with no trailing slash.
 */
export interface IGitHubEndpoints {
	/** REST API base (e.g. `https://api.github.com`). */
	readonly apiBaseUri: string;
	/** GraphQL endpoint (distinct from `apiBaseUri` for on-prem: `/api/graphql`, not `/api/v3/graphql`). */
	readonly graphQlUri: string;
}

const GITHUB_DOT_COM_ENDPOINTS: IGitHubEndpoints = {
	apiBaseUri: 'https://api.github.com',
	graphQlUri: 'https://api.github.com/graphql',
};

/**
 * Derives the {@link IGitHubEndpoints} for a GitHub Enterprise base URI, mirroring
 * the URL derivation in the built-in `github-authentication` extension:
 *
 * - unset / empty / unparseable / github.com → github.com defaults.
 * - GitHub Enterprise **Cloud** (authority ends in `.ghe.com`) → API on an `api.` subdomain.
 * - GitHub Enterprise **Server** (on-prem) → API under `/api/v3`, GraphQL under `/api/graphql`.
 */
export function deriveGitHubEndpoints(enterpriseUri: string | undefined): IGitHubEndpoints {
	if (!enterpriseUri) {
		return GITHUB_DOT_COM_ENDPOINTS;
	}

	let uri: URI;
	try {
		uri = URI.parse(enterpriseUri);
	} catch {
		return GITHUB_DOT_COM_ENDPOINTS;
	}

	const authority = uri.authority;
	if (!authority || authority === 'github.com' || authority === 'www.github.com' || authority === 'api.github.com') {
		return GITHUB_DOT_COM_ENDPOINTS;
	}

	const scheme = uri.scheme || 'https';
	const isCloud = /\.ghe\.com$/.test(authority);
	return {
		apiBaseUri: isCloud ? `${scheme}://api.${authority}` : `${scheme}://${authority}/api/v3`,
		graphQlUri: isCloud ? `${scheme}://api.${authority}/graphql` : `${scheme}://${authority}/api/graphql`,
	};
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { DeferredPromise } from '../../../../../base/common/async.js';
import { bufferToStream, VSBuffer } from '../../../../../base/common/buffer.js';
import { Emitter, Event } from '../../../../../base/common/event.js';
import { isWeb } from '../../../../../base/common/platform.js';
import { IRequestContext, IRequestOptions } from '../../../../../base/parts/request/common/request.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { TestConfigurationService } from '../../../../../platform/configuration/test/common/testConfigurationService.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { MockContextKeyService } from '../../../../../platform/keybinding/test/common/mockKeybindingService.js';
import { TestInstantiationService } from '../../../../../platform/instantiation/test/common/instantiationServiceMock.js';
import { ILogService, NullLogService } from '../../../../../platform/log/common/log.js';
import { IProductService } from '../../../../../platform/product/common/productService.js';
import { IRequestService } from '../../../../../platform/request/common/request.js';
import { InMemoryStorageService, IStorageService } from '../../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { NullTelemetryService } from '../../../../../platform/telemetry/common/telemetryUtils.js';
import { AuthenticationSession, AuthenticationSessionsChangeEvent, IAuthenticationExtensionsService, IAuthenticationService } from '../../../authentication/common/authentication.js';
import { IWorkbenchEnvironmentService } from '../../../environment/common/environmentService.js';
import { IExtensionService } from '../../../extensions/common/extensions.js';
import { IHostService } from '../../../host/browser/host.js';
import { DefaultAccountProvider } from '../../browser/defaultAccount.js';
import { TestProductService } from '../../../../test/common/workbenchTestServices.js';

suite('DefaultAccountProvider', () => {

	const disposables = ensureNoDisposablesAreLeakedInTestSuite();
	const accountId = 'account';
	const sessions: AuthenticationSession[] = [{
		id: 'session',
		accessToken: 'token',
		account: { id: accountId, label: 'octocat' },
		scopes: ['user:email'],
	}];

	test('matching authentication sessions are not duplicated by overlapping accepted scopes', async () => {
		const broadSession: AuthenticationSession = {
			...sessions[0],
			scopes: ['read:user', 'user:email', 'repo', 'workflow'],
		};
		const provider = await createProvider(
			new TestRequestService(async () => jsonResponse({})),
			{ getSessions: async () => [broadSession] }
		);

		const matching = await provider['findMatchingProviderSession']('github', [
			['read:user', 'user:email', 'repo', 'workflow'],
			['user:email'],
			['read:user'],
		]);

		assert.deepStrictEqual(matching?.map(session => session.id), ['session']);
	});

	test('reconciles a replacement without a signed-out gap and preserves removal-only behavior', async () => {
		const sessionChanges = disposables.add(new Emitter<{ providerId: string; label: string; event: AuthenticationSessionsChangeEvent }>());
		let authenticationSessions = sessions;
		const provider = await createProvider(
			new TestRequestService(async () => jsonResponse({ chat_enabled: true })),
			{
				getSessions: async () => authenticationSessions,
				onDidChangeSessions: sessionChanges.event,
			}
		);
		const observedSessionIds: Array<string | null> = [];
		disposables.add(provider.onDidChangeDefaultAccount(account => observedSessionIds.push(account?.sessionId ?? null)));
		const replacementSession = { ...sessions[0], id: 'replacement-session', accessToken: 'replacement-token' };
		authenticationSessions = [replacementSession];
		const beforeReplacement = provider.defaultAccount?.sessionId;
		const replacement = Event.toPromise(Event.filter(
			provider.onDidChangeDefaultAccount,
			account => account?.sessionId === replacementSession.id
		));

		sessionChanges.fire({
			providerId: 'github',
			label: 'GitHub',
			event: { added: [replacementSession], removed: sessions, changed: [] },
		});
		const afterReplacementEvent = provider.defaultAccount?.sessionId;
		const afterReplacement = (await replacement)?.sessionId;

		authenticationSessions = [];
		sessionChanges.fire({
			providerId: 'github',
			label: 'GitHub',
			event: { added: [], removed: [replacementSession], changed: [] },
		});

		assert.deepStrictEqual({
			beforeReplacement,
			afterReplacementEvent,
			afterReplacement,
			afterRemovalOnlyEvent: provider.defaultAccount?.sessionId,
			observedSessionIds,
		}, {
			beforeReplacement: 'session',
			afterReplacementEvent: 'session',
			afterReplacement: 'replacement-session',
			afterRemovalOnlyEvent: undefined,
			observedSessionIds: ['replacement-session', null],
		});
	});

	test('does not restore a removed session from an in-flight replacement refresh', async () => {
		const sessionChanges = disposables.add(new Emitter<{ providerId: string; label: string; event: AuthenticationSessionsChangeEvent }>());
		const refreshStarted = new DeferredPromise<void>();
		const releaseRefresh = new DeferredPromise<IRequestContext>();
		let authenticationSessions = sessions;
		let blockRefresh = false;
		const provider = await createProvider(
			new TestRequestService(async options => {
				if (blockRefresh && options.callSite === 'defaultAccount.entitlements') {
					refreshStarted.complete();
					return releaseRefresh.p;
				}
				return jsonResponse({ chat_enabled: true });
			}),
			{
				getSessions: async () => authenticationSessions,
				onDidChangeSessions: sessionChanges.event,
			}
		);
		const observedSessionIds: Array<string | null> = [];
		disposables.add(provider.onDidChangeDefaultAccount(account => observedSessionIds.push(account?.sessionId ?? null)));
		const replacementSession = { ...sessions[0], accessToken: 'replacement-token' };
		authenticationSessions = [replacementSession];
		blockRefresh = true;

		sessionChanges.fire({
			providerId: 'github',
			label: 'GitHub',
			event: { added: [replacementSession], removed: sessions, changed: [] },
		});
		const replacementRefresh = provider.refresh({ forceRefresh: true });
		await refreshStarted.p;

		authenticationSessions = [];
		sessionChanges.fire({
			providerId: 'github',
			label: 'GitHub',
			event: { added: [], removed: [replacementSession], changed: [] },
		});
		const afterRemoval = provider.defaultAccount?.sessionId;
		releaseRefresh.complete(jsonResponse({ chat_enabled: false }));
		await replacementRefresh;

		assert.deepStrictEqual({
			afterRemoval,
			afterBlockedRefresh: provider.defaultAccount?.sessionId,
			observedSessionIds,
		}, {
			afterRemoval: undefined,
			afterBlockedRefresh: undefined,
			observedSessionIds: [null],
		});
	});

	async function createProvider(
		requestService: TestRequestService,
		authenticationServiceOverrides: Partial<IAuthenticationService> = {},
	): Promise<DefaultAccountProvider> {
		const instantiationService = disposables.add(new TestInstantiationService());
		instantiationService.stub(IConfigurationService, new TestConfigurationService());
		instantiationService.stub(IAuthenticationService, {
			declaredProviders: [],
			isAuthenticationProviderRegistered: () => true,
			getAccounts: async () => [],
			getSessions: async () => [],
			onDidChangeDeclaredProviders: Event.None,
			onDidChangeSessions: Event.None,
			onDidRegisterAuthenticationProvider: Event.None,
			onDidUnregisterAuthenticationProvider: Event.None,
			...authenticationServiceOverrides,
		});
		instantiationService.stub(IAuthenticationExtensionsService, {
			getAccountPreference: () => undefined,
			onDidChangeAccountPreference: Event.None,
		});
		instantiationService.stub(ITelemetryService, NullTelemetryService);
		instantiationService.stub(IExtensionService, {});
		instantiationService.stub(IRequestService, requestService);
		instantiationService.stub(ILogService, new NullLogService());
		instantiationService.stub(IWorkbenchEnvironmentService, {
			remoteAuthority: isWeb ? 'test-remote' : undefined,
		});
		instantiationService.stub(IProductService, TestProductService);
		instantiationService.stub(IContextKeyService, new MockContextKeyService());
		instantiationService.stub(IStorageService, disposables.add(new InMemoryStorageService()));
		instantiationService.stub(IHostService, {
			hasFocus: true,
			onDidChangeFocus: Event.None,
		});
		instantiationService.stub(ICommandService, {});

		const provider = disposables.add(instantiationService.createInstance(DefaultAccountProvider, {
			preferredExtensions: [],
			authenticationProvider: {
				default: { id: 'github', name: 'GitHub' },
				enterprise: { id: 'github-enterprise', name: 'GitHub Enterprise' },
				enterpriseProviderConfig: 'github.copilot.advanced.authProvider',
				enterpriseProviderUriSetting: 'github-enterprise.uri',
				scopes: [['user:email']],
			},
			tokenEntitlementUrl: '',
			entitlementUrl: 'https://api.github.com/copilot_internal/user',
		}));
		await provider.refresh();
		return provider;
	}
});

suite('DefaultAccountProvider sign in scopes', () => {

	const disposables = ensureNoDisposablesAreLeakedInTestSuite();

	interface ICreateSessionCall {
		readonly scopes: readonly string[];
		readonly options: Record<string, unknown>;
	}

	async function signIn(options?: Parameters<DefaultAccountProvider['signIn']>[0]): Promise<ICreateSessionCall[]> {
		const calls: ICreateSessionCall[] = [];
		const instantiationService = disposables.add(new TestInstantiationService());
		instantiationService.stub(IConfigurationService, new TestConfigurationService());
		instantiationService.stub(IAuthenticationService, {
			declaredProviders: [],
			isAuthenticationProviderRegistered: () => true,
			getAccounts: async () => [],
			getSessions: async () => [],
			createSession: async (_providerId: string, scopes: readonly string[], sessionOptions: Record<string, unknown>) => {
				calls.push({ scopes: [...scopes], options: sessionOptions });
				return { id: 'session', accessToken: 'token', account: { id: 'account', label: 'octocat' }, scopes: [...scopes] };
			},
			onDidChangeDeclaredProviders: Event.None,
			onDidChangeSessions: Event.None,
			onDidRegisterAuthenticationProvider: Event.None,
			onDidUnregisterAuthenticationProvider: Event.None,
		});
		instantiationService.stub(IAuthenticationExtensionsService, {
			getAccountPreference: () => undefined,
			updateAccountPreference: () => { },
			onDidChangeAccountPreference: Event.None,
		});
		instantiationService.stub(ITelemetryService, NullTelemetryService);
		instantiationService.stub(IExtensionService, {});
		instantiationService.stub(IRequestService, new TestRequestService(async () => jsonResponse({})));
		instantiationService.stub(ILogService, new NullLogService());
		instantiationService.stub(IWorkbenchEnvironmentService, { remoteAuthority: undefined });
		instantiationService.stub(IProductService, TestProductService);
		instantiationService.stub(IContextKeyService, new MockContextKeyService());
		instantiationService.stub(IStorageService, disposables.add(new InMemoryStorageService()));
		instantiationService.stub(IHostService, { hasFocus: true, onDidChangeFocus: Event.None });
		instantiationService.stub(ICommandService, {});

		const provider = disposables.add(instantiationService.createInstance(DefaultAccountProvider, {
			preferredExtensions: [],
			authenticationProvider: {
				default: { id: 'github', name: 'GitHub' },
				enterprise: { id: 'github-enterprise', name: 'GitHub Enterprise' },
				enterpriseProviderConfig: 'github.copilot.advanced.authProvider',
				enterpriseProviderUriSetting: 'github-enterprise.uri',
				scopes: [['read:user', 'user:email', 'repo']],
			},
			tokenEntitlementUrl: '',
			entitlementUrl: 'https://api.github.com/copilot_internal/user',
		}));
		await provider.signIn(options);
		return calls;
	}

	test('widens the default scopes and never forwards the scope option to the session', async () => {
		assert.deepStrictEqual({
			none: await signIn(),
			additive: await signIn({ additionalScopes: ['workflow', 'repo'], provider: 'google' }),
		}, {
			none: [{ scopes: ['read:user', 'user:email', 'repo'], options: {} }],
			// The broad defaults plus the extra scopes, deduplicated.
			additive: [{ scopes: ['read:user', 'user:email', 'repo', 'workflow'], options: { provider: 'google' } }],
		});
	});
});

class TestRequestService implements IRequestService {
	readonly _serviceBrand: undefined;
	readonly onDidCompleteRequest = Event.None;
	requestCount = 0;
	readonly requests: IRequestOptions[] = [];

	constructor(private readonly requestHandler: (options: IRequestOptions) => Promise<IRequestContext>) { }

	request(options: IRequestOptions): Promise<IRequestContext> {
		this.requestCount++;
		this.requests.push(options);
		return this.requestHandler(options);
	}

	async resolveProxy(): Promise<string | undefined> {
		return undefined;
	}

	async lookupAuthorization(): Promise<undefined> {
		return undefined;
	}

	async lookupKerberosAuthorization(): Promise<undefined> {
		return undefined;
	}

	async loadCertificates(): Promise<string[]> {
		return [];
	}
}

function jsonResponse(data: unknown, statusCode = 200, headers: Record<string, string> = {}): IRequestContext {
	return {
		res: { statusCode, headers },
		stream: bufferToStream(VSBuffer.fromString(JSON.stringify(data))),
	};
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { distinct } from '../../../../base/common/arrays.js';
import { Barrier, RunOnceScheduler, ThrottledDelayer, timeout } from '../../../../base/common/async.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { ICopilotTokenInfo, IDefaultAccount, IDefaultAccountAuthenticationProvider, IEntitlementsData, IPolicyData } from '../../../../base/common/defaultAccount.js';
import { getErrorMessage } from '../../../../base/common/errors.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { equals } from '../../../../base/common/objects.js';
import { isWeb } from '../../../../base/common/platform.js';
import { IDefaultChatAgent } from '../../../../base/common/product.js';
import { isString, Mutable } from '../../../../base/common/types.js';
import { IRequestContext } from '../../../../base/parts/request/common/request.js';
import { localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKey, IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IDefaultAccountProvider, IDefaultAccountRefreshOptions, IDefaultAccountService } from '../../../../platform/defaultAccount/common/defaultAccount.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { asJson, IRequestService, isSuccess, readHeader, retryAfterFromHeaders } from '../../../../platform/request/common/request.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { AuthenticationSession, AuthenticationSessionAccount, IAuthenticationExtensionsService, IAuthenticationService } from '../../authentication/common/authentication.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { IExtensionService } from '../../extensions/common/extensions.js';
import { IHostService } from '../../host/browser/host.js';

interface IDefaultAccountConfig {
	readonly preferredExtensions: string[];
	readonly authenticationProvider: {
		readonly default: {
			readonly id: string;
			readonly name: string;
		};
		readonly enterprise: {
			readonly id: string;
			readonly name: string;
		};
		readonly enterpriseProviderConfig: string;
		readonly enterpriseProviderUriSetting: string;
		readonly scopes: string[][];
	};
	readonly tokenEntitlementUrl: string;
	readonly entitlementUrl: string;
}

export const DEFAULT_ACCOUNT_SIGN_IN_COMMAND = 'workbench.actions.accounts.signIn';

export const enum DefaultAccountStatus {
	Uninitialized = 'uninitialized',
	Unavailable = 'unavailable',
	Available = 'available',
}

export const CONTEXT_DEFAULT_ACCOUNT_STATE = new RawContextKey<string>('defaultAccountStatus', DefaultAccountStatus.Uninitialized);
const CACHED_POLICY_DATA_KEY = 'defaultAccount.cachedPolicyData';
const ACCOUNT_DATA_POLL_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

interface ITokenEntitlementsResponse {
	token: string;
}

function toDefaultAccountConfig(defaultChatAgent: IDefaultChatAgent): IDefaultAccountConfig {
	return {
		preferredExtensions: [
			defaultChatAgent.chatExtensionId,
			defaultChatAgent.extensionId,
		],
		authenticationProvider: {
			default: {
				id: defaultChatAgent.provider.default.id,
				name: defaultChatAgent.provider.default.name,
			},
			enterprise: {
				id: defaultChatAgent.provider.enterprise.id,
				name: defaultChatAgent.provider.enterprise.name,
			},
			enterpriseProviderConfig: `${defaultChatAgent.completionsAdvancedSetting}.authProvider`,
			enterpriseProviderUriSetting: defaultChatAgent.providerUriSetting,
			scopes: defaultChatAgent.providerScopes,
		},
		entitlementUrl: defaultChatAgent.entitlementUrl,
		tokenEntitlementUrl: defaultChatAgent.tokenEntitlementUrl,
	};
}

export class DefaultAccountService extends Disposable implements IDefaultAccountService {
	declare _serviceBrand: undefined;

	private defaultAccount: IDefaultAccount | null = null;
	get currentDefaultAccount(): IDefaultAccount | null { return this.defaultAccount; }
	get policyData(): IPolicyData | null { return this.defaultAccountProvider?.policyData ?? null; }
	get copilotTokenInfo(): ICopilotTokenInfo | null { return this.defaultAccountProvider?.copilotTokenInfo ?? null; }

	private readonly initBarrier = new Barrier();

	private readonly _onDidChangeDefaultAccount = this._register(new Emitter<IDefaultAccount | null>());
	readonly onDidChangeDefaultAccount = this._onDidChangeDefaultAccount.event;

	private readonly _onDidChangePolicyData = this._register(new Emitter<IPolicyData | null>());
	readonly onDidChangePolicyData = this._onDidChangePolicyData.event;

	private readonly _onDidChangeCopilotTokenInfo = this._register(new Emitter<ICopilotTokenInfo | null>());
	readonly onDidChangeCopilotTokenInfo = this._onDidChangeCopilotTokenInfo.event;

	private readonly defaultAccountConfig: IDefaultAccountConfig | undefined;
	private defaultAccountProvider: IDefaultAccountProvider | null = null;

	constructor(
		@IProductService productService: IProductService,
	) {
		super();
		this.defaultAccountConfig = productService.defaultChatAgent ? toDefaultAccountConfig(productService.defaultChatAgent) : undefined;
		if (!this.defaultAccountConfig) {
			// No account provider is configured for this product, so there is never a default account.
			this.initBarrier.open();
		}
	}

	async getDefaultAccount(): Promise<IDefaultAccount | null> {
		await this.initBarrier.wait();
		return this.defaultAccount;
	}

	getDefaultAccountAuthenticationProvider(): IDefaultAccountAuthenticationProvider {
		if (this.defaultAccountProvider) {
			return this.defaultAccountProvider.getDefaultAccountAuthenticationProvider();
		}
		return {
			...(this.defaultAccountConfig?.authenticationProvider.default ?? { id: 'github', name: 'GitHub' }),
			enterprise: false
		};
	}

	setDefaultAccountProvider(provider: IDefaultAccountProvider): void {
		if (this.defaultAccountProvider) {
			throw new Error('Default account provider is already set');
		}

		this.defaultAccountProvider = provider;
		if (this.defaultAccountProvider.policyData) {
			this._onDidChangePolicyData.fire(this.defaultAccountProvider.policyData);
		}
		provider.refresh().then(account => {
			this.defaultAccount = account;
		}).finally(() => {
			this.initBarrier.open();
			this._register(provider.onDidChangeDefaultAccount(account => this.setDefaultAccount(account)));
			this._register(provider.onDidChangePolicyData(policyData => this._onDidChangePolicyData.fire(policyData)));
			this._register(provider.onDidChangeCopilotTokenInfo(tokenInfo => this._onDidChangeCopilotTokenInfo.fire(tokenInfo)));
		});
	}

	async refresh(options?: IDefaultAccountRefreshOptions): Promise<IDefaultAccount | null> {
		await this.initBarrier.wait();

		const account = await this.defaultAccountProvider?.refresh(options);
		this.setDefaultAccount(account ?? null);
		return this.defaultAccount;
	}

	async signIn(options?: { additionalScopes?: readonly string[];[key: string]: unknown }): Promise<IDefaultAccount | null> {
		await this.initBarrier.wait();
		return this.defaultAccountProvider?.signIn(options) ?? null;
	}

	async signOut(): Promise<void> {
		await this.initBarrier.wait();
		await this.defaultAccountProvider?.signOut();
	}

	resolveGitHubUrl(path: string): string {
		if (this.defaultAccountProvider) {
			return this.defaultAccountProvider.resolveGitHubUrl(path);
		}

		return `https://github.com/${path}`;
	}

	private setDefaultAccount(account: IDefaultAccount | null): void {
		if (equals(this.defaultAccount, account)) {
			return;
		}
		this.defaultAccount = account;
		this._onDidChangeDefaultAccount.fire(this.defaultAccount);
	}
}

interface IAccountPolicyData {
	readonly accountId: string;
	readonly policyData: IPolicyData;
	readonly entitlementsFetchedAt?: number;
	readonly tokenEntitlementsFetchedAt?: number;
}

interface ICachedAccountData {
	readonly accountPolicyData: IAccountPolicyData;
	readonly copilotTokenInfo?: ICopilotTokenInfo;
}

interface IDefaultAccountData {
	accountId: string;
	defaultAccount: IDefaultAccount;
	policyData: IAccountPolicyData | null;
	copilotTokenInfo: ICopilotTokenInfo | null;
}

interface IAuthenticatedRequestOptions {
	readonly requestTimeoutMs?: number;
	readonly retryNotFound?: boolean;
}

type DefaultAccountStatusTelemetry = {
	status: string;
	initial: boolean;
};

type DefaultAccountStatusTelemetryClassification = {
	owner: 'sandy081';
	comment: 'Log default account availability status';
	status: { classification: 'SystemMetaData'; purpose: 'PerformanceAndHealth'; comment: 'Indicates whether default account is available or not.' };
	initial: { classification: 'SystemMetaData'; purpose: 'PerformanceAndHealth'; comment: 'Indicates whether this is the initial status report.' };
};

export class DefaultAccountProvider extends Disposable implements IDefaultAccountProvider {

	private _defaultAccount: IDefaultAccountData | null = null;
	get defaultAccount(): IDefaultAccount | null { return this._defaultAccount?.defaultAccount ?? null; }

	private _policyData: IAccountPolicyData | null = null;
	get policyData(): IPolicyData | null { return this._policyData?.policyData ?? null; }

	private _copilotTokenInfo: ICopilotTokenInfo | null = null;
	get copilotTokenInfo(): ICopilotTokenInfo | null { return this._copilotTokenInfo; }

	private readonly _onDidChangeDefaultAccount = this._register(new Emitter<IDefaultAccount | null>());
	readonly onDidChangeDefaultAccount = this._onDidChangeDefaultAccount.event;

	private readonly _onDidChangePolicyData = this._register(new Emitter<IPolicyData | null>());
	readonly onDidChangePolicyData = this._onDidChangePolicyData.event;

	private readonly _onDidChangeCopilotTokenInfo = this._register(new Emitter<ICopilotTokenInfo | null>());
	readonly onDidChangeCopilotTokenInfo = this._onDidChangeCopilotTokenInfo.event;

	private readonly accountStatusContext: IContextKey<string>;
	private initialized = false;
	private readonly initPromise: Promise<void>;
	private readonly updateThrottler = this._register(new ThrottledDelayer(100));
	private readonly accountDataPollScheduler = this._register(new RunOnceScheduler(() => this.refetchDefaultAccount(), ACCOUNT_DATA_POLL_INTERVAL_MS));

	constructor(
		private readonly defaultAccountConfig: IDefaultAccountConfig,
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@IAuthenticationService private readonly authenticationService: IAuthenticationService,
		@IAuthenticationExtensionsService private readonly authenticationExtensionsService: IAuthenticationExtensionsService,
		@ITelemetryService private readonly telemetryService: ITelemetryService,
		@IExtensionService private readonly extensionService: IExtensionService,
		@IRequestService private readonly requestService: IRequestService,
		@ILogService private readonly logService: ILogService,
		@IWorkbenchEnvironmentService private readonly environmentService: IWorkbenchEnvironmentService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IStorageService private readonly storageService: IStorageService,
		@IHostService private readonly hostService: IHostService,
		@ICommandService private readonly commandService: ICommandService,
	) {
		super();
		this.accountStatusContext = CONTEXT_DEFAULT_ACCOUNT_STATE.bindTo(contextKeyService);
		const cachedAccountData = this.getCachedAccountData();
		this._policyData = cachedAccountData?.accountPolicyData ?? null;
		this._copilotTokenInfo = cachedAccountData?.copilotTokenInfo ?? null;
		this.initPromise = this.init()
			.finally(() => {
				this.telemetryService.publicLog2<DefaultAccountStatusTelemetry, DefaultAccountStatusTelemetryClassification>('defaultaccount:status', { status: this.defaultAccount ? 'available' : 'unavailable', initial: true });
				this.initialized = true;
			});
	}

	private getCachedAccountData(): ICachedAccountData | null {
		const cached = this.storageService.get(CACHED_POLICY_DATA_KEY, StorageScope.APPLICATION);
		if (cached) {
			try {
				const parsed = JSON.parse(cached);

				// TODO: Remove old format migration after August 2026.
				// Previously, the cache stored a flat IAccountPolicyData shape
				// (e.g. { accountId, policyData, ... }). We now wrap it inside
				// ICachedAccountData ({ accountPolicyData, copilotTokenInfo }).
				// This branch migrates the old flat format to the new shape and
				// re-stores it so subsequent reads use the new format directly.
				const { accountId, policyData, tokenEntitlementsFetchedAt, copilotTokenInfo } = parsed;
				if (accountId && policyData) {
					this.logService.debug('[DefaultAccount] Initializing with cached policy data (migrating old format)');
					const result: ICachedAccountData = { accountPolicyData: { accountId, policyData, tokenEntitlementsFetchedAt }, copilotTokenInfo };
					this.storageService.store(CACHED_POLICY_DATA_KEY, JSON.stringify(result), StorageScope.APPLICATION, StorageTarget.MACHINE);
					return result;
				}

				// New format
				const { accountPolicyData, copilotTokenInfo: wrappedCopilotTokenInfo } = parsed;
				if (accountPolicyData?.accountId && accountPolicyData?.policyData) {
					this.logService.debug('[DefaultAccount] Initializing with cached policy data');
					return { accountPolicyData, copilotTokenInfo: wrappedCopilotTokenInfo };
				}
			} catch (error) {
				this.logService.error('[DefaultAccount] Failed to parse cached policy data', getErrorMessage(error));
			}
		}
		return null;
	}

	private async init(): Promise<void> {
		// Skip initialization for web without remote (vscode.dev editor)
		if (isWeb && !this.environmentService.remoteAuthority) {
			this.logService.debug('[DefaultAccount] Running in web without remote, skipping initialization');
			return;
		}

		// Wait until the default account authentication provider is available instead of
		// waiting for all installed extensions to be registered. In desktop remote
		// connections extensions are only registered after the connection is established,
		// so waiting for `whenInstalledExtensionsRegistered` can deadlock initialization.
		await this.whenDefaultAccountAuthenticationProviderAvailable();

		this.logService.debug('[DefaultAccount] Starting initialization');
		await this.doUpdateDefaultAccount();
		this.logService.debug('[DefaultAccount] Initialization complete');

		this._register(this.onDidChangeDefaultAccount(account => {
			this.telemetryService.publicLog2<DefaultAccountStatusTelemetry, DefaultAccountStatusTelemetryClassification>('defaultaccount:status', { status: account ? 'available' : 'unavailable', initial: false });
		}));

		this._register(this.authenticationService.onDidChangeSessions(e => {
			const defaultAccountProvider = this.getDefaultAccountAuthenticationProvider();
			if (e.providerId !== defaultAccountProvider.id) {
				return;
			}
			// Providers can atomically replace a session, so only removal-only events represent an immediate sign-out.
			const added = e.event.added?.length ?? 0;
			const removed = e.event.removed?.length ?? 0;
			const changed = e.event.changed?.length ?? 0;
			const currentSessionRemoved = this.defaultAccount !== null && (e.event.removed?.some(session => session.id === this.defaultAccount?.sessionId) ?? false);
			const hasReplacementCandidates = added > 0 || changed > 0;
			const clearDefaultAccount = currentSessionRemoved && !hasReplacementCandidates;
			const message = `[DefaultAccount] Authentication sessions changed: added=${added}, removed=${removed}, changed=${changed}, currentSessionRemoved=${currentSessionRemoved}, hasReplacementCandidates=${hasReplacementCandidates}, decision=${clearDefaultAccount ? 'clear' : 'reconcile'}`;
			if (currentSessionRemoved || (added > 0 && removed > 0)) {
				this.logService.info(message);
			} else {
				this.logService.trace(message);
			}
			if (clearDefaultAccount) {
				this.setDefaultAccount(null);
			} else {
				this.updateDefaultAccount();
			}
		}));

		this._register(this.authenticationExtensionsService.onDidChangeAccountPreference(async e => {
			const defaultAccountProvider = this.getDefaultAccountAuthenticationProvider();
			if (e.providerId !== defaultAccountProvider.id) {
				return;
			}
			this.logService.debug('[DefaultAccount] Account preference changed for default account provider, updating default account');
			this.updateDefaultAccount();
		}));

		this._register(this.authenticationService.onDidRegisterAuthenticationProvider(e => {
			const defaultAccountProvider = this.getDefaultAccountAuthenticationProvider();
			if (e.id !== defaultAccountProvider.id) {
				return;
			}
			this.logService.debug('[DefaultAccount] Default account provider registered, updating default account');
			this.updateDefaultAccount();
		}));

		this._register(this.authenticationService.onDidUnregisterAuthenticationProvider(e => {
			const defaultAccountProvider = this.getDefaultAccountAuthenticationProvider();
			if (e.id !== defaultAccountProvider.id) {
				return;
			}
			this.logService.debug('[DefaultAccount] Default account provider unregistered, updating default account');
			this.updateDefaultAccount();
		}));

		this._register(this.hostService.onDidChangeFocus(focused => {
			if (focused) {
				this.refetchDefaultAccount();
			}
		}));
	}

	private async whenDefaultAccountAuthenticationProviderAvailable(): Promise<void> {
		const provider = this.getDefaultAccountAuthenticationProvider();

		this.logService.debug('[DefaultAccount] Waiting for default account authentication provider to be available.');
		const disposables = new DisposableStore();
		try {
			await new Promise<void>(resolve => {
				// Check if the provider is available.
				// If available, resolve immediately. Otherwise, wait for it to be declared or registered.
				if (this.isAccountProviderAvailable(provider)) {
					this.logService.debug('[DefaultAccount] Default account authentication provider is now available.');
					resolve();
					return;
				}

				// Resolve as soon as the default account authentication provider is declared or
				// registered, but wait no longer than installed extensions being registered.
				disposables.add(Event.any(this.authenticationService.onDidChangeDeclaredProviders, this.authenticationService.onDidRegisterAuthenticationProvider)(() => {
					if (this.isAccountProviderAvailable(provider)) {
						this.logService.debug('[DefaultAccount] Default account authentication provider is now available.');
						resolve();
					}
				}));

				// Explicitly activate the provider's extension so that the authentication
				// provider gets registered. In desktop remote connections extensions are only
				// registered after the connection is established, so without this the provider
				// would never become available.
				if (this.environmentService.remoteAuthority) {
					void this.authenticationService.getSessions(provider.id, undefined, {}, true);
				}

				this.extensionService.whenInstalledExtensionsRegistered().then(() => {
					disposables.dispose();
					this.logService.debug('[DefaultAccount] Installed extensions registered.');
					resolve();
				}, error => {
					this.logService.error('[DefaultAccount] Error while waiting for installed extensions to be registered', getErrorMessage(error));
					resolve();
				});
			});
		} finally {
			disposables.dispose();
		}
	}

	async refresh(options?: IDefaultAccountRefreshOptions): Promise<IDefaultAccount | null> {
		if (!this.initialized) {
			await this.initPromise;
			return this.defaultAccount;
		}

		this.logService.debug('[DefaultAccount] Refreshing default account');

		await this.updateDefaultAccount(options);
		return this.defaultAccount;
	}

	private async refetchDefaultAccount(): Promise<void> {
		if (this.accountDataPollScheduler.isScheduled()) {
			this.accountDataPollScheduler.cancel();
		}
		if (!this.hostService.hasFocus || !this._defaultAccount) {
			this.scheduleAccountDataPoll();
			this.logService.debug('[DefaultAccount] Skipping refetching default account. Host is not focused or default account is not set');
			return;
		}
		this.logService.debug('[DefaultAccount] Refetching default account');
		await this.updateDefaultAccount();
	}

	private async updateDefaultAccount(options?: IDefaultAccountRefreshOptions): Promise<void> {
		await this.updateThrottler.trigger(() => this.doUpdateDefaultAccount(options));
	}

	private async doUpdateDefaultAccount(options?: IDefaultAccountRefreshOptions): Promise<void> {
		const currentSessionId = this.defaultAccount?.sessionId;
		try {
			const defaultAccount = await this.fetchDefaultAccount(options);
			if (currentSessionId && this.defaultAccount?.sessionId !== currentSessionId) {
				this.logService.info('[DefaultAccount] Discarding default account update because the current session changed while the update was in progress');
				return;
			}
			this.setDefaultAccount(defaultAccount);
			this.scheduleAccountDataPoll();
		} catch (error) {
			this.logService.error('[DefaultAccount] Error while updating default account', getErrorMessage(error));
		}
	}

	private async fetchDefaultAccount(options?: IDefaultAccountRefreshOptions): Promise<IDefaultAccountData | null> {
		const defaultAccountProvider = this.getDefaultAccountAuthenticationProvider();
		this.logService.debug('[DefaultAccount] Default account provider ID:', defaultAccountProvider.id);

		if (!this.isAccountProviderAvailable(defaultAccountProvider)) {
			this.logService.info(`[DefaultAccount] Authentication provider is not available.`, defaultAccountProvider);
			return null;
		}

		return await this.getDefaultAccountForAuthenticationProvider(defaultAccountProvider, options);
	}

	private isAccountProviderAvailable(accountProvider: IDefaultAccountAuthenticationProvider): boolean {
		return this.authenticationService.declaredProviders.some(p => p.id === accountProvider.id)
			|| this.authenticationService.isAuthenticationProviderRegistered(accountProvider.id);
	}

	private setDefaultAccount(account: IDefaultAccountData | null): void {
		if (equals(this._defaultAccount, account)) {
			return;
		}

		this.logService.trace('[DefaultAccount] Updating default account:', account);
		if (account) {
			this._defaultAccount = account;
			this.setCopilotTokenInfo(account.copilotTokenInfo);
			this.setPolicyData(account.policyData);
			this._onDidChangeDefaultAccount.fire(this._defaultAccount.defaultAccount);
			this.accountStatusContext.set(DefaultAccountStatus.Available);
			this.logService.debug('[DefaultAccount] Account status set to Available');
		} else {
			this._defaultAccount = null;
			this.setPolicyData(null);
			this.setCopilotTokenInfo(null);
			this._onDidChangeDefaultAccount.fire(null);
			this.accountDataPollScheduler.cancel();
			this.accountStatusContext.set(DefaultAccountStatus.Unavailable);
			this.logService.debug('[DefaultAccount] Account status set to Unavailable');
		}
	}

	private setPolicyData(accountPolicyData: IAccountPolicyData | null): void {
		if (equals(this._policyData, accountPolicyData)) {
			return;
		}
		this._policyData = accountPolicyData;
		this.cachePolicyData(accountPolicyData);
		this._onDidChangePolicyData.fire(this._policyData?.policyData ?? null);
	}

	private setCopilotTokenInfo(copilotTokenInfo: ICopilotTokenInfo | null): void {
		if (equals(this._copilotTokenInfo, copilotTokenInfo)) {
			return;
		}
		this._copilotTokenInfo = copilotTokenInfo;
		this._onDidChangeCopilotTokenInfo.fire(this._copilotTokenInfo);
	}

	private cachePolicyData(accountPolicyData: IAccountPolicyData | null): void {
		if (accountPolicyData) {
			this.logService.debug('[DefaultAccount] Caching policy data for account:', accountPolicyData.accountId);
			const cachedAccountData: ICachedAccountData = {
				accountPolicyData,
				copilotTokenInfo: this._copilotTokenInfo ?? undefined,
			};
			this.storageService.store(CACHED_POLICY_DATA_KEY, JSON.stringify(cachedAccountData), StorageScope.APPLICATION, StorageTarget.MACHINE);
		} else {
			this.logService.debug('[DefaultAccount] Removing cached policy data');
			this.storageService.remove(CACHED_POLICY_DATA_KEY, StorageScope.APPLICATION);
		}
	}

	private scheduleAccountDataPoll(): void {
		if (!this._defaultAccount) {
			return;
		}
		this.accountDataPollScheduler.schedule(ACCOUNT_DATA_POLL_INTERVAL_MS);
	}

	private extractFromToken(token: string): Map<string, string> {
		const result = new Map<string, string>();
		const firstPart = token?.split(':')[0];
		const fields = firstPart?.split(';');
		for (const field of fields) {
			const [key, value] = field.split('=');
			result.set(key, value);
		}
		this.logService.debug(`[DefaultAccount] extractFromToken: ${JSON.stringify(Object.fromEntries(result))}`);
		return result;
	}

	private async getDefaultAccountForAuthenticationProvider(
		authenticationProvider: IDefaultAccountAuthenticationProvider,
		options?: IDefaultAccountRefreshOptions
	): Promise<IDefaultAccountData | null> {
		try {
			this.logService.debug('[DefaultAccount] Getting Default Account from authenticated sessions for provider:', authenticationProvider.id);
			const sessions = await this.findMatchingProviderSession(authenticationProvider.id, this.defaultAccountConfig.authenticationProvider.scopes);

			if (!sessions?.length) {
				this.logService.debug('[DefaultAccount] No matching session found for provider:', authenticationProvider.id);
				return null;
			}
			return this.getDefaultAccountFromAuthenticatedSessions(authenticationProvider, sessions, options);
		} catch (error) {
			this.logService.error('[DefaultAccount] Failed to get default account for provider:', authenticationProvider.id, getErrorMessage(error));
			return null;
		}
	}

	private async getDefaultAccountFromAuthenticatedSessions(
		authenticationProvider: IDefaultAccountAuthenticationProvider,
		sessions: AuthenticationSession[],
		options?: IDefaultAccountRefreshOptions
	): Promise<IDefaultAccountData | null> {
		try {
			const accountId = sessions[0].account.id;
			const accountPolicyData = this._policyData?.accountId === accountId ? this._policyData : undefined;

			const entitlementsResult = await this.getEntitlements(sessions, accountPolicyData, options);
			const entitlementsData = entitlementsResult?.data;
			const entitlementsFetchedAt = entitlementsResult?.fetchedAt;
			const tokenEntitlementsResult = entitlementsData?.chat_enabled ? await this.getTokenEntitlements(sessions, accountPolicyData, options) : undefined;

			const tokenEntitlementsFetchedAt: number | undefined = tokenEntitlementsResult?.fetchedAt;
			let policyData: Mutable<IPolicyData> | undefined = accountPolicyData?.policyData ? { ...accountPolicyData.policyData } : undefined;
			if (entitlementsData) {
				policyData = policyData ?? {};
				policyData.cloud_session_storage_enabled = entitlementsData.cloud_session_storage_enabled;
			}
			if (tokenEntitlementsResult?.data) {
				const tokenEntitlementsData = tokenEntitlementsResult.data;
				policyData = policyData ?? {};
				policyData.chat_agent_enabled = tokenEntitlementsData.policyData.chat_agent_enabled;
				policyData.chat_preview_features_enabled = tokenEntitlementsData.policyData.chat_preview_features_enabled;
			}

			const defaultAccount: IDefaultAccount = {
				authenticationProvider,
				accountName: sessions[0].account.label,
				sessionId: sessions[0].id,
				enterprise: authenticationProvider.enterprise || sessions[0].account.label.includes('_'),
				entitlementsData,
			};
			this.logService.debug('[DefaultAccount] Successfully created default account for provider:', authenticationProvider.id);
			const accountPolicyResult: IAccountPolicyData | null = policyData || entitlementsFetchedAt
				? {
					accountId,
					policyData: policyData ?? {},
					entitlementsFetchedAt,
					tokenEntitlementsFetchedAt,
				}
				: null;
			return {
				defaultAccount,
				accountId,
				policyData: accountPolicyResult,
				copilotTokenInfo: tokenEntitlementsResult?.data?.copilotTokenInfo ?? null,
			};
		} catch (error) {
			this.logService.error('[DefaultAccount] Failed to create default account for provider:', authenticationProvider.id, getErrorMessage(error));
			return null;
		}
	}

	private async findMatchingProviderSession(authProviderId: string, allScopes: string[][]): Promise<AuthenticationSession[] | undefined> {
		const sessions = await this.getSessions(authProviderId);
		const matchingSessions = sessions.filter(session => {
			this.logService.debug('[DefaultAccount] Checking session with scopes', session.scopes);
			return allScopes.some(scopes => this.scopesMatch(session.scopes, scopes));
		});
		return matchingSessions.length > 0 ? matchingSessions : undefined;
	}

	private async getSessions(authProviderId: string): Promise<readonly AuthenticationSession[]> {
		for (let attempt = 1; attempt <= 3; attempt++) {
			try {
				let preferredAccount: AuthenticationSessionAccount | undefined;
				let preferredAccountName: string | undefined;
				for (const preferredExtension of this.defaultAccountConfig.preferredExtensions) {
					preferredAccountName = this.authenticationExtensionsService.getAccountPreference(preferredExtension, authProviderId);
					if (preferredAccountName) {
						break;
					}
				}
				for (const account of await this.authenticationService.getAccounts(authProviderId)) {
					if (account.label === preferredAccountName) {
						preferredAccount = account;
						break;
					}
				}

				return await this.authenticationService.getSessions(authProviderId, undefined, { account: preferredAccount }, true);
			} catch (error) {
				this.logService.warn(`[DefaultAccount] Attempt ${attempt} to get sessions failed:`, getErrorMessage(error));
				if (attempt === 3) {
					throw error;
				}
				await timeout(500);
			}
		}
		throw new Error('Unable to get sessions after multiple attempts');
	}

	private scopesMatch(scopes: ReadonlyArray<string>, expectedScopes: string[]): boolean {
		return expectedScopes.every(scope => scopes.includes(scope));
	}

	private async getTokenEntitlements(sessions: AuthenticationSession[], accountPolicyData: IAccountPolicyData | undefined, options?: IDefaultAccountRefreshOptions): Promise<{ data: { policyData: Partial<IPolicyData>; copilotTokenInfo: ICopilotTokenInfo } | undefined; fetchedAt: number }> {
		if (!options?.forceRefresh && accountPolicyData?.tokenEntitlementsFetchedAt && !this.isDataStale(accountPolicyData.tokenEntitlementsFetchedAt)) {
			this.logService.debug('[DefaultAccount] Using last fetched token entitlements data');
			return { data: { policyData: accountPolicyData.policyData, copilotTokenInfo: this._copilotTokenInfo ?? {} }, fetchedAt: accountPolicyData.tokenEntitlementsFetchedAt };
		}
		const data = await this.requestTokenEntitlements(sessions);
		return { data, fetchedAt: Date.now() };
	}

	private async requestTokenEntitlements(sessions: AuthenticationSession[]): Promise<{ policyData: Partial<IPolicyData>; copilotTokenInfo: ICopilotTokenInfo } | undefined> {
		const tokenEntitlementsUrl = this.getTokenEntitlementUrl();
		if (!tokenEntitlementsUrl) {
			this.logService.debug('[DefaultAccount] No token entitlements URL found');
			return undefined;
		}

		this.logService.debug('[DefaultAccount] Fetching token entitlements from:', tokenEntitlementsUrl);
		const response = await this.request(tokenEntitlementsUrl, 'GET', undefined, sessions, CancellationToken.None, 'defaultAccount.tokenEntitlements');
		if (!response) {
			return undefined;
		}

		if (response.res.statusCode && response.res.statusCode !== 200) {
			this.logService.trace(`[DefaultAccount] unexpected status code ${response.res.statusCode} while fetching token entitlements`);
			return undefined;
		}

		try {
			const chatData = await asJson<ITokenEntitlementsResponse>(response);
			if (chatData) {
				const tokenMap = this.extractFromToken(chatData.token);
				return {
					policyData: {
						// Editor preview features are disabled if the flag is present and set to 0
						chat_preview_features_enabled: tokenMap.get('editor_preview_features') !== '0',
						chat_agent_enabled: tokenMap.get('agent_mode') !== '0',
						// MCP is only enabled if the flag is explicitly present and set to 1
						mcp: tokenMap.get('mcp') === '1',
					},
					copilotTokenInfo: {
						sn: tokenMap.get('sn'),
						fcv1: tokenMap.get('fcv1'),
					},
				};
			}
			this.logService.error('Failed to fetch token entitlements', 'No data returned');
		} catch (error) {
			this.logService.error('Failed to fetch token entitlements', getErrorMessage(error));
		}

		return undefined;
	}

	private async getEntitlements(sessions: AuthenticationSession[], accountPolicyData: IAccountPolicyData | undefined, options?: IDefaultAccountRefreshOptions): Promise<{ data: IEntitlementsData | undefined | null; fetchedAt: number | undefined }> {
		const accountId = sessions[0].account.id;
		const existingData = this._defaultAccount?.accountId === accountId ? this._defaultAccount?.defaultAccount.entitlementsData : undefined;
		if (!options?.forceRefresh && !options?.refreshEntitlements && existingData && accountPolicyData?.entitlementsFetchedAt && !this.isDataStale(accountPolicyData.entitlementsFetchedAt)) {
			this.logService.debug('[DefaultAccount] Using last fetched entitlements data');
			return { data: existingData, fetchedAt: accountPolicyData.entitlementsFetchedAt };
		}

		const entitlementUrl = this.getEntitlementUrl();
		if (!entitlementUrl) {
			this.logService.debug('[DefaultAccount] No chat entitlements URL found');
			return { data: undefined, fetchedAt: undefined };
		}

		this.logService.debug('[DefaultAccount] Fetching entitlements from:', entitlementUrl);
		const response = await this.request(entitlementUrl, 'GET', undefined, sessions, CancellationToken.None, 'defaultAccount.entitlements');
		if (!response) {
			return { data: undefined, fetchedAt: Date.now() };
		}

		if (response.res.statusCode && response.res.statusCode !== 200) {
			this.logService.trace(`[DefaultAccount] unexpected status code ${response.res.statusCode} while fetching entitlements`);
			const data = (
				response.res.statusCode === 401 || 	// oauth token being unavailable (expired/revoked)
				response.res.statusCode === 404		// missing scopes/permissions, service pretends the endpoint doesn't exist
			) ? null : undefined;
			return { data, fetchedAt: Date.now() };
		}

		try {
			const data = await asJson<IEntitlementsData>(response);
			if (data) {
				return { data, fetchedAt: Date.now() };
			}
			this.logService.error('[DefaultAccount] Failed to fetch entitlements', 'No data returned');
		} catch (error) {
			this.logService.error('[DefaultAccount] Failed to fetch entitlements', getErrorMessage(error));
		}
		return { data: undefined, fetchedAt: Date.now() };
	}

	/**
	 * Detects a rate-limited GitHub response. Mirrors the public-API check in
	 * `githubRepoFetcher.ts`:
	 * - Canonical `429 Too Many Requests`.
	 * - Primary quota exhaustion: `403` with `X-RateLimit-Remaining: 0`.
	 * - Secondary throttling: GitHub omits `X-RateLimit-Remaining` but sets
	 *   `Retry-After` (on a non-2xx response). We treat any non-success status
	 *   that carries `Retry-After` as a back-off signal.
	 */
	private isRateLimited(response: IRequestContext): boolean {
		const status = response.res.statusCode;
		if (status === 429) {
			return true;
		}
		if (status === 403 && readHeader(response.res.headers, 'x-ratelimit-remaining') === '0') {
			return true;
		}
		// Secondary rate limit: the server explicitly asks the client to wait,
		// regardless of which non-2xx code it returned with.
		if (!isSuccess(response) && readHeader(response.res.headers, 'retry-after') !== undefined) {
			return true;
		}
		return false;
	}

	private _rateLimitBackoffUntil = 0;

	private async request(url: string, type: 'GET', body: undefined, sessions: AuthenticationSession[], token: CancellationToken, callSite: string, options?: IAuthenticatedRequestOptions): Promise<IRequestContext | undefined>;
	private async request(url: string, type: 'POST', body: object, sessions: AuthenticationSession[], token: CancellationToken, callSite: string, options?: IAuthenticatedRequestOptions): Promise<IRequestContext | undefined>;
	private async request(url: string, type: 'GET' | 'POST', body: object | undefined, sessions: AuthenticationSession[], token: CancellationToken, callSite: string, options?: IAuthenticatedRequestOptions): Promise<IRequestContext | undefined> {
		if (Date.now() < this._rateLimitBackoffUntil) {
			const remainingSec = Math.ceil((this._rateLimitBackoffUntil - Date.now()) / 1000);
			this.logService.debug(`[DefaultAccount] Skipping request to ${url} — rate-limit backoff active for ${remainingSec}s more`);
			return undefined;
		}

		let lastResponse: IRequestContext | undefined;

		for (const session of sessions) {
			if (token.isCancellationRequested) {
				return lastResponse;
			}

			try {
				const response = await this.requestService.request({
					type,
					url,
					data: type === 'POST' ? JSON.stringify(body) : undefined,
					disableCache: true,
					timeout: options?.requestTimeoutMs,
					headers: {
						'Authorization': `Bearer ${session.accessToken}`
					},
					callSite
				}, token);

				const status = response.res.statusCode;
				if (this.isRateLimited(response)) {
					const retryAfterSec = retryAfterFromHeaders(response.res.headers) ?? 60;
					this._rateLimitBackoffUntil = Date.now() + retryAfterSec * 1000;
					this.logService.warn(`[DefaultAccount] Rate limited by ${url} (status ${status}); backing off for ${retryAfterSec}s`);
					return response;
				}
				if (status === 401 || (status === 404 && options?.retryNotFound !== false)) {
					this.logService.debug(`[DefaultAccount] Received ${status} for URL ${url} with session ${session.id}, likely due to expired/revoked token or insufficient permissions.`, 'Trying next session if available.');
					lastResponse = response;
					continue; // try next session
				}

				return response;
			} catch (error) {
				if (!token.isCancellationRequested) {
					this.logService.error(`[DefaultAccount] request: error ${error}`, url);
				}
			}
		}

		if (!lastResponse) {
			this.logService.trace('[DefaultAccount]: No response received for request', url);
			return undefined;
		}

		return lastResponse;
	}

	private isDataStale(fetchedAt: number): boolean {
		return (Date.now() - fetchedAt) >= ACCOUNT_DATA_POLL_INTERVAL_MS;
	}

	private getEntitlementUrl(): string | undefined {
		if (this.getDefaultAccountAuthenticationProvider().enterprise) {
			try {
				const enterpriseUrl = this.getEnterpriseUrl();
				if (!enterpriseUrl) {
					return undefined;
				}
				return `${enterpriseUrl.protocol}//api.${enterpriseUrl.hostname}${enterpriseUrl.port ? ':' + enterpriseUrl.port : ''}/copilot_internal/user`;
			} catch (error) {
				this.logService.error(error);
			}
		}

		return this.defaultAccountConfig.entitlementUrl;
	}

	private getTokenEntitlementUrl(): string | undefined {
		if (this.getDefaultAccountAuthenticationProvider().enterprise) {
			try {
				const enterpriseUrl = this.getEnterpriseUrl();
				if (!enterpriseUrl) {
					return undefined;
				}
				return `${enterpriseUrl.protocol}//api.${enterpriseUrl.hostname}${enterpriseUrl.port ? ':' + enterpriseUrl.port : ''}/copilot_internal/v2/token`;
			} catch (error) {
				this.logService.error(error);
			}
		}

		return this.defaultAccountConfig.tokenEntitlementUrl;
	}

	getDefaultAccountAuthenticationProvider(): IDefaultAccountAuthenticationProvider {
		if (this.configurationService.getValue<string | undefined>(this.defaultAccountConfig.authenticationProvider.enterpriseProviderConfig) === this.defaultAccountConfig.authenticationProvider.enterprise.id) {
			return {
				...this.defaultAccountConfig.authenticationProvider.enterprise,
				enterprise: true
			};
		}
		return {
			...this.defaultAccountConfig.authenticationProvider.default,
			enterprise: false
		};
	}

	resolveGitHubUrl(path: string): string {
		if (this.getDefaultAccountAuthenticationProvider().enterprise) {
			try {
				const enterpriseUrl = this.getEnterpriseUrl();
				if (enterpriseUrl) {
					return `${enterpriseUrl.protocol}//${enterpriseUrl.host}/${path}`;
				}
			} catch {
				// fall through to default
			}
		}

		return `https://github.com/${path}`;
	}

	private getEnterpriseUrl(): URL | undefined {
		const value = this.configurationService.getValue(this.defaultAccountConfig.authenticationProvider.enterpriseProviderUriSetting);
		if (!isString(value)) {
			return undefined;
		}
		return new URL(value);
	}

	async signIn(options?: { additionalScopes?: readonly string[];[key: string]: unknown }): Promise<IDefaultAccount | null> {
		const authProvider = this.getDefaultAccountAuthenticationProvider();
		if (!authProvider) {
			throw new Error('No default account provider configured');
		}
		const { additionalScopes, ...sessionOptions } = options ?? {};
		const defaultAccountScopes = this.defaultAccountConfig.authenticationProvider.scopes[0];
		const scopes = additionalScopes ? distinct([...defaultAccountScopes, ...additionalScopes]) : defaultAccountScopes;
		const session = await this.authenticationService.createSession(authProvider.id, scopes, sessionOptions);
		for (const preferredExtension of this.defaultAccountConfig.preferredExtensions) {
			this.authenticationExtensionsService.updateAccountPreference(preferredExtension, authProvider.id, session.account);
		}
		await this.updateDefaultAccount();
		return this.defaultAccount;
	}

	async signOut(): Promise<void> {
		if (!this.defaultAccount) {
			return;
		}
		await this.commandService.executeCommand('_signOutOfAccount', { providerId: this.defaultAccount.authenticationProvider.id, accountLabel: this.defaultAccount.accountName });
	}

}

class DefaultAccountProviderContribution extends Disposable implements IWorkbenchContribution {

	static ID = 'workbench.contributions.defaultAccountProvider';

	constructor(
		@IProductService productService: IProductService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IDefaultAccountService defaultAccountService: IDefaultAccountService,
	) {
		super();
		if (!productService.defaultChatAgent) {
			return;
		}
		const defaultAccountProvider = this._register(instantiationService.createInstance(DefaultAccountProvider, toDefaultAccountConfig(productService.defaultChatAgent)));
		defaultAccountService.setDefaultAccountProvider(defaultAccountProvider);
	}
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: DEFAULT_ACCOUNT_SIGN_IN_COMMAND,
			title: localize2('signIn', 'Sign In'),
		});
	}
	async run(accessor: ServicesAccessor): Promise<void> {
		const defaultAccountService = accessor.get(IDefaultAccountService);
		await defaultAccountService.signIn();
	}
});

registerWorkbenchContribution2(DefaultAccountProviderContribution.ID, DefaultAccountProviderContribution, WorkbenchPhase.BlockStartup);

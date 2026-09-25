/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { PolicyCategory } from '../../../../base/common/policy.js';
import { URI } from '../../../../base/common/uri.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../base/test/common/utils.js';
import { Extensions, IConfigurationNode, IConfigurationRegistry } from '../../../configuration/common/configurationRegistry.js';
import { DefaultConfiguration, PolicyConfiguration } from '../../../configuration/common/configurations.js';
import { IFileService } from '../../../files/common/files.js';
import { FileService } from '../../../files/common/fileService.js';
import { InMemoryFileSystemProvider } from '../../../files/common/inMemoryFilesystemProvider.js';
import { NullLogService } from '../../../log/common/log.js';
import { FilePolicyService } from '../../common/filePolicyService.js';
import { PolicyValueSource } from '../../common/policy.js';
import { Registry } from '../../../registry/common/platform.js';
import { MultiplexPolicyService } from '../../common/multiplexPolicyService.js';

suite('MultiplexPolicyService', () => {

	const disposables = ensureNoDisposablesAreLeakedInTestSuite();

	let policyService: MultiplexPolicyService;
	let fileService: IFileService;
	let policyConfiguration: PolicyConfiguration;
	const logService = new NullLogService();

	const policyFileA = URI.file('policyFileA').with({ scheme: 'vscode-tests' });
	const policyFileB = URI.file('policyFileB').with({ scheme: 'vscode-tests' });
	const policyConfigurationNode: IConfigurationNode = {
		'id': 'policyConfiguration',
		'order': 1,
		'title': 'a',
		'type': 'object',
		'properties': {
			'setting.A': {
				'type': 'string',
				'default': 'defaultValueA',
				policy: {
					name: 'PolicySettingA',
					category: PolicyCategory.Extensions,
					minimumVersion: '1.0.0',
					localization: { description: { key: '', value: '' } }
				}
			},
			'setting.B': {
				'type': 'string',
				'default': 'defaultValueB',
				policy: {
					name: 'PolicySettingB',
					category: PolicyCategory.Extensions,
					minimumVersion: '1.0.0',
					localization: { description: { key: '', value: '' } }
				}
			},
			'setting.C': {
				'type': 'string',
				'default': 'defaultValueC',
			},
		}
	};

	suiteSetup(() => Registry.as<IConfigurationRegistry>(Extensions.Configuration).registerConfiguration(policyConfigurationNode));
	suiteTeardown(() => Registry.as<IConfigurationRegistry>(Extensions.Configuration).deregisterConfigurations([policyConfigurationNode]));

	setup(async () => {
		const defaultConfiguration = disposables.add(new DefaultConfiguration(new NullLogService()));
		await defaultConfiguration.initialize();

		fileService = disposables.add(new FileService(new NullLogService()));
		const diskFileSystemProvider = disposables.add(new InMemoryFileSystemProvider());
		disposables.add(fileService.registerProvider(policyFileA.scheme, diskFileSystemProvider));

		policyService = disposables.add(new MultiplexPolicyService([
			disposables.add(new FilePolicyService(policyFileA, fileService, new NullLogService())),
			disposables.add(new FilePolicyService(policyFileB, fileService, new NullLogService())),
		], logService));
		policyConfiguration = disposables.add(new PolicyConfiguration(defaultConfiguration, policyService, new NullLogService()));
	});

	async function writePolicies(resource: URI, policies: Record<string, string>): Promise<void> {
		await fileService.writeFile(resource, VSBuffer.fromString(JSON.stringify(policies)));
	}

	test('no policy', async () => {
		await writePolicies(policyFileA, {});
		await writePolicies(policyFileB, {});

		await policyConfiguration.initialize();

		assert.strictEqual(policyService.getPolicyValue('PolicySettingA'), undefined);
		assert.strictEqual(policyService.getPolicyValue('PolicySettingB'), undefined);
		assert.strictEqual(policyConfiguration.configurationModel.getValue('setting.A'), undefined);
		assert.strictEqual(policyConfiguration.configurationModel.getValue('setting.B'), undefined);
		assert.strictEqual(policyConfiguration.configurationModel.getValue('setting.C'), undefined);
	});

	test('policy from one service only', async () => {
		await writePolicies(policyFileA, { 'PolicySettingA': 'policyValueA' });
		await writePolicies(policyFileB, {});

		await policyConfiguration.initialize();

		assert.strictEqual(policyService.getPolicyValue('PolicySettingA'), 'policyValueA');
		assert.strictEqual(policyService.getPolicyValueSource('PolicySettingA'), PolicyValueSource.Device);
		assert.strictEqual(policyService.getPolicyValue('PolicySettingB'), undefined);
		assert.strictEqual(policyConfiguration.configurationModel.getValue('setting.A'), 'policyValueA');
		assert.strictEqual(policyConfiguration.configurationModel.getValue('setting.B'), undefined);
	});

	test('policies from both services', async () => {
		await writePolicies(policyFileA, { 'PolicySettingA': 'policyValueA' });
		await writePolicies(policyFileB, { 'PolicySettingB': 'policyValueB' });

		await policyConfiguration.initialize();

		assert.strictEqual(policyService.getPolicyValue('PolicySettingA'), 'policyValueA');
		assert.strictEqual(policyService.getPolicyValue('PolicySettingB'), 'policyValueB');
		assert.strictEqual(policyConfiguration.configurationModel.getValue('setting.A'), 'policyValueA');
		assert.strictEqual(policyConfiguration.configurationModel.getValue('setting.B'), 'policyValueB');
		assert.strictEqual(policyConfiguration.configurationModel.getValue('setting.C'), undefined);
	});
});

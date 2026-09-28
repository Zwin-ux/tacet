/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { refineServiceDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { Event } from '../../../../base/common/event.js';
import { Color } from '../../../../base/common/color.js';
import { IColorTheme, IThemeService, IFileIconTheme, IProductIconTheme } from '../../../../platform/theme/common/themeService.js';
import { ConfigurationTarget } from '../../../../platform/configuration/common/configuration.js';
import { isBoolean, isString } from '../../../../base/common/types.js';
import { IconContribution, IconDefinition } from '../../../../platform/theme/common/iconRegistry.js';
import { ColorScheme, ThemeTypeSelector } from '../../../../platform/theme/common/theme.js';

export const IWorkbenchThemeService = refineServiceDecorator<IThemeService, IWorkbenchThemeService>(IThemeService);

export const THEME_SCOPE_OPEN_PAREN = '[';
export const THEME_SCOPE_CLOSE_PAREN = ']';
export const THEME_SCOPE_WILDCARD = '*';

export const themeScopeRegex = /\[(.+?)\]/g;

export enum ThemeSettings {
	COLOR_THEME = 'workbench.colorTheme',
	FILE_ICON_THEME = 'workbench.iconTheme',
	PRODUCT_ICON_THEME = 'workbench.productIconTheme',
	COLOR_CUSTOMIZATIONS = 'workbench.colorCustomizations',
	TOKEN_COLOR_CUSTOMIZATIONS = 'editor.tokenColorCustomizations',
	SEMANTIC_TOKEN_COLOR_CUSTOMIZATIONS = 'editor.semanticTokenColorCustomizations',

	PREFERRED_DARK_THEME = 'workbench.preferredDarkColorTheme',
	PREFERRED_LIGHT_THEME = 'workbench.preferredLightColorTheme',
	PREFERRED_HC_DARK_THEME = 'workbench.preferredHighContrastColorTheme', /* id kept for compatibility reasons */
	PREFERRED_HC_LIGHT_THEME = 'workbench.preferredHighContrastLightColorTheme',
	DETECT_COLOR_SCHEME = 'window.autoDetectColorScheme',
	DETECT_HC = 'window.autoDetectHighContrast',

	SYSTEM_COLOR_THEME = 'window.systemColorTheme'
}

export namespace ThemeSettingDefaults {
	export const COLOR_THEME_DARK = 'Tacet Dark';
	export const COLOR_THEME_LIGHT = 'Tacet Light';
	export const COLOR_THEME_HC_DARK = 'Default High Contrast';
	export const COLOR_THEME_HC_LIGHT = 'Tacet High Contrast Light';

	export const FILE_ICON_THEME = 'vs-seti';
	export const PRODUCT_ICON_THEME = 'Default';
}

/**
 * Migrates legacy theme settings IDs to their current equivalents.
 * Theme IDs were simplified: "Default" prefix was removed from built-in themes,
 * and "Experimental" prefix was replaced when VS Code themes became GA.
 */
export function migrateThemeSettingsId(settingsId: string): string {
	switch (settingsId) {
		case 'Default Dark Modern': return 'Dark Modern';
		case 'Default Light Modern': return 'Light Modern';
		case 'Default Dark+': return 'Dark+';
		case 'Default Light+': return 'Light+';
		case 'Experimental Dark':
		case 'VS Code Dark':
			return ThemeSettingDefaults.COLOR_THEME_DARK;
		case 'Experimental Light':
		case 'VS Code Light':
			return ThemeSettingDefaults.COLOR_THEME_LIGHT;
	}
	return settingsId;
}

export const COLOR_THEME_DARK_INITIAL_COLORS = {
	'actionBar.toggledBackground': '#24324A',
	'activityBar.activeBorder': '#6EA6FF',
	'activityBar.background': '#222428',
	'activityBar.border': '#2E3136',
	'activityBar.foreground': '#E7E9EC',
	'activityBar.inactiveForeground': '#A2A9B4',
	'activityBarBadge.background': '#2F6FD8',
	'activityBarBadge.foreground': '#FFFFFF',
	'badge.background': '#26282C',
	'badge.foreground': '#A2A9B4',
	'button.background': '#2F6FD8',
	'button.border': '#00000000',
	'button.foreground': '#FFFFFF',
	'button.hoverBackground': '#3A7BE6',
	'button.secondaryBackground': '#26282C',
	'button.secondaryForeground': '#E7E9EC',
	'button.secondaryHoverBackground': '#34373D',
	'checkbox.background': '#1B1C1F',
	'checkbox.border': '#6B7380',
	'debugToolBar.background': '#2A2C31',
	'descriptionForeground': '#A2A9B4',
	'dropdown.background': '#1B1C1F',
	'dropdown.border': '#44484F',
	'dropdown.foreground': '#E7E9EC',
	'dropdown.listBackground': '#2A2C31',
	'editor.background': '#1B1C1F',
	'editor.findMatchBackground': '#8A6A1F',
	'editor.foreground': '#E7E9EC',
	'editor.inactiveSelectionBackground': '#30343B',
	'editor.selectionHighlightBackground': '#2B4C7E80',
	'editorGroup.border': '#2E3136',
	'editorGroupHeader.tabsBackground': '#1B1C1F',
	'editorGroupHeader.tabsBorder': '#00000000',
	'editorGutter.addedBackground': '#8FD19E',
	'editorGutter.deletedBackground': '#FF8A80',
	'editorGutter.modifiedBackground': '#6EA6FF',
	'editorIndentGuide.activeBackground1': '#44484F',
	'editorIndentGuide.background1': '#2E3136',
	'editorLineNumber.activeForeground': '#A2A9B4',
	'editorLineNumber.foreground': '#6B7380',
	'editorOverviewRuler.border': '#00000000',
	'editorWidget.background': '#2A2C31',
	'errorForeground': '#FF8A80',
	'focusBorder': '#6EA6FF',
	'foreground': '#E7E9EC',
	'icon.foreground': '#A2A9B4',
	'input.background': '#1B1C1F',
	'input.border': '#44484F',
	'input.foreground': '#E7E9EC',
	'input.placeholderForeground': '#8B929D',
	'inputOption.activeBackground': '#24324A',
	'inputOption.activeBorder': '#00000000',
	'keybindingLabel.foreground': '#A2A9B4',
	'list.activeSelectionIconForeground': '#9CC2FF',
	'list.dropBackground': '#6EA6FF1A',
	'menu.background': '#2A2C31',
	'menu.border': '#3A3D43',
	'menu.foreground': '#E7E9EC',
	'menu.selectionBackground': '#24324A',
	'menu.separatorBackground': '#292B30',
	'notificationCenterHeader.background': '#2A2C31',
	'notificationCenterHeader.foreground': '#A2A9B4',
	'notifications.background': '#2A2C31',
	'notifications.border': '#292B30',
	'notifications.foreground': '#E7E9EC',
	'panel.background': '#1B1C1F',
	'panel.border': '#2E3136',
	'panelInput.border': '#44484F',
	'panelTitle.activeBorder': '#6EA6FF',
	'panelTitle.activeForeground': '#E7E9EC',
	'panelTitle.inactiveForeground': '#A2A9B4',
	'peekViewEditor.background': '#1B1C1F',
	'peekViewEditor.matchHighlightBackground': '#4A3D1C',
	'peekViewResult.background': '#222428',
	'peekViewResult.matchHighlightBackground': '#4A3D1C',
	'pickerGroup.border': '#292B30',
	'ports.iconRunningProcessForeground': '#8FD19E',
	'progressBar.background': '#6EA6FF',
	'quickInput.background': '#2A2C31',
	'quickInput.foreground': '#E7E9EC',
	'settings.dropdownBorder': '#44484F',
	'settings.headerForeground': '#E7E9EC',
	'settings.modifiedItemIndicator': '#6EA6FF',
	'sideBar.background': '#222428',
	'sideBar.border': '#2E3136',
	'sideBar.foreground': '#E7E9EC',
	'sideBarSectionHeader.background': '#00000000',
	'sideBarSectionHeader.border': '#00000000',
	'sideBarSectionHeader.foreground': '#A2A9B4',
	'sideBarTitle.foreground': '#A2A9B4',
	'statusBar.background': '#1B1C1F',
	'statusBar.border': '#00000000',
	'statusBar.debuggingBackground': '#1B1C1F',
	'statusBar.debuggingForeground': '#E9C77A',
	'statusBar.focusBorder': '#6EA6FF',
	'statusBar.foreground': '#A2A9B4',
	'statusBar.noFolderBackground': '#1B1C1F',
	'statusBarItem.focusBorder': '#6EA6FF',
	'statusBarItem.prominentBackground': '#00000000',
	'statusBarItem.remoteBackground': '#00000000',
	'statusBarItem.remoteForeground': '#A2A9B4',
	'tab.activeBackground': '#1B1C1F',
	'tab.activeBorder': '#00000000',
	'tab.activeBorderTop': '#00000000',
	'tab.activeForeground': '#E7E9EC',
	'tab.border': '#00000000',
	'tab.hoverBackground': '#27292E',
	'tab.inactiveBackground': '#1B1C1F',
	'tab.inactiveForeground': '#A2A9B4',
	'tab.lastPinnedBorder': '#2E3136',
	'tab.selectedBackground': '#1B1C1F',
	'tab.selectedBorderTop': '#00000000',
	'tab.selectedForeground': '#E7E9EC',
	'tab.unfocusedActiveBorder': '#00000000',
	'tab.unfocusedActiveBorderTop': '#00000000',
	'tab.unfocusedHoverBackground': '#27292E',
	'terminal.foreground': '#E7E9EC',
	'terminal.inactiveSelectionBackground': '#30343B',
	'terminal.tab.activeBorder': '#6EA6FF',
	'textBlockQuote.background': '#00000000',
	'textBlockQuote.border': '#34507A',
	'textCodeBlock.background': '#26282C',
	'textLink.activeForeground': '#3A7BE6',
	'textLink.foreground': '#6EA6FF',
	'textPreformat.background': '#26282C',
	'textPreformat.foreground': '#E7E9EC',
	'textSeparator.foreground': '#2E3136',
	'titleBar.activeBackground': '#1B1C1F',
	'titleBar.activeForeground': '#E7E9EC',
	'titleBar.border': '#00000000',
	'titleBar.inactiveBackground': '#1B1C1F',
	'titleBar.inactiveForeground': '#A2A9B4',
	'welcomePage.progress.foreground': '#6EA6FF',
	'welcomePage.tileBackground': '#1B1C1F',
	'widget.border': '#3A3D43'
};

export const COLOR_THEME_LIGHT_INITIAL_COLORS = {
	'actionBar.toggledBackground': '#E3ECFB',
	'activityBar.activeBorder': '#2167D5',
	'activityBar.background': '#F6F7F9',
	'activityBar.border': '#E6E9EE',
	'activityBar.foreground': '#22252B',
	'activityBar.inactiveForeground': '#596272',
	'activityBarBadge.background': '#2167D5',
	'activityBarBadge.foreground': '#FFFFFF',
	'badge.background': '#F2F4F7',
	'badge.foreground': '#596272',
	'button.background': '#2167D5',
	'button.border': '#00000000',
	'button.foreground': '#FFFFFF',
	'button.hoverBackground': '#1A58BA',
	'button.secondaryBackground': '#F2F4F7',
	'button.secondaryForeground': '#22252B',
	'button.secondaryHoverBackground': '#E6E9EE',
	'checkbox.background': '#FFFFFF',
	'checkbox.border': '#8A94A3',
	'descriptionForeground': '#596272',
	'diffEditor.unchangedRegionBackground': '#F6F7F9',
	'dropdown.background': '#FFFFFF',
	'dropdown.border': '#D9DDE3',
	'dropdown.foreground': '#22252B',
	'dropdown.listBackground': '#FFFFFF',
	'editor.background': '#FFFFFF',
	'editor.foreground': '#22252B',
	'editor.inactiveSelectionBackground': '#E4E9F0',
	'editor.selectionHighlightBackground': '#CCDEFB80',
	'editorGroup.border': '#E6E9EE',
	'editorGroupHeader.tabsBackground': '#FFFFFF',
	'editorGroupHeader.tabsBorder': '#00000000',
	'editorGutter.addedBackground': '#1E7A4C',
	'editorGutter.deletedBackground': '#B42A33',
	'editorGutter.modifiedBackground': '#2167D5',
	'editorIndentGuide.activeBackground1': '#D9DDE3',
	'editorIndentGuide.background1': '#E6E9EE',
	'editorLineNumber.activeForeground': '#596272',
	'editorLineNumber.foreground': '#8A94A3',
	'editorOverviewRuler.border': '#00000000',
	'editorSuggestWidget.background': '#FFFFFF',
	'editorWidget.background': '#FFFFFF',
	'errorForeground': '#B42A33',
	'focusBorder': '#2167D5',
	'foreground': '#22252B',
	'icon.foreground': '#596272',
	'input.background': '#FFFFFF',
	'input.border': '#D9DDE3',
	'input.foreground': '#22252B',
	'input.placeholderForeground': '#676F7C',
	'inputOption.activeBackground': '#E3ECFB',
	'inputOption.activeBorder': '#00000000',
	'inputOption.activeForeground': '#1A58BA',
	'keybindingLabel.foreground': '#596272',
	'list.activeSelectionBackground': '#E3ECFB',
	'list.activeSelectionForeground': '#1A58BA',
	'list.activeSelectionIconForeground': '#1A58BA',
	'list.focusAndSelectionOutline': '#00000000',
	'list.hoverBackground': '#ECEEF2',
	'menu.border': '#DDE1E7',
	'menu.selectionBackground': '#E3ECFB',
	'menu.selectionForeground': '#1A58BA',
	'notebook.cellBorderColor': '#E6E9EE',
	'notebook.selectedCellBackground': '#F2F4F780',
	'notificationCenterHeader.background': '#FFFFFF',
	'notificationCenterHeader.foreground': '#596272',
	'notifications.background': '#FFFFFF',
	'notifications.border': '#EEF0F3',
	'notifications.foreground': '#22252B',
	'panel.background': '#FFFFFF',
	'panel.border': '#E6E9EE',
	'panelInput.border': '#D9DDE3',
	'panelTitle.activeBorder': '#2167D5',
	'panelTitle.activeForeground': '#22252B',
	'panelTitle.inactiveForeground': '#596272',
	'peekViewEditor.matchHighlightBackground': '#FFF0C2',
	'peekViewResult.background': '#F6F7F9',
	'peekViewResult.matchHighlightBackground': '#FFF0C2',
	'pickerGroup.border': '#EEF0F3',
	'pickerGroup.foreground': '#596272',
	'ports.iconRunningProcessForeground': '#1E7A4C',
	'progressBar.background': '#2167D5',
	'quickInput.background': '#FFFFFF',
	'quickInput.foreground': '#22252B',
	'searchEditor.textInputBorder': '#D9DDE3',
	'settings.dropdownBorder': '#D9DDE3',
	'settings.headerForeground': '#22252B',
	'settings.modifiedItemIndicator': '#2167D5',
	'settings.numberInputBorder': '#D9DDE3',
	'settings.textInputBorder': '#D9DDE3',
	'sideBar.background': '#F6F7F9',
	'sideBar.border': '#E6E9EE',
	'sideBar.foreground': '#22252B',
	'sideBarSectionHeader.background': '#00000000',
	'sideBarSectionHeader.border': '#00000000',
	'sideBarSectionHeader.foreground': '#596272',
	'sideBarTitle.foreground': '#596272',
	'statusBar.background': '#FFFFFF',
	'statusBar.border': '#00000000',
	'statusBar.debuggingBackground': '#FFFFFF',
	'statusBar.debuggingForeground': '#7A5313',
	'statusBar.focusBorder': '#2167D5',
	'statusBar.foreground': '#596272',
	'statusBar.noFolderBackground': '#FFFFFF',
	'statusBarItem.compactHoverBackground': '#F2F4F7',
	'statusBarItem.errorBackground': '#00000000',
	'statusBarItem.focusBorder': '#2167D5',
	'statusBarItem.hoverBackground': '#F2F4F7',
	'statusBarItem.prominentBackground': '#00000000',
	'statusBarItem.remoteBackground': '#00000000',
	'statusBarItem.remoteForeground': '#596272',
	'tab.activeBackground': '#FFFFFF',
	'tab.activeBorder': '#00000000',
	'tab.activeBorderTop': '#00000000',
	'tab.activeForeground': '#22252B',
	'tab.border': '#00000000',
	'tab.hoverBackground': '#F2F4F7',
	'tab.inactiveBackground': '#FFFFFF',
	'tab.inactiveForeground': '#596272',
	'tab.lastPinnedBorder': '#E6E9EE',
	'tab.selectedBackground': '#FFFFFF',
	'tab.selectedBorderTop': '#00000000',
	'tab.selectedForeground': '#22252B',
	'tab.unfocusedActiveBorder': '#00000000',
	'tab.unfocusedActiveBorderTop': '#00000000',
	'tab.unfocusedHoverBackground': '#F2F4F7',
	'terminal.foreground': '#22252B',
	'terminal.inactiveSelectionBackground': '#E4E9F0',
	'terminal.tab.activeBorder': '#2167D5',
	'terminalCursor.foreground': '#2167D5',
	'textBlockQuote.background': '#00000000',
	'textBlockQuote.border': '#BCD3F6',
	'textCodeBlock.background': '#F2F4F7',
	'textLink.activeForeground': '#1A58BA',
	'textLink.foreground': '#2167D5',
	'textPreformat.background': '#F2F4F7',
	'textPreformat.foreground': '#22252B',
	'textSeparator.foreground': '#E6E9EE',
	'titleBar.activeBackground': '#FFFFFF',
	'titleBar.activeForeground': '#22252B',
	'titleBar.border': '#00000000',
	'titleBar.inactiveBackground': '#FFFFFF',
	'titleBar.inactiveForeground': '#596272',
	'welcomePage.tileBackground': '#FFFFFF',
	'widget.border': '#DDE1E7'
};

export interface IWorkbenchTheme {
	readonly id: string;
	readonly label: string;
	readonly extensionData?: ExtensionData;
	readonly description?: string;
	readonly settingsId: string | null;
}

export interface IWorkbenchColorTheme extends IWorkbenchTheme, IColorTheme {
	readonly settingsId: string;
	readonly tokenColors: ITextMateThemingRule[];
}

export interface IColorMap {
	[id: string]: Color;
}

export interface IWorkbenchFileIconTheme extends IWorkbenchTheme, IFileIconTheme {
}

export interface IWorkbenchProductIconTheme extends IWorkbenchTheme, IProductIconTheme {
	readonly settingsId: string;

	getIcon(icon: IconContribution): IconDefinition | undefined;
}

export type ThemeSettingTarget = ConfigurationTarget | undefined | 'auto' | 'preview';


export interface IWorkbenchThemeService extends IThemeService {
	readonly _serviceBrand: undefined;
	setColorTheme(themeId: string | undefined | IWorkbenchColorTheme, settingsTarget: ThemeSettingTarget): Promise<IWorkbenchColorTheme | null>;
	getColorTheme(): IWorkbenchColorTheme;
	getColorThemes(): Promise<IWorkbenchColorTheme[]>;
	getMarketplaceColorThemes(publisher: string, name: string, version: string): Promise<IWorkbenchColorTheme[]>;
	readonly onDidColorThemeChange: Event<IWorkbenchColorTheme>;

	getPreferredColorScheme(): ColorScheme | undefined;

	setFileIconTheme(iconThemeId: string | undefined | IWorkbenchFileIconTheme, settingsTarget: ThemeSettingTarget): Promise<IWorkbenchFileIconTheme>;
	getFileIconTheme(): IWorkbenchFileIconTheme;
	getFileIconThemes(): Promise<IWorkbenchFileIconTheme[]>;
	getMarketplaceFileIconThemes(publisher: string, name: string, version: string): Promise<IWorkbenchFileIconTheme[]>;
	readonly onDidFileIconThemeChange: Event<IWorkbenchFileIconTheme>;

	setProductIconTheme(iconThemeId: string | undefined | IWorkbenchProductIconTheme, settingsTarget: ThemeSettingTarget): Promise<IWorkbenchProductIconTheme>;
	getProductIconTheme(): IWorkbenchProductIconTheme;
	getProductIconThemes(): Promise<IWorkbenchProductIconTheme[]>;
	getMarketplaceProductIconThemes(publisher: string, name: string, version: string): Promise<IWorkbenchProductIconTheme[]>;
	readonly onDidProductIconThemeChange: Event<IWorkbenchProductIconTheme>;
}

export interface IThemeScopedColorCustomizations {
	[colorId: string]: string;
}

export interface IColorCustomizations {
	[colorIdOrThemeScope: string]: IThemeScopedColorCustomizations | string;
}

export interface IThemeScopedTokenColorCustomizations {
	[groupId: string]: ITextMateThemingRule[] | ITokenColorizationSetting | boolean | string | undefined;
	comments?: string | ITokenColorizationSetting;
	strings?: string | ITokenColorizationSetting;
	numbers?: string | ITokenColorizationSetting;
	keywords?: string | ITokenColorizationSetting;
	types?: string | ITokenColorizationSetting;
	functions?: string | ITokenColorizationSetting;
	variables?: string | ITokenColorizationSetting;
	textMateRules?: ITextMateThemingRule[];
	semanticHighlighting?: boolean; // deprecated, use ISemanticTokenColorCustomizations.enabled instead
}

export interface ITokenColorCustomizations {
	[groupIdOrThemeScope: string]: IThemeScopedTokenColorCustomizations | ITextMateThemingRule[] | ITokenColorizationSetting | boolean | string | undefined;
	comments?: string | ITokenColorizationSetting;
	strings?: string | ITokenColorizationSetting;
	numbers?: string | ITokenColorizationSetting;
	keywords?: string | ITokenColorizationSetting;
	types?: string | ITokenColorizationSetting;
	functions?: string | ITokenColorizationSetting;
	variables?: string | ITokenColorizationSetting;
	textMateRules?: ITextMateThemingRule[];
	semanticHighlighting?: boolean; // deprecated, use ISemanticTokenColorCustomizations.enabled instead
}

export interface IThemeScopedSemanticTokenColorCustomizations {
	[styleRule: string]: ISemanticTokenRules | boolean | undefined;
	enabled?: boolean;
	rules?: ISemanticTokenRules;
}

export interface ISemanticTokenColorCustomizations {
	[styleRuleOrThemeScope: string]: IThemeScopedSemanticTokenColorCustomizations | ISemanticTokenRules | boolean | undefined;
	enabled?: boolean;
	rules?: ISemanticTokenRules;
}

export interface IThemeScopedExperimentalSemanticTokenColorCustomizations {
	[themeScope: string]: ISemanticTokenRules | undefined;
}

export interface IExperimentalSemanticTokenColorCustomizations {
	[styleRuleOrThemeScope: string]: IThemeScopedExperimentalSemanticTokenColorCustomizations | ISemanticTokenRules | undefined;
}

export type IThemeScopedCustomizations =
	IThemeScopedColorCustomizations
	| IThemeScopedTokenColorCustomizations
	| IThemeScopedExperimentalSemanticTokenColorCustomizations
	| IThemeScopedSemanticTokenColorCustomizations;

export type IThemeScopableCustomizations =
	IColorCustomizations
	| ITokenColorCustomizations
	| IExperimentalSemanticTokenColorCustomizations
	| ISemanticTokenColorCustomizations;

export interface ISemanticTokenRules {
	[selector: string]: string | ISemanticTokenColorizationSetting | undefined;
}

export interface ITextMateThemingRule {
	name?: string;
	scope?: string | string[];
	settings: ITokenColorizationSetting;
}

export interface ITokenColorizationSetting {
	foreground?: string;
	background?: string;
	fontStyle?: string; /* [italic|bold|underline|strikethrough] */
	fontFamily?: string;
	fontSize?: number;
	lineHeight?: number;
}

export interface ISemanticTokenColorizationSetting {
	foreground?: string;
	fontStyle?: string; /* [italic|bold|underline|strikethrough] */
	bold?: boolean;
	underline?: boolean;
	strikethrough?: boolean;
	italic?: boolean;
}

export interface ExtensionData {
	extensionId: string;
	extensionPublisher: string;
	extensionName: string;
	extensionIsBuiltin: boolean;
}

export namespace ExtensionData {
	export function toJSONObject(d: ExtensionData | undefined): any {
		return d && { _extensionId: d.extensionId, _extensionIsBuiltin: d.extensionIsBuiltin, _extensionName: d.extensionName, _extensionPublisher: d.extensionPublisher };
	}
	export function fromJSONObject(o: any): ExtensionData | undefined {
		if (o && isString(o._extensionId) && isBoolean(o._extensionIsBuiltin) && isString(o._extensionName) && isString(o._extensionPublisher)) {
			return { extensionId: o._extensionId, extensionIsBuiltin: o._extensionIsBuiltin, extensionName: o._extensionName, extensionPublisher: o._extensionPublisher };
		}
		return undefined;
	}
	export function fromName(publisher: string, name: string, isBuiltin = false): ExtensionData {
		return { extensionPublisher: publisher, extensionId: `${publisher}.${name}`, extensionName: name, extensionIsBuiltin: isBuiltin };
	}
}

export interface IThemeExtensionPoint {
	id: string;
	label?: string;
	description?: string;
	path: string;
	uiTheme?: ThemeTypeSelector;
	_watch: boolean; // unsupported options to watch location
}

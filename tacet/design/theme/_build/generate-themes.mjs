// Tacet theme generator.
// Reads ../../tokens.json and ./color-keys.txt (every color id registered via registerColor()
// in src/vs at upstream 1.139.0, plus extension-contributed ids listed in EXTRA_KEYS) and writes
// ../tacet-light-color-theme.json, ../tacet-dark-color-theme.json, ../tacet-hc-light-color-theme.json.
//
// Run from anywhere:  node tacet/design/theme/_build/generate-themes.mjs
// No dependencies. Deterministic output (keys sorted). Prints a coverage report.
//
// Rule: every workbench color is assigned from a token ROLE, never a free hex. The only literals
// allowed here are alpha suffixes and the terminal ANSI palette (which is its own named scale).

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const tokens = JSON.parse(readFileSync(join(here, '../../tokens.json'), 'utf8'));
const registered = readFileSync(join(here, 'color-keys.txt'), 'utf8').split(/\r?\n/).filter(Boolean);

// Colors contributed by built-in extensions (package.json "colors") and the terminal ANSI loop.
const EXTRA_KEYS = [
	'terminal.ansiBlack', 'terminal.ansiRed', 'terminal.ansiGreen', 'terminal.ansiYellow', 'terminal.ansiBlue', 'terminal.ansiMagenta', 'terminal.ansiCyan', 'terminal.ansiWhite',
	'terminal.ansiBrightBlack', 'terminal.ansiBrightRed', 'terminal.ansiBrightGreen', 'terminal.ansiBrightYellow', 'terminal.ansiBrightBlue', 'terminal.ansiBrightMagenta', 'terminal.ansiBrightCyan', 'terminal.ansiBrightWhite',
	'gitDecoration.addedResourceForeground', 'gitDecoration.modifiedResourceForeground', 'gitDecoration.deletedResourceForeground', 'gitDecoration.renamedResourceForeground',
	'gitDecoration.stageModifiedResourceForeground', 'gitDecoration.stageDeletedResourceForeground', 'gitDecoration.untrackedResourceForeground', 'gitDecoration.ignoredResourceForeground',
	'gitDecoration.conflictingResourceForeground', 'gitDecoration.submoduleResourceForeground',
	'markdown.extension.editor.codeSpan.background'
];

// AI surfaces are removed from the product (docs/06-NO-AI.md). Their colors are deliberately NOT themed,
// so any surviving AI UI renders with upstream defaults and is easy to spot in review.
const EXCLUDED = [/^inlineEdit\./, /^editorGroup\.dropIntoPrompt/, /^editorLightBulbAi\./, /^chat/i, /^inlineChat/i, /^terminalSymbolIcon\.inlineSuggestionForeground$/];

const allKeys = [...new Set([...registered, ...EXTRA_KEYS])].filter(k => !EXCLUDED.some(r => r.test(k))).sort();

function flatten(obj, prefix = '', out = {}) {
	for (const [k, v] of Object.entries(obj)) {
		if (k.startsWith('$')) { continue; }
		if (v && typeof v === 'object' && '$value' in v) { out[prefix + k] = v.$value; }
		else if (v && typeof v === 'object') { flatten(v, prefix + k + '.', out); }
	}
	return out;
}

const alpha = (hex, a) => hex.slice(0, 7) + a; // a = 2 hex digits
const NONE = '#00000000';

// ANSI palettes: tuned so every color clears 4.5:1 on its terminal background.
const ANSI = {
	light: { Black: '#22252B', Red: '#B42A33', Green: '#1E7A4C', Yellow: '#8A6A1F', Blue: '#1A58BA', Magenta: '#8B3FB0', Cyan: '#0F7B83', White: '#596272',
		BrightBlack: '#676F7C', BrightRed: '#C23B44', BrightGreen: '#23875A', BrightYellow: '#936F12', BrightBlue: '#2167D5', BrightMagenta: '#9A4CBF', BrightCyan: '#117F88', BrightWhite: '#22252B' },
	dark: { Black: '#3A3D43', Red: '#FF8A80', Green: '#8FD19E', Yellow: '#E3B866', Blue: '#7FB0FF', Magenta: '#C792EA', Cyan: '#5FC4CC', White: '#C9CDD3',
		BrightBlack: '#8B929D', BrightRed: '#FFA39B', BrightGreen: '#A6DDB2', BrightYellow: '#EDC985', BrightBlue: '#9CC2FF', BrightMagenta: '#D6ABF0', BrightCyan: '#7FD3DA', BrightWhite: '#F2F3F5' },
	hc: { Black: '#000000', Red: '#9E0A12', Green: '#0B5E36', Yellow: '#6B4200', Blue: '#1447A6', Magenta: '#6B1F91', Cyan: '#005A61', White: '#3A3D43',
		BrightBlack: '#3A3D43', BrightRed: '#9E0A12', BrightGreen: '#0B5E36', BrightYellow: '#6B4200', BrightBlue: '#1447A6', BrightMagenta: '#6B1F91', BrightCyan: '#005A61', BrightWhite: '#000000' }
};

/** Resolve a palette for one variant into semantic roles used by the rules below. */
function roles(variant) {
	if (variant === 'hc') {
		const h = flatten(tokens.color.highContrast.light);
		return {
			canvas: h.canvas, shell: h.canvas, sunken: h.canvas, raised: h.canvas, hoverCanvas: h.canvas, hoverShell: h.canvas, pressed: h.canvas, scrim: '#00000033',
			hairline: h.border, subtle: h.border, overlayEdge: h.border, control: h.border, controlQuiet: h.border,
			ink: h.ink, ink2: h.ink, ink3: h.ink, quiet: h.ink, disabled: '#5E646E', onAccent: '#FFFFFF',
			accent: h.accent, accentFill: h.accent, accentHover: h.accent, accentPressed: h.accent, accentText: h.accent,
			tint: '#FFFFFF', tintSubtle: '#FFFFFF', selection: '#C5D6F5', selectionInactive: '#E0E6EF', rule: h.ink,
			warnSurface: '#FFFFFF', warnEdge: h.warning, warnInk: h.warning, danger: h.danger, dangerSurface: '#FFFFFF', success: '#0B5E36',
			find: '#FFD66B', findOther: '#FFF0C2', insLine: '#E9F6EE', insText: '#9AD5B0', remLine: '#FCEDEE', remText: '#F0A8AE',
			syn: { keyword: '#6B1F91', string: '#0B5E36', number: '#6B4200', type: '#005A61', function: h.accent, comment: '#3A3D43', punctuation: '#000000', variable: '#000000', raw: '#6B4200', invalid: h.danger },
			contrastBorder: h.border, contrastActiveBorder: h.activeBorder, ansi: ANSI.hc, type: 'hc'
		};
	}
	const c = flatten(tokens.color[variant]);
	const r = {
		canvas: c['surface.canvas'], shell: c['surface.shell'], sunken: c['surface.sunken'], raised: c['surface.raised'],
		hoverCanvas: c['surface.hoverOnCanvas'], hoverShell: c['surface.hoverOnShell'], pressed: c['surface.pressed'], scrim: c['surface.scrim'],
		hairline: c['line.hairline'], subtle: c['line.subtle'], overlayEdge: c['line.overlayEdge'], control: c['line.control'], controlQuiet: c['line.controlQuiet'],
		ink: c['ink.primary'], ink2: c['ink.secondary'], ink3: c['ink.tertiary'], quiet: c['ink.quiet'], disabled: c['ink.disabled'], onAccent: c['ink.onAccent'],
		accent: c['accent.base'], accentFill: c['accent.fill'] ?? c['accent.base'], accentHover: c['accent.hover'], accentPressed: c['accent.pressed'],
		accentText: c['accent.textOnTint'] ?? c['accent.hover'],
		tint: c['accent.tint'], tintSubtle: c['accent.tintSubtle'], selection: c['accent.selection'], selectionInactive: c['accent.selectionInactive'], rule: c['accent.rule'],
		warnSurface: c['status.warningSurface'], warnEdge: c['status.warningEdge'], warnInk: c['status.warningInk'], danger: c['status.dangerInk'], dangerSurface: c['status.dangerSurface'],
		success: c['status.successInk'], find: c['status.findMatch'], findOther: c['status.findMatchOther'],
		insLine: c['status.diffInsertedLine'], insText: c['status.diffInsertedText'], remLine: c['status.diffRemovedLine'], remText: c['status.diffRemovedText'],
		syn: Object.fromEntries(Object.entries(c).filter(([k]) => k.startsWith('syntax.')).map(([k, v]) => [k.slice(7), v])),
		contrastBorder: null, contrastActiveBorder: null, ansi: ANSI[variant], type: variant
	};
	return r;
}

/** Explicit assignments. Order does not matter; family rules only fill what is not listed here. */
function explicit(r) {
	const hc = r.type === 'hc';
	const dark = r.type === 'dark';
	return {
		// ── Base ─────────────────────────────────────────────
		'foreground': r.ink, 'strongForeground': r.ink, 'descriptionForeground': r.ink2, 'disabledForeground': r.disabled,
		'errorForeground': r.danger, 'icon.foreground': r.ink2, 'focusBorder': r.accent,
		'contrastBorder': r.contrastBorder ?? NONE, 'contrastActiveBorder': r.contrastActiveBorder ?? NONE,
		'selection.background': r.selection, 'widget.border': r.overlayEdge,
		'widget.shadow': dark ? '#00000080' : '#1D2A3D1F', 'scrollbar.shadow': NONE, 'sash.hoverBorder': r.accent,
		'window.activeBorder': dark ? '#3A3D43' : '#D5DAE1', 'window.inactiveBorder': dark ? '#2E3136' : '#E1E5EA',
		'textLink.foreground': r.accent, 'textLink.activeForeground': r.accentHover ?? r.accent,
		'textBlockQuote.background': NONE, 'textBlockQuote.border': r.rule,
		'textCodeBlock.background': r.sunken, 'textPreformat.foreground': r.ink, 'textPreformat.background': r.sunken, 'textPreformat.border': NONE,
		'textSeparator.foreground': r.hairline,
		'surface.background': r.canvas, 'surface.foreground': r.ink, 'surface.border': r.hairline,
		'modernUI.shellBackground': r.shell, 'modernUI.inactiveShellBackground': r.shell,
		'modernPanel.border': r.hairline, 'modernSash.gripForeground': alpha(r.ink2, '66'),
		'modernTab.activeBackground': r.canvas, 'modernTab.activeForeground': r.ink, 'modernTab.hoverBackground': r.hoverShell, 'modernTab.hoverForeground': r.ink,

		// ── Title bar & command center ──────────────────────
		'titleBar.activeBackground': r.canvas, 'titleBar.activeForeground': r.ink,
		'titleBar.inactiveBackground': r.canvas, 'titleBar.inactiveForeground': r.ink2, 'titleBar.border': hc ? r.contrastBorder : NONE,
		'commandCenter.background': NONE, 'commandCenter.foreground': r.ink, 'commandCenter.activeBackground': r.hoverCanvas,
		'commandCenter.activeForeground': r.ink, 'commandCenter.border': NONE, 'commandCenter.activeBorder': NONE,
		'commandCenter.inactiveForeground': r.ink2, 'commandCenter.inactiveBorder': NONE, 'commandCenter.debuggingBackground': alpha(r.warnEdge, '66'),
		'menubar.selectionBackground': r.hoverCanvas, 'menubar.selectionForeground': r.ink, 'menubar.selectionBorder': hc ? r.contrastActiveBorder : NONE,

		// ── Activity bar (hidden in writing layout; top-position icons in Coding Tools) ──
		'activityBar.background': r.shell, 'activityBar.foreground': r.ink, 'activityBar.inactiveForeground': r.ink2,
		'activityBar.activeBorder': r.accent, 'activityBar.activeBackground': NONE, 'activityBar.activeFocusBorder': r.accent,
		'activityBar.border': r.hairline, 'activityBar.dropBorder': r.accent,
		'activityBarTop.foreground': r.ink, 'activityBarTop.inactiveForeground': r.ink2, 'activityBarTop.activeBorder': r.accent,
		'activityBarTop.activeBackground': NONE, 'activityBarTop.background': NONE, 'activityBarTop.dropBorder': r.accent,
		'activityBarBadge.background': r.accentFill, 'activityBarBadge.foreground': r.onAccent,
		'activityErrorBadge.background': r.danger, 'activityErrorBadge.foreground': r.onAccent,
		'activityWarningBadge.background': r.warnInk, 'activityWarningBadge.foreground': r.onAccent,
		'modernActivityBar.background': r.shell, 'modernActivityBar.inactiveBackground': r.shell, 'modernActivityBar.border': r.hairline,
		'modernActivityBar.activeBackground': r.tint, 'modernActivityBar.activeForeground': r.accentText, 'modernActivityBar.hoverBackground': r.hoverShell, 'modernActivityBar.hoverForeground': r.ink,
		'modernActivityBarItem.activeBackground': r.tint, 'modernActivityBarItem.activeForeground': r.accentText, 'modernActivityBarItem.hoverBackground': r.hoverShell, 'modernActivityBarItem.hoverForeground': r.ink,
		'sideBarActivityBarTop.border': NONE,

		// ── Shelf (side bar) ────────────────────────────────
		'sideBar.background': r.shell, 'sideBar.foreground': r.ink, 'sideBar.border': r.hairline, 'sideBar.dropBackground': alpha(r.accent, '14'),
		'sideBarTitle.background': r.shell, 'sideBarTitle.foreground': r.ink2, 'sideBarTitle.border': NONE,
		'sideBarSectionHeader.background': NONE, 'sideBarSectionHeader.foreground': r.ink2, 'sideBarSectionHeader.border': NONE,
		'sideBarStickyScroll.background': r.shell, 'sideBarStickyScroll.border': r.hairline, 'sideBarStickyScroll.shadow': NONE,

		// ── Lists & trees ───────────────────────────────────
		'list.activeSelectionBackground': r.tint, 'list.activeSelectionForeground': r.accentText, 'list.activeSelectionIconForeground': r.accentText,
		'list.inactiveSelectionBackground': dark ? '#2A2D33' : '#E9ECF1', 'list.inactiveSelectionForeground': r.ink, 'list.inactiveSelectionIconForeground': r.ink2,
		'list.focusBackground': r.tint, 'list.focusForeground': r.accentText, 'list.focusOutline': hc ? r.contrastActiveBorder : NONE,
		'list.focusAndSelectionOutline': hc ? r.contrastActiveBorder : NONE,
		'list.inactiveFocusBackground': NONE, 'list.inactiveFocusOutline': NONE,
		'list.hoverBackground': r.hoverShell, 'list.hoverForeground': r.ink,
		'list.highlightForeground': r.accentText, 'list.focusHighlightForeground': r.accentText,
		'list.dropBackground': alpha(r.accent, '1A'), 'list.dropBetweenBackground': r.accent,
		'list.errorForeground': r.danger, 'list.warningForeground': r.warnInk, 'list.invalidItemForeground': r.danger, 'list.deemphasizedForeground': r.ink3,
		'list.filterMatchBackground': r.findOther, 'list.filterMatchBorder': NONE,
		'listFilterWidget.background': r.raised, 'listFilterWidget.outline': r.accent, 'listFilterWidget.noMatchesOutline': r.danger, 'listFilterWidget.shadow': dark ? '#00000080' : '#1D2A3D1F',
		'tree.indentGuidesStroke': r.hairline, 'tree.inactiveIndentGuidesStroke': NONE, 'tree.tableColumnsBorder': r.hairline, 'tree.tableOddRowsBackground': alpha(r.sunken, '80'),

		// ── Editor group, tabs, breadcrumbs ─────────────────
		'editorGroup.border': r.hairline, 'editorGroup.dropBackground': alpha(r.accent, '14'), 'editorGroup.emptyBackground': r.canvas, 'editorGroup.focusedEmptyBorder': NONE,
		'editorGroupHeader.tabsBackground': r.canvas, 'editorGroupHeader.tabsBorder': NONE, 'editorGroupHeader.noTabsBackground': r.canvas, 'editorGroupHeader.border': NONE,
		'editorPane.background': r.canvas,
		'tab.activeBackground': r.canvas, 'tab.activeForeground': r.ink, 'tab.activeBorder': NONE, 'tab.activeBorderTop': NONE,
		'tab.inactiveBackground': r.canvas, 'tab.inactiveForeground': r.ink2, 'tab.border': NONE,
		'tab.hoverBackground': r.hoverCanvas, 'tab.hoverForeground': r.ink, 'tab.hoverBorder': NONE,
		'tab.selectedBackground': r.canvas, 'tab.selectedForeground': r.ink, 'tab.selectedBorderTop': NONE,
		'tab.unfocusedActiveBackground': r.canvas, 'tab.unfocusedActiveForeground': r.ink, 'tab.unfocusedActiveBorder': NONE, 'tab.unfocusedActiveBorderTop': NONE,
		'tab.unfocusedInactiveBackground': r.canvas, 'tab.unfocusedInactiveForeground': r.ink3, 'tab.unfocusedHoverBackground': r.hoverCanvas, 'tab.unfocusedHoverForeground': r.ink, 'tab.unfocusedHoverBorder': NONE,
		'tab.activeModifiedBorder': r.accent, 'tab.inactiveModifiedBorder': alpha(r.accent, '80'), 'tab.unfocusedActiveModifiedBorder': alpha(r.accent, '80'), 'tab.unfocusedInactiveModifiedBorder': alpha(r.accent, '4D'),
		'tab.lastPinnedBorder': r.hairline, 'tab.dragAndDropBorder': r.accent,
		'modernEditorTab.activeBackground': r.sunken, 'modernEditorTab.activeForeground': r.ink, 'modernEditorTab.inactiveBackground': NONE,
		'modernEditorTab.hoverBackground': r.hoverCanvas, 'modernEditorTab.hoverForeground': r.ink, 'modernEditorTab.activeHoverBackground': r.pressed,
		'modernEditorTab.activeActionBackground': r.sunken, 'modernEditorTab.activeHoverActionBackground': r.pressed, 'modernEditorTab.hoverActionBackground': r.hoverCanvas, 'modernEditorTab.selectedActionBackground': r.sunken,
		'breadcrumb.background': r.canvas, 'breadcrumb.foreground': r.ink2, 'breadcrumb.focusForeground': r.ink, 'breadcrumb.activeSelectionForeground': r.ink, 'breadcrumbPicker.background': r.raised,
		'sideBySideEditor.horizontalBorder': r.hairline, 'sideBySideEditor.verticalBorder': r.hairline,

		// ── Editor ──────────────────────────────────────────
		'editor.background': r.canvas, 'editor.foreground': r.ink, 'editor.border': NONE,
		'editorCursor.foreground': r.accent, 'editorCursor.background': r.canvas,
		'editorMultiCursor.primary.foreground': r.accent, 'editorMultiCursor.primary.background': r.canvas,
		'editorMultiCursor.secondary.foreground': alpha(r.accent, 'B3'), 'editorMultiCursor.secondary.background': r.canvas,
		'editor.selectionBackground': r.selection, 'editor.selectionForeground': hc ? '#000000' : r.ink, 'editor.inactiveSelectionBackground': r.selectionInactive,
		'editor.selectionHighlightBackground': alpha(r.selection, '80'), 'editor.selectionHighlightBorder': NONE,
		'editor.wordHighlightBackground': alpha(r.selectionInactive, 'CC'), 'editor.wordHighlightBorder': NONE,
		'editor.wordHighlightStrongBackground': alpha(r.selection, '99'), 'editor.wordHighlightStrongBorder': NONE,
		'editor.wordHighlightTextBackground': alpha(r.selectionInactive, 'CC'), 'editor.wordHighlightTextBorder': NONE,
		'editor.findMatchBackground': r.find, 'editor.findMatchForeground': hc ? '#000000' : (dark ? r.ink : '#22252B'), 'editor.findMatchBorder': hc ? r.contrastActiveBorder : NONE,
		'editor.findMatchHighlightBackground': r.findOther, 'editor.findMatchHighlightForeground': hc ? '#000000' : r.ink, 'editor.findMatchHighlightBorder': NONE,
		'editor.findRangeHighlightBackground': alpha(r.sunken, 'B3'), 'editor.findRangeHighlightBorder': NONE,
		'editor.lineHighlightBackground': NONE, 'editor.lineHighlightBorder': NONE, 'editor.inactiveLineHighlightBackground': NONE,
		'editor.rangeHighlightBackground': alpha(r.tint, '99'), 'editor.rangeHighlightBorder': NONE,
		'editor.symbolHighlightBackground': alpha(r.find, '80'), 'editor.symbolHighlightBorder': NONE,
		'editor.hoverHighlightBackground': alpha(r.tint, '99'), 'editor.linkedEditingBackground': alpha(r.tint, '99'),
		'editor.foldBackground': alpha(r.sunken, '99'), 'editor.foldPlaceholderForeground': r.ink3,
		'editor.placeholder.foreground': r.ink3, 'editor.compositionBorder': r.ink,
		'editor.snippetTabstopHighlightBackground': alpha(r.tint, 'B3'), 'editor.snippetTabstopHighlightBorder': NONE,
		'editor.snippetFinalTabstopHighlightBackground': NONE, 'editor.snippetFinalTabstopHighlightBorder': r.accent,
		'editor.stackFrameHighlightBackground': alpha(r.find, '4D'), 'editor.focusedStackFrameHighlightBackground': alpha(r.success, '26'),
		'editor.inlineValuesBackground': alpha(r.find, '33'), 'editor.inlineValuesForeground': r.ink2,
		'editorLineNumber.foreground': r.quiet, 'editorLineNumber.activeForeground': r.ink2, 'editorLineNumber.dimmedForeground': alpha(r.quiet, '99'), 'editorActiveLineNumber.foreground': r.ink2,
		'editorWhitespace.foreground': alpha(r.quiet, '99'), 'editorRuler.foreground': r.hairline, 'editorCodeLens.foreground': r.ink3,
		'editorIndentGuide.background': r.hairline, 'editorIndentGuide.activeBackground': r.controlQuiet,
		'editorLink.activeForeground': r.accent, 'editorWordWrapIndicator.foreground': r.quiet,
		'editorBracketMatch.background': alpha(r.selectionInactive, 'CC'), 'editorBracketMatch.border': r.controlQuiet, 'editorBracketMatch.foreground': r.ink,
		'editorBracketHighlight.foreground1': r.ink2, 'editorBracketHighlight.foreground2': r.syn.keyword, 'editorBracketHighlight.foreground3': r.syn.type,
		'editorBracketHighlight.foreground4': r.ink2, 'editorBracketHighlight.foreground5': r.syn.keyword, 'editorBracketHighlight.foreground6': r.syn.type,
		'editorBracketHighlight.unexpectedBracket.foreground': r.danger,
		'editorUnnecessaryCode.border': NONE, 'editorUnnecessaryCode.opacity': '#000000A0',
		'editorUnicodeHighlight.border': r.warnInk, 'editorUnicodeHighlight.background': NONE,
		'editorGhostText.foreground': r.ink3, 'editorGhostText.background': NONE, 'editorGhostText.border': NONE,
		'editorError.foreground': r.danger, 'editorError.background': NONE, 'editorError.border': NONE,
		'editorWarning.foreground': r.warnInk, 'editorWarning.background': NONE, 'editorWarning.border': NONE,
		'editorInfo.foreground': r.accent, 'editorInfo.background': NONE, 'editorInfo.border': NONE,
		'editorHint.foreground': r.ink3, 'editorHint.border': NONE,
		'editorLightBulb.foreground': r.warnInk, 'editorLightBulbAutoFix.foreground': r.accent,
		'editorInlayHint.background': r.sunken, 'editorInlayHint.foreground': r.ink3, 'editorInlayHint.typeBackground': r.sunken, 'editorInlayHint.typeForeground': r.ink3,
		'editorInlayHint.parameterBackground': r.sunken, 'editorInlayHint.parameterForeground': r.ink3,
		'editorStickyScroll.background': r.canvas, 'editorStickyScroll.border': r.hairline, 'editorStickyScroll.shadow': NONE, 'editorStickyScrollHover.background': r.hoverCanvas, 'editorStickyScrollGutter.background': r.canvas,
		'editorOverviewRuler.border': NONE, 'editorOverviewRuler.background': r.canvas,
		'editorGutter.background': r.canvas, 'editorGutter.modifiedBackground': r.accent, 'editorGutter.addedBackground': r.success, 'editorGutter.deletedBackground': r.danger,
		'editorGutter.modifiedSecondaryBackground': alpha(r.accent, '80'), 'editorGutter.addedSecondaryBackground': alpha(r.success, '80'), 'editorGutter.deletedSecondaryBackground': alpha(r.danger, '80'),
		'editorGutter.foldingControlForeground': r.ink3, 'editorGutter.itemBackground': r.sunken, 'editorGutter.itemGlyphForeground': r.ink2,
		'editorGutter.commentRangeForeground': r.controlQuiet, 'editorGutter.commentGlyphForeground': r.ink2, 'editorGutter.commentUnresolvedGlyphForeground': r.ink2, 'editorGutter.commentDraftGlyphForeground': r.ink3,

		// ── Editor widgets (find, hover, suggest, peek) ────
		'editorWidget.background': r.raised, 'editorWidget.foreground': r.ink, 'editorWidget.border': r.overlayEdge, 'editorWidget.resizeBorder': r.accent,
		'editorHoverWidget.background': r.raised, 'editorHoverWidget.foreground': r.ink, 'editorHoverWidget.border': r.overlayEdge,
		'editorHoverWidget.highlightForeground': r.accentText, 'editorHoverWidget.statusBarBackground': r.shell,
		'editorSuggestWidget.background': r.raised, 'editorSuggestWidget.border': r.overlayEdge, 'editorSuggestWidget.foreground': r.ink,
		'editorSuggestWidget.selectedBackground': r.tint, 'editorSuggestWidget.selectedForeground': r.accentText, 'editorSuggestWidget.selectedIconForeground': r.accentText,
		'editorSuggestWidget.highlightForeground': r.accentText, 'editorSuggestWidget.focusHighlightForeground': r.accentText, 'editorSuggestWidget.focusOutline': NONE,
		'editorSuggestWidgetStatus.foreground': r.ink3,
		'editorActionList.background': r.raised, 'editorActionList.foreground': r.ink, 'editorActionList.focusBackground': r.tint, 'editorActionList.focusForeground': r.accentText,
		'editorMarkerNavigation.background': r.raised, 'editorMarkerNavigationError.background': r.danger, 'editorMarkerNavigationError.headerBackground': alpha(r.danger, '14'),
		'editorMarkerNavigationWarning.background': r.warnInk, 'editorMarkerNavigationWarning.headerBackground': alpha(r.warnInk, '14'),
		'editorMarkerNavigationInfo.background': r.accent, 'editorMarkerNavigationInfo.headerBackground': alpha(r.accent, '14'),
		'peekView.border': r.overlayEdge, 'peekViewTitle.background': r.shell, 'peekViewTitleLabel.foreground': r.ink, 'peekViewTitleDescription.foreground': r.ink2,
		'peekViewEditor.background': r.canvas, 'peekViewEditorGutter.background': r.canvas, 'peekViewEditor.matchHighlightBackground': r.findOther, 'peekViewEditor.matchHighlightBorder': NONE,
		'peekViewEditorStickyScroll.background': r.canvas, 'peekViewEditorStickyScrollGutter.background': r.canvas,
		'peekViewResult.background': r.shell, 'peekViewResult.fileForeground': r.ink, 'peekViewResult.lineForeground': r.ink2,
		'peekViewResult.matchHighlightBackground': r.findOther, 'peekViewResult.selectionBackground': r.tint, 'peekViewResult.selectionForeground': r.accentText,
		'simpleFindWidget.sashBorder': r.hairline,

		// ── Diff & merge ────────────────────────────────────
		'diffEditor.insertedTextBackground': r.insText, 'diffEditor.removedTextBackground': r.remText,
		'diffEditor.insertedLineBackground': r.insLine, 'diffEditor.removedLineBackground': r.remLine,
		'diffEditor.insertedTextBorder': NONE, 'diffEditor.removedTextBorder': NONE, 'diffEditor.border': r.hairline, 'diffEditor.diagonalFill': alpha(r.hairline, 'CC'),
		'diffEditor.unchangedRegionBackground': r.shell, 'diffEditor.unchangedRegionForeground': r.ink2, 'diffEditor.unchangedRegionShadow': NONE, 'diffEditor.unchangedCodeBackground': alpha(r.sunken, '80'),
		'diffEditor.move.border': r.quiet, 'diffEditor.moveActive.border': r.warnInk,
		'diffEditorGutter.insertedLineBackground': r.insText, 'diffEditorGutter.removedLineBackground': r.remText,
		'diffEditorOverview.insertedForeground': r.success, 'diffEditorOverview.removedForeground': r.danger,
		'multiDiffEditor.background': r.canvas, 'multiDiffEditor.headerBackground': r.shell, 'multiDiffEditor.border': r.hairline,
		'merge.currentHeaderBackground': alpha(r.success, '33'), 'merge.currentContentBackground': alpha(r.success, '14'),
		'merge.incomingHeaderBackground': alpha(r.accent, '33'), 'merge.incomingContentBackground': alpha(r.accent, '14'),
		'merge.commonHeaderBackground': alpha(r.quiet, '33'), 'merge.commonContentBackground': alpha(r.quiet, '14'), 'merge.border': r.hairline,

		// ── Inputs & controls ───────────────────────────────
		'input.background': r.canvas, 'input.foreground': r.ink, 'input.border': r.controlQuiet, 'input.placeholderForeground': r.ink3,
		'inputOption.activeBackground': r.tint, 'inputOption.activeForeground': r.accentText, 'inputOption.activeBorder': NONE, 'inputOption.hoverBackground': r.hoverCanvas,
		'inputValidation.errorBackground': r.dangerSurface, 'inputValidation.errorForeground': r.ink, 'inputValidation.errorBorder': r.danger,
		'inputValidation.warningBackground': r.warnSurface, 'inputValidation.warningForeground': r.ink, 'inputValidation.warningBorder': r.warnInk,
		'inputValidation.infoBackground': r.tintSubtle, 'inputValidation.infoForeground': r.ink, 'inputValidation.infoBorder': r.accent,
		'dropdown.background': r.canvas, 'dropdown.listBackground': r.raised, 'dropdown.foreground': r.ink, 'dropdown.border': r.controlQuiet,
		'checkbox.background': r.canvas, 'checkbox.foreground': r.onAccent, 'checkbox.border': r.control,
		'checkbox.selectBackground': r.accentFill, 'checkbox.selectBorder': r.accentFill,
		'checkbox.disabled.background': r.sunken, 'checkbox.disabled.foreground': r.disabled,
		'radio.activeBackground': r.canvas, 'radio.activeForeground': r.ink, 'radio.activeBorder': r.controlQuiet,
		'radio.inactiveBackground': NONE, 'radio.inactiveForeground': r.ink2, 'radio.inactiveBorder': NONE, 'radio.inactiveHoverBackground': r.hoverCanvas,
		'button.background': r.accentFill, 'button.foreground': r.onAccent, 'button.hoverBackground': r.accentHover, 'button.border': NONE, 'button.separator': alpha(r.onAccent, '66'),
		'button.secondaryBackground': r.sunken, 'button.secondaryForeground': r.ink, 'button.secondaryHoverBackground': r.pressed, 'button.secondaryBorder': NONE,
		'extensionButton.background': r.accentFill, 'extensionButton.foreground': r.onAccent, 'extensionButton.hoverBackground': r.accentHover, 'extensionButton.border': NONE, 'extensionButton.separator': alpha(r.onAccent, '66'),
		'extensionButton.prominentBackground': r.accentFill, 'extensionButton.prominentForeground': r.onAccent, 'extensionButton.prominentHoverBackground': r.accentHover,
		'actionBar.toggledBackground': r.tint, 'toolbar.hoverBackground': r.hoverCanvas, 'toolbar.activeBackground': r.pressed, 'toolbar.hoverOutline': hc ? r.contrastActiveBorder : NONE,
		'keybindingLabel.background': r.sunken, 'keybindingLabel.foreground': r.ink2, 'keybindingLabel.border': r.controlQuiet, 'keybindingLabel.bottomBorder': r.controlQuiet,
		'keybindingTable.headerBackground': r.shell, 'keybindingTable.rowsBackground': alpha(r.sunken, '80'),
		'badge.background': r.sunken, 'badge.foreground': r.ink2, 'progressBar.background': r.accent,
		'scrollbar.background': NONE, 'scrollbarSlider.background': alpha(r.ink2, '40'), 'scrollbarSlider.hoverBackground': alpha(r.ink2, '66'), 'scrollbarSlider.activeBackground': alpha(r.ink2, '80'),
		'minimap.background': r.canvas, 'minimapSlider.background': alpha(r.ink2, '1A'), 'minimapSlider.hoverBackground': alpha(r.ink2, '26'), 'minimapSlider.activeBackground': alpha(r.ink2, '33'),
		'minimap.foregroundOpacity': '#000000C0', 'minimap.findMatchHighlight': r.find, 'minimap.selectionHighlight': r.selection, 'minimap.selectionOccurrenceHighlight': r.selectionInactive,
		'minimap.errorHighlight': r.danger, 'minimap.warningHighlight': r.warnInk, 'minimap.infoHighlight': r.accent,
		'minimapGutter.addedBackground': r.success, 'minimapGutter.modifiedBackground': r.accent, 'minimapGutter.deletedBackground': r.danger,

		// ── Menus, quick input, hovers, notifications ───────
		'menu.background': r.raised, 'menu.foreground': r.ink, 'menu.border': r.overlayEdge, 'menu.selectionBackground': r.tint, 'menu.selectionForeground': r.accentText,
		'menu.selectionBorder': hc ? r.contrastActiveBorder : NONE, 'menu.separatorBackground': r.subtle,
		'quickInput.background': r.raised, 'quickInput.foreground': r.ink, 'quickInputTitle.background': r.raised,
		'quickInputList.focusBackground': r.tint, 'quickInputList.focusForeground': r.ink, 'quickInputList.focusIconForeground': r.accentText, 'quickInputList.focusHighlightForeground': r.accentText,
		'quickInput.list.focusBackground': r.tint,
		'pickerGroup.border': r.subtle, 'pickerGroup.foreground': r.ink2,
		'notifications.background': r.raised, 'notifications.foreground': r.ink, 'notifications.border': r.subtle,
		'notificationCenter.border': r.overlayEdge, 'notificationCenterHeader.background': r.raised, 'notificationCenterHeader.foreground': r.ink2,
		'notificationToast.border': r.overlayEdge, 'notificationLink.foreground': r.accent,
		'notificationsErrorIcon.foreground': r.danger, 'notificationsWarningIcon.foreground': r.warnInk, 'notificationsInfoIcon.foreground': r.accent,
		'banner.background': r.warnSurface, 'banner.foreground': r.ink, 'banner.iconForeground': r.warnInk,

		// ── Panel & terminal ────────────────────────────────
		'panel.background': r.canvas, 'panel.border': r.hairline, 'panel.dropBorder': r.accent, 'panelInput.border': r.controlQuiet,
		'panelTitle.activeForeground': r.ink, 'panelTitle.inactiveForeground': r.ink2, 'panelTitle.activeBorder': r.accent, 'panelTitle.border': NONE,
		'panelTitleBadge.background': r.sunken, 'panelTitleBadge.foreground': r.ink2,
		'panelSection.border': r.hairline, 'panelSection.dropBackground': alpha(r.accent, '14'),
		'panelSectionHeader.background': NONE, 'panelSectionHeader.foreground': r.ink2, 'panelSectionHeader.border': NONE,
		'panelStickyScroll.background': r.canvas, 'panelStickyScroll.border': r.hairline, 'panelStickyScroll.shadow': NONE,
		'outputView.background': r.canvas, 'outputViewStickyScroll.background': r.canvas,
		'terminal.background': r.canvas, 'terminal.foreground': r.ink, 'terminal.border': r.hairline,
		'terminal.selectionBackground': r.selection, 'terminal.selectionForeground': hc ? '#000000' : r.ink, 'terminal.inactiveSelectionBackground': r.selectionInactive,
		'terminal.findMatchBackground': r.find, 'terminal.findMatchBorder': NONE, 'terminal.findMatchHighlightBackground': r.findOther, 'terminal.findMatchHighlightBorder': NONE,
		'terminal.hoverHighlightBackground': alpha(r.tint, '99'), 'terminal.dropBackground': alpha(r.accent, '14'), 'terminal.initialHintForeground': r.ink3, 'terminal.tab.activeBorder': r.accent,
		'terminalCursor.foreground': r.accent, 'terminalCursor.background': r.canvas,
		'terminalCommandDecoration.defaultBackground': r.quiet, 'terminalCommandDecoration.successBackground': r.success, 'terminalCommandDecoration.errorBackground': r.danger,
		'terminalCommandGuide.foreground': r.hairline,
		'terminalOverviewRuler.border': NONE, 'terminalOverviewRuler.cursorForeground': r.accent, 'terminalOverviewRuler.findMatchForeground': r.find,
		'terminalStickyScroll.background': r.canvas, 'terminalStickyScroll.border': r.hairline, 'terminalStickyScrollHover.background': r.hoverCanvas,

		// ── Status bar (document footer) ────────────────────
		'statusBar.background': r.canvas, 'statusBar.foreground': r.ink2, 'statusBar.border': NONE, 'statusBar.focusBorder': r.accent,
		'statusBar.noFolderBackground': r.canvas, 'statusBar.noFolderForeground': r.ink2, 'statusBar.noFolderBorder': NONE,
		'statusBar.debuggingBackground': r.canvas, 'statusBar.debuggingForeground': r.warnInk, 'statusBar.debuggingBorder': r.warnEdge,
		'statusBar.inactiveBackground': r.canvas,
		'statusBarItem.hoverBackground': r.hoverCanvas, 'statusBarItem.hoverForeground': r.ink2, 'statusBarItem.activeBackground': r.pressed, 'statusBarItem.focusBorder': r.accent,
		'statusBarItem.compactHoverBackground': r.hoverCanvas,
		'statusBarItem.prominentBackground': NONE, 'statusBarItem.prominentForeground': r.ink, 'statusBarItem.prominentHoverBackground': r.hoverCanvas, 'statusBarItem.prominentHoverForeground': r.ink,
		'statusBarItem.errorBackground': NONE, 'statusBarItem.errorForeground': r.danger, 'statusBarItem.errorHoverBackground': r.hoverCanvas, 'statusBarItem.errorHoverForeground': r.danger,
		'statusBarItem.warningBackground': NONE, 'statusBarItem.warningForeground': r.warnInk, 'statusBarItem.warningHoverBackground': r.hoverCanvas, 'statusBarItem.warningHoverForeground': r.warnInk,
		'statusBarItem.remoteBackground': NONE, 'statusBarItem.remoteForeground': r.ink2, 'statusBarItem.remoteHoverBackground': r.hoverCanvas, 'statusBarItem.remoteHoverForeground': r.ink,
		'statusBarItem.offlineBackground': NONE, 'statusBarItem.offlineForeground': r.warnInk, 'statusBarItem.offlineHoverBackground': r.hoverCanvas, 'statusBarItem.offlineHoverForeground': r.warnInk,

		// ── Settings editor ─────────────────────────────────
		'settings.headerForeground': r.ink, 'settings.settingsHeaderHoverForeground': r.ink, 'settings.modifiedItemIndicator': r.accent,
		'settings.headerBorder': r.subtle, 'settings.sashBorder': r.hairline,
		'settings.dropdownBackground': r.canvas, 'settings.dropdownForeground': r.ink, 'settings.dropdownBorder': r.controlQuiet, 'settings.dropdownListBorder': r.overlayEdge,
		'settings.checkboxBackground': r.canvas, 'settings.checkboxForeground': r.onAccent, 'settings.checkboxBorder': r.control,
		'settings.textInputBackground': r.canvas, 'settings.textInputForeground': r.ink, 'settings.textInputBorder': r.controlQuiet,
		'settings.numberInputBackground': r.canvas, 'settings.numberInputForeground': r.ink, 'settings.numberInputBorder': r.controlQuiet,
		'settings.focusedRowBackground': NONE, 'settings.rowHoverBackground': alpha(r.sunken, '99'), 'settings.focusedRowBorder': r.accent,

		// ── Welcome (Tacet replaces the page; colors kept calm if shown) ──
		'welcomePage.background': r.canvas, 'welcomePage.tileBackground': r.canvas, 'welcomePage.tileHoverBackground': r.hoverCanvas, 'welcomePage.tileBorder': r.subtle,
		'welcomePage.progress.background': r.sunken, 'welcomePage.progress.foreground': r.accent,
		'walkThrough.embeddedEditorBackground': r.sunken, 'walkthrough.stepTitle.foreground': r.ink,

		// ── Search & SCM ────────────────────────────────────
		'search.resultsInfoForeground': r.ink2, 'searchEditor.findMatchBackground': r.findOther, 'searchEditor.findMatchBorder': NONE, 'searchEditor.textInputBorder': r.controlQuiet,
		'gitDecoration.addedResourceForeground': r.success, 'gitDecoration.untrackedResourceForeground': r.success, 'gitDecoration.modifiedResourceForeground': r.accentText,
		'gitDecoration.stageModifiedResourceForeground': r.accentText, 'gitDecoration.deletedResourceForeground': r.danger, 'gitDecoration.stageDeletedResourceForeground': r.danger,
		'gitDecoration.renamedResourceForeground': r.syn.type, 'gitDecoration.ignoredResourceForeground': r.ink3, 'gitDecoration.conflictingResourceForeground': r.warnInk,
		'gitDecoration.submoduleResourceForeground': r.ink2,
		'markdownAlert.note.foreground': r.accent, 'markdownAlert.tip.foreground': r.success, 'markdownAlert.important.foreground': r.syn.keyword,
		'markdownAlert.warning.foreground': r.warnInk, 'markdownAlert.caution.foreground': r.danger,
		'markdown.extension.editor.codeSpan.background': r.sunken,
		'profileBadge.background': r.sunken, 'profileBadge.foreground': r.ink2, 'profiles.sashBorder': r.hairline,
		'extensionBadge.remoteBackground': r.sunken, 'extensionBadge.remoteForeground': r.ink2,
		'problemsErrorIcon.foreground': r.danger, 'problemsWarningIcon.foreground': r.warnInk, 'problemsInfoIcon.foreground': r.accent,
		'debugToolBar.background': r.raised, 'debugToolBar.border': r.overlayEdge,
		'debugExceptionWidget.background': r.dangerSurface, 'debugExceptionWidget.border': r.danger,
		'debugConsole.infoForeground': r.ink, 'debugConsole.warningForeground': r.warnInk, 'debugConsole.errorForeground': r.danger, 'debugConsole.sourceForeground': r.ink2,
		'debugConsoleInputIcon.foreground': r.accent,
		'debugView.exceptionLabelBackground': r.danger, 'debugView.exceptionLabelForeground': r.onAccent,
		'debugView.stateLabelBackground': r.sunken, 'debugView.stateLabelForeground': r.ink2, 'debugView.valueChangedHighlight': r.accent,
		'debugTokenExpression.name': r.syn.keyword, 'debugTokenExpression.value': r.ink2, 'debugTokenExpression.string': r.syn.string, 'debugTokenExpression.boolean': r.syn.number,
		'debugTokenExpression.number': r.syn.number, 'debugTokenExpression.error': r.danger, 'debugTokenExpression.type': r.syn.type,
		'ports.iconRunningProcessForeground': r.success, 'interactive.activeCodeBorder': r.accent, 'interactive.inactiveCodeBorder': r.hairline,
		'commentsView.resolvedIcon': r.ink3, 'commentsView.unresolvedIcon': r.accent,
		'chart.axis': r.hairline, 'chart.guide': r.subtle, 'chart.line': r.accent, 'browser.border': r.hairline
	};
}

/** Family rules for everything not listed explicitly. First match wins. */
function family(key, r) {
	const s = r.syn;
	const rules = [
		[/^terminal\.ansi(Bright)?(\w+)$/, m => r.ansi[(m[1] ?? '') + m[2]]],
		[/^symbolIcon\.(class|struct|interface|enumerator|typeParameter|type)/, () => s.type],
		[/^symbolIcon\.(function|method|constructor|event)/, () => s.function],
		[/^symbolIcon\.(string|text|key)/, () => s.string],
		[/^symbolIcon\.(number|boolean|constant|null|enumeratorMember|unit|color)/, () => s.number],
		[/^symbolIcon\.(keyword|operator|snippet|module|namespace|package)/, () => s.keyword],
		[/^symbolIcon\./, () => r.ink2],
		[/^terminalSymbolIcon\./, () => r.ink2],
		[/^testing\.icon(Passed)/, () => r.success], [/^testing\.icon(Failed|Errored)/, () => r.danger],
		[/^testing\.icon(Queued)/, () => r.warnInk], [/^testing\.icon/, () => r.ink3],
		[/^testing\.(covered)(Background|GutterBackground|MinimapBackground)$/, () => alpha(r.success, '1F')],
		[/^testing\.uncovered/, () => alpha(r.danger, '1F')], [/^testing\.(covered|uncovered)Border$/, () => NONE],
		[/^testing\.message\.error\.badgeBackground/, () => r.danger], [/^testing\.message\.error\.badgeForeground/, () => r.onAccent],
		[/^testing\.message\.error\.(badgeBorder|lineBackground)/, () => alpha(r.danger, '1A')],
		[/^testing\.message\.info\.decorationForeground/, () => r.ink3], [/^testing\.message\.info\.lineBackground/, () => NONE],
		[/^testing\.coverCountBadgeBackground/, () => r.sunken], [/^testing\.coverCountBadgeForeground/, () => r.ink2],
		[/^testing\.(peek|messagePeek)Border/, () => r.overlayEdge], [/^testing\.(peek|messagePeek)HeaderBackground/, () => r.shell],
		[/^testing\.runAction/, () => r.success], [/^testing\./, () => r.ink2],
		[/^debugIcon\.breakpoint(Disabled|Unverified)/, () => r.quiet], [/^debugIcon\.breakpoint(Current)?Stack/, () => r.warnInk],
		[/^debugIcon\.breakpoint/, () => r.danger], [/^debugIcon\.(stop|disconnect)/, () => r.danger], [/^debugIcon\.(start|continue|restart)/, () => r.success],
		[/^debugIcon\./, () => r.accent],
		[/^scmGraph\.foreground(\d)/, m => [r.accent, s.keyword, s.type, s.number, s.string][+m[1] - 1]],
		[/^scmGraph\.historyItemHoverAdditions/, () => r.success], [/^scmGraph\.historyItemHoverDeletions/, () => r.danger],
		[/^scmGraph\.historyItemHoverDefaultLabelBackground/, () => r.sunken], [/^scmGraph\.historyItemHover(Default)?LabelForeground/, () => r.ink],
		[/^scmGraph\.historyItem(Base|Remote)?RefColor/, m => m[1] === 'Remote' ? s.keyword : m[1] === 'Base' ? s.number : r.accent],
		[/^charts\.foreground/, () => r.ink], [/^charts\.lines/, () => r.hairline], [/^charts\.red/, () => r.danger], [/^charts\.blue/, () => r.accent],
		[/^charts\.yellow/, () => s.number], [/^charts\.orange/, () => s.number], [/^charts\.green/, () => r.success], [/^charts\.purple/, () => s.keyword],
		[/^notebook(StatusErrorIcon)/, () => r.danger], [/^notebookStatusSuccessIcon/, () => r.success], [/^notebookStatusRunningIcon/, () => r.accent],
		[/^notebookScrollbarSlider\.(active|hover)?[bB]ackground/, m => alpha(r.ink2, m[1] === 'active' ? '80' : m[1] === 'hover' ? '66' : '40')],
		[/^notebook\.(editorBackground|cellEditorBackground|outputContainerBackgroundColor)/, m => m[1] === 'cellEditorBackground' ? r.sunken : r.canvas],
		[/^notebook\.(focusedCellBorder|focusedEditorBorder|selectedCellBorder|cellInsertionIndicator)/, () => r.accent],
		[/^notebook\.(inactive\w+Border|cellBorderColor|outputContainerBorderColor|cellToolbarSeparator)/, () => r.hairline],
		[/^notebook\.(\w+)Background/, () => alpha(r.sunken, '80')], [/^notebookEditorOverviewRuler\./, () => r.accent],
		[/^mergeEditor\.change\.word/, () => r.insText], [/^mergeEditor\.change\./, () => r.insLine],
		[/^mergeEditor\.changeBase\.word/, () => r.remText], [/^mergeEditor\.changeBase\./, () => r.remLine],
		[/^mergeEditor\.conflict\.input1/, () => alpha(r.success, '1F')], [/^mergeEditor\.conflict\.input2/, () => alpha(r.accent, '1F')],
		[/^mergeEditor\.conflict\.(un)?handled(Focused|Unfocused)\.border/, m => m[1] ? r.warnInk : r.quiet],
		[/^mergeEditor\.conflict\.(un)?handled\.minimap/, m => m[1] ? r.warnInk : r.quiet], [/^mergeEditor\.conflictingLines/, () => alpha(r.warnInk, '1F')],
		[/^editorOverviewRuler\.(error)/, () => r.danger], [/^editorOverviewRuler\.(warning)/, () => r.warnInk], [/^editorOverviewRuler\.(info)/, () => r.accent],
		[/^editorOverviewRuler\.added/, () => alpha(r.success, 'B3')], [/^editorOverviewRuler\.deleted/, () => alpha(r.danger, 'B3')], [/^editorOverviewRuler\.modified/, () => alpha(r.accent, 'B3')],
		[/^editorOverviewRuler\.findMatch/, () => r.find], [/^editorOverviewRuler\.(incoming|current|common)Content/, () => alpha(r.accent, '80')],
		[/^editorOverviewRuler\./, () => alpha(r.ink3, '80')],
		[/^editorIndentGuide\.activeBackground\d/, () => r.controlQuiet], [/^editorIndentGuide\.background\d/, () => r.hairline],
		[/^editorBracketPairGuide\.activeBackground\d/, () => r.controlQuiet], [/^editorBracketPairGuide\.background\d/, () => NONE],
		[/^editorCommentsWidget\.(resolved|unresolved)Border/, m => m[1] === 'resolved' ? r.hairline : r.accent],
		[/^editorCommentsWidget\.range(Active)?Background/, () => alpha(r.find, '33')], [/^editorCommentsWidget\.replyInputBackground/, () => r.canvas],
		[/^extensionIcon\./, () => r.ink2], [/Foreground$/, () => r.ink2], [/Background$/, () => NONE], [/Border$/, () => r.hairline]
	];
	for (const [re, fn] of rules) {
		const m = key.match(re);
		if (m) { return fn(m); }
	}
	return undefined;
}

function tokenColors(r) {
	const s = r.syn;
	return [
		{ name: 'Default', settings: { foreground: s.variable } },
		{ name: 'Comments', scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: s.comment, fontStyle: 'italic' } },
		{ name: 'Strings', scope: ['string', 'string.quoted', 'string.template', 'punctuation.definition.string'], settings: { foreground: s.string } },
		{ name: 'Regex / escapes', scope: ['string.regexp', 'constant.character.escape'], settings: { foreground: s.number } },
		{ name: 'Numbers & constants', scope: ['constant.numeric', 'constant.language', 'constant.other', 'support.constant', 'variable.other.constant', 'variable.other.enummember'], settings: { foreground: s.number } },
		{ name: 'Keywords & storage', scope: ['keyword', 'keyword.control', 'storage.type', 'storage.modifier', 'keyword.operator.new', 'keyword.operator.expression', 'keyword.operator.logical.python'], settings: { foreground: s.keyword } },
		{ name: 'Operators & punctuation', scope: ['keyword.operator', 'punctuation', 'meta.brace', 'punctuation.separator', 'punctuation.terminator'], settings: { foreground: s.punctuation } },
		{ name: 'Types', scope: ['entity.name.type', 'entity.name.class', 'support.type', 'support.class', 'entity.other.inherited-class', 'storage.type.cs', 'storage.type.java'], settings: { foreground: s.type } },
		{ name: 'Functions', scope: ['entity.name.function', 'support.function', 'meta.function-call entity.name.function', 'variable.function'], settings: { foreground: s.function } },
		{ name: 'Variables & params', scope: ['variable', 'variable.parameter', 'meta.definition.variable'], settings: { foreground: s.variable } },
		{ name: 'Properties', scope: ['variable.other.property', 'variable.other.object.property', 'meta.object-literal.key', 'support.type.property-name'], settings: { foreground: s.variable } },
		{ name: 'this/self', scope: ['variable.language', 'variable.language.this', 'variable.language.self'], settings: { foreground: s.keyword, fontStyle: 'italic' } },
		{ name: 'Tags', scope: ['entity.name.tag', 'meta.tag.sgml', 'punctuation.definition.tag'], settings: { foreground: s.function } },
		{ name: 'Attributes', scope: ['entity.other.attribute-name', 'entity.other.attribute-name.id', 'entity.other.attribute-name.class'], settings: { foreground: s.number } },
		{ name: 'CSS properties & values', scope: ['support.type.property-name.css', 'support.type.vendored.property-name'], settings: { foreground: s.type } },
		{ name: 'CSS selectors', scope: ['entity.name.tag.css', 'entity.other.attribute-name.class.css', 'entity.other.attribute-name.pseudo-class.css'], settings: { foreground: s.function } },
		{ name: 'CSS units & colors', scope: ['keyword.other.unit', 'constant.other.color', 'support.constant.property-value.css'], settings: { foreground: s.number } },
		{ name: 'JSON keys', scope: ['support.type.property-name.json', 'string.json support.type.property-name'], settings: { foreground: s.function } },
		{ name: 'YAML keys', scope: ['entity.name.tag.yaml'], settings: { foreground: s.function } },
		{ name: 'Shell commands', scope: ['support.function.builtin.shell', 'entity.name.command.shell'], settings: { foreground: s.function } },
		{ name: 'PowerShell variables', scope: ['variable.other.readwrite.powershell', 'punctuation.definition.variable.powershell'], settings: { foreground: s.type } },
		{ name: 'Decorators', scope: ['meta.decorator', 'entity.name.function.decorator', 'punctuation.decorator'], settings: { foreground: s.keyword } },
		{ name: 'Invalid', scope: ['invalid', 'invalid.illegal'], settings: { foreground: s.invalid } },
		{ name: 'Deprecated', scope: ['invalid.deprecated'], settings: { foreground: r.ink3, fontStyle: 'strikethrough' } },
		// ── Markdown (Code view source) ──
		{ name: 'MD heading', scope: ['markup.heading', 'markup.heading entity.name', 'entity.name.section.markdown', 'heading.1.markdown', 'heading.2.markdown', 'heading.3.markdown'], settings: { foreground: s.function, fontStyle: 'bold' } },
		{ name: 'MD heading marker', scope: ['punctuation.definition.heading.markdown'], settings: { foreground: r.ink3, fontStyle: 'bold' } },
		{ name: 'MD bold', scope: ['markup.bold'], settings: { fontStyle: 'bold' } },
		{ name: 'MD italic', scope: ['markup.italic'], settings: { fontStyle: 'italic' } },
		{ name: 'MD strike', scope: ['markup.strikethrough'], settings: { fontStyle: 'strikethrough' } },
		{ name: 'MD emphasis markers', scope: ['punctuation.definition.bold.markdown', 'punctuation.definition.italic.markdown', 'punctuation.definition.strikethrough.markdown'], settings: { foreground: r.ink3 } },
		{ name: 'MD inline code & fences', scope: ['markup.inline.raw', 'markup.fenced_code.block.markdown punctuation.definition', 'fenced_code.block.language', 'markup.raw.block.markdown', 'punctuation.definition.raw.markdown'], settings: { foreground: s.raw } },
		{ name: 'MD link text', scope: ['string.other.link.title.markdown', 'string.other.link.description.markdown', 'meta.link.inline.markdown string.other.link'], settings: { foreground: r.accent } },
		{ name: 'MD link url', scope: ['markup.underline.link', 'markup.underline.link.markdown', 'markup.underline.link.image.markdown'], settings: { foreground: r.ink3 } },
		{ name: 'MD link punctuation', scope: ['punctuation.definition.link.title.begin.markdown', 'punctuation.definition.link.title.end.markdown', 'punctuation.definition.metadata.markdown', 'punctuation.definition.link.markdown'], settings: { foreground: r.ink3 } },
		{ name: 'MD list marker', scope: ['punctuation.definition.list.begin.markdown', 'beginning.punctuation.definition.list.markdown'], settings: { foreground: r.ink2 } },
		{ name: 'MD task marker', scope: ['markup.list.task', 'constant.language.checkbox', 'punctuation.definition.checkbox'], settings: { foreground: r.ink2 } },
		{ name: 'MD quote', scope: ['markup.quote', 'punctuation.definition.quote.begin.markdown'], settings: { foreground: r.ink2 } },
		{ name: 'MD hr', scope: ['meta.separator.markdown'], settings: { foreground: r.quiet } },
		{ name: 'MD table', scope: ['punctuation.separator.table.markdown', 'markup.table punctuation'], settings: { foreground: r.quiet } },
		{ name: 'MD frontmatter', scope: ['meta.embedded.block.frontmatter', 'punctuation.definition.tag.begin.frontmatter'], settings: { foreground: r.ink2 } },
		{ name: 'MD html', scope: ['text.html.markdown meta.tag', 'text.html.markdown entity.name.tag'], settings: { foreground: r.ink3 } },
		{ name: 'Diff inserted', scope: ['markup.inserted'], settings: { foreground: r.success } },
		{ name: 'Diff deleted', scope: ['markup.deleted'], settings: { foreground: r.danger } },
		{ name: 'Diff changed', scope: ['markup.changed'], settings: { foreground: r.accent } }
	];
}

function semanticTokenColors(r) {
	const s = r.syn;
	return {
		'namespace': s.type, 'class': s.type, 'enum': s.type, 'interface': s.type, 'struct': s.type, 'typeParameter': s.type, 'type': s.type,
		'function': s.function, 'method': s.function, 'macro': s.function, 'decorator': s.keyword,
		'parameter': s.variable, 'variable': s.variable, 'property': s.variable, 'enumMember': s.number, 'event': s.function,
		'keyword': s.keyword, 'modifier': s.keyword, 'comment': { foreground: s.comment, italic: true }, 'string': s.string, 'number': s.number, 'regexp': s.number, 'operator': s.punctuation,
		'variable.readonly': s.number, 'variable.defaultLibrary': s.type, 'function.defaultLibrary': s.function,
		'*.deprecated': { strikethrough: true }, '*.declaration': { bold: false }
	};
}

function build(variant, name, type) {
	const r = roles(variant);
	const ex = explicit(r);
	const colors = {};
	let fromExplicit = 0, fromFamily = 0;
	const missing = [];
	for (const key of allKeys) {
		if (key in ex && ex[key] !== undefined) { colors[key] = ex[key]; fromExplicit++; continue; }
		const f = family(key, r);
		if (f !== undefined) { colors[key] = f; fromFamily++; } else { missing.push(key); }
	}
	const theme = {
		$schema: 'vscode://schemas/color-theme',
		name, type,
		semanticHighlighting: true,
		colors: Object.fromEntries(Object.entries(colors).sort(([a], [b]) => a.localeCompare(b))),
		tokenColors: tokenColors(r),
		semanticTokenColors: semanticTokenColors(r)
	};
	return { theme, report: { total: allKeys.length, fromExplicit, fromFamily, missing } };
}

const outputs = [
	['light', 'Tacet Light', 'light', 'tacet-light-color-theme.json'],
	['dark', 'Tacet Dark', 'dark', 'tacet-dark-color-theme.json'],
	['hc', 'Tacet High Contrast Light', 'hcLight', 'tacet-hc-light-color-theme.json']
];
for (const [variant, name, type, file] of outputs) {
	const { theme, report } = build(variant, name, type);
	writeFileSync(join(here, '..', file), JSON.stringify(theme, null, '\t') + '\n');
	console.log(`${file}: ${report.total} keys (${report.fromExplicit} explicit, ${report.fromFamily} family)${report.missing.length ? `, MISSING ${report.missing.length}: ${report.missing.join(', ')}` : ', complete'}`);
}
console.log(`AI color ids intentionally excluded: ${EXCLUDED.map(String).join(' ')}`);

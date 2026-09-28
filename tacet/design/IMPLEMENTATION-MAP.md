# Tacet design: implementation map

Ordered engineering tasks that turn [DESIGN-GUIDE.md](DESIGN-GUIDE.md) into the Code OSS 1.139.0 workbench. Start **after W1 AI removal lands** (STATE.md); several tasks delete upstream chrome that AI removal also touches, and doing them first creates merge pain.

Conventions:
- **Size:** S ≤ half a day, M ≤ 2 days, L ≤ 5 days, for one engineer who knows the workbench.
- **Accept:** the check that closes the task. Screenshots go to `tacet/evidence/design/<task>.png` at 100% and 200% scale, light, dark, and one Contrast Theme.
- Each task is one reviewable patch. Keep Tacet code in `src/vs/workbench/contrib/tacet/` and `extensions/tacet*/` wherever a seam exists; touch upstream files only where listed.
- All CSS uses `--vscode-*` color variables and size tokens (see `.github/instructions/design-tokens.instructions.md`). New size tokens need both `src/vs/platform/theme/common/sizes/baseSizes.ts` and `build/lib/stylelint/vscode-known-variables.json`.
- User-visible strings go through `nls.localize`. Sentence case in Tacet-owned surfaces (guide §2.3).
- Do not run a watch task for these; `npm run compile-client` once per task, targeted tests where behavior changes.

## Phase 0: Foundation

### T0.1 Theme extension scaffold (S)
- Create `extensions/theme-tacet/` (`package.json`, `package.nls.json`, `themes/`, `icons/`, `fileicons/`).
- Contribute `themes`: `Tacet Light` (`uiTheme: "vs"`), `Tacet Dark` (`"vs-dark"`), `Tacet High Contrast Light` (`"hc-light"`), from `tacet/design/theme/*.json`. Copy, do not symlink; keep `tacet/design/theme/_build/generate-themes.mjs` as the source and add a one-line note in the extension README that the JSON is generated.
- Add the extension to the built-in list (`build/gulpfile.extensions.*` / `product.json builtInExtensions` owner decides) and to `build/npm/dirs.ts` only if it gets dependencies (it should not).
- **Accept:** `Preferences: Color Theme` lists the three themes; switching shows no console color-registry warnings; `node tacet/design/theme/_build/generate-themes.mjs` reports `complete` for all three.

### T0.2 Default theme wiring (S)
- Configuration defaults (see T3.1 mechanism): `workbench.colorTheme: "Tacet Light"`, `workbench.preferredLightColorTheme: "Tacet Light"`, `workbench.preferredDarkColorTheme: "Tacet Dark"`, `workbench.preferredHighContrastLightColorTheme: "Tacet High Contrast Light"`, `window.autoDetectColorScheme: true`, `window.autoDetectHighContrast: true`.
- Update the startup background so the first paint is white, not VS Code grey: `src/vs/platform/theme/electron-main/themeMainServiceImpl.ts` default light background → `#FFFFFF`, dark → `#1B1C1F`.
- **Accept:** cold launch shows no grey flash (record 60 fps screen capture of first 500ms).

## Phase 1: Identity assets

### T1.1 Bundle fonts (S)
- Copy `tacet/design/fonts/cascadia-code/*` and `tacet/design/fonts/source-serif-4/*` (with LICENSE files) into `extensions/theme-tacet/fonts/` (webview use) and `resources/fonts/` (workbench use). Add both to `ThirdPartyNotices` / `cglicenses.json` per the release process.
- Register `@font-face` in `src/vs/workbench/browser/media/style.css` for `Cascadia Code` (weight 200 to 700) and `Source Serif 4` (roman + italic) using `FileAccess` URIs (same pattern as codicon font loading in `src/vs/base/browser/ui/codicons/codicon/codicon.css`).
- For the rich Markdown webview, add the fonts to `localResourceRoots` in `extensions/markdown-language-features/src/preview/markdownEditorProvider.ts` and declare `@font-face` in `mdThemeTacet.css`.
- **Accept:** on a Windows 10 VM without Cascadia installed, Code view and terminal render Cascadia; DevTools shows the font loaded from the app bundle, not the network.

### T1.2 UI font stack (S)
- `src/vs/workbench/browser/media/style.css` line 18: `.monaco-workbench.windows { font-family: "Segoe UI Variable Text", "Segoe WPC", "Segoe UI", sans-serif; }`; add `"Segoe UI Variable Text"` first in the `:lang()` variants too.
- Add utility classes `.tacet-display` (`"Segoe UI Variable Display"`) and `.tacet-small` (`"Segoe UI Variable Small"`) in `src/vs/workbench/contrib/tacet/browser/media/tacet.css` for page titles and 11 to 12px labels.
- **Accept:** DevTools computed font on title bar, shelf, menus = Segoe UI Variable Text on Windows 11.

### T1.3 App icon and file association icons (M)
- Source: `tacet/design/assets/icon/tacet-app-icon.svg` (48+), `-32.svg`, `-24.svg`, `-16.svg`, `-hc.svg`, `tacet-file-md.svg`, `tacet-file-txt.svg`.
- Produce `resources/win32/tacet.ico` with frames 16, 20, 24, 32, 40, 48, 64, 256 (16 from `-16.svg`, 20/24 from `-24.svg`, 32/40 from `-32.svg`, 48+ from master). Tool: any deterministic SVG→PNG (headless Chromium screenshot as done in `tacet/design/assets/icon/`) then `png-to-ico`-equivalent; commit the PNGs and the ICO.
- Replace `resources/win32/code_70x70.png`, `code_150x150.png` (VisualElementsManifest tiles, background white), `markdown.ico` → `tacet-file-md` frames, add `text.ico` from `tacet-file-txt`. Installer bitmaps `inno-big-*.bmp` / `inno-small-*.bmp`: white background, master icon centered.
- `product.json` icon references are owner-controlled; list the exact keys in the PR description instead of editing if the owner has not approved.
- **Accept:** taskbar (light and dark), Start, Alt+Tab, Explorer (details/large icons) screenshots at 100/150/200%; the 16px frame is pixel-inspected (no blur on the rule).

## Phase 2: Shell and title bar

### T2.1 Title bar height 48 and caption overlay (M)
- `src/vs/platform/window/common/window.ts`: add `TACET_TITLEBAR_HEIGHT = 48` and use it where `DEFAULT_CUSTOM_TITLEBAR_HEIGHT` feeds the custom title bar on Windows (keep upstream constant for other platforms if not yet qualified).
- `src/vs/platform/windows/electron-main/windows.ts` line ~228: `titleBarOverlay.height` 29 → 48; `windowImpl.ts` `updateWindowControls` keeps height in sync.
- `src/vs/workbench/browser/parts/titlebar/titlebarPart.ts` `minimumHeight` path: return 48 when custom title bar is on.
- `titlebarpart.css`: remove the bottom border; center content vertically; 12px left padding.
- Caption symbol color from theme: `titleBar.activeForeground`; overlay color: `titleBar.activeBackground`.
- **Accept:** snap layouts flyout appears on Maximize hover; double-click maximizes; Alt+Space menu; caption buttons exactly 46 × 48 (inspect with Accessibility Insights).

### T2.2 Remove command center, layout controls, menu row (S)
- Configuration defaults: `window.commandCenter: false`, `workbench.layoutControl.enabled: false`, `window.menuBarVisibility: "toggle"`, `window.menuStyle: "custom"`, `window.titleBarStyle: "custom"`, `window.controlsStyle: "native"`.
- **Accept:** title bar shows only Tacet controls; Alt shows the File/Edit/View row and Escape hides it.

### T2.3 Material follows region (M)
- Publish the shelf width to CSS: in `src/vs/workbench/browser/layout.ts`, when the side bar is visible and on the left, set `--tacet-shelf-width: <px>` on the title bar and status bar part containers on every layout pass (0px when hidden or on the right).
- `titlebarpart.css` and `statusbarpart.css`: `background: linear-gradient(to right, var(--vscode-sideBar-background) var(--tacet-shelf-width, 0px), var(--vscode-titleBar-activeBackground) 0)` (status bar uses `--vscode-statusBar-background`). Draw the shelf's right hairline continuously through both bars with a 1px `box-shadow` at `--tacet-shelf-width`.
- Fallback if the layout patch is rejected: skip this task; themes already set `titleBar.activeBackground = canvas`.
- **Accept:** screenshot with shelf open shows one unbroken hairline from top to bottom and no seam where bars meet parts; resizing the shelf keeps the split aligned within 0px.

### T2.4 Scroll hairline under the title bar (S)
- Add class `.tacet-content-scrolled` on the title bar when the active editor's scrollTop > 0 (listen to `IEditorService.activeEditorPane` scroll events via `onDidChangeScroll` for Monaco and a webview message for the rich editor). CSS: 1px `--vscode-sideBar-border` bottom edge on the canvas segment only.
- **Accept:** at scrollTop 0 no line; 1px line after scrolling; no line when shelf-only content scrolls.

### T2.5 Document title control (L)
- New `src/vs/workbench/contrib/tacet/browser/titleControl/tacetTitleControl.ts` registered into the title bar center-left slot (replacing the command-center slot). Renders filename (semibold), folder or `Draft` (secondary), dirty dot, read-only lock.
- Click opens the title menu popover (`IContextViewService`, Level 2 styles): editable name (rename via `IWorkingCopyFileService`), location with `Show in File Explorer`, `Move…`, `Save As…`, `Open Documents` list (MRU of `IEditorService.editors`), `Version History` (local history).
- `window.title` default: `${dirty}${activeEditorShort}${separator}Tacet` (taskbar text).
- **Accept:** keyboard: Tab to title, Enter opens, arrows move, Escape returns focus; rename a file and a draft; screen reader announces "A quieter morning.md, Notes, edited".

### T2.6 Mode control (M)
- New `src/vs/workbench/contrib/tacet/browser/modeControl/modeControl.ts` + `media/modeControl.css` per guide §4.5. Centered over the editor part's horizontal extent (read `IWorkbenchLayoutService.getContainer(Parts.EDITOR_PART)` bounds).
- Wire to the document router commands (`tacet.mode.write|read|code`, Ctrl+Alt+1/2/3) owned by M03; this task is UI only.
- **Accept:** fixed-width segments (no width change on selection); thumb slide 160ms; reduced motion jumps; `aria-pressed` and roving focus verified with Narrator.

### T2.7 Activity bar: hidden in writing, top in Coding Tools (S)
- Coding Tools toggle command (owned by M10) sets `workbench.activityBar.location` between `"hidden"` and `"top"`; unpin Extensions, Testing, Remote Explorer, Accounts (`paneCompositeBar` pinned state defaults in `src/vs/workbench/browser/parts/paneCompositeBar.ts`).
- `activityaction.css`: replace numeric badges with a 6px dot for the top position.
- **Accept:** writing screenshot has no rail; Coding Tools shows four icons in the shelf header.

## Phase 3: Defaults

### T3.1 Configuration defaults (S)
Mechanism: `extensions/tacet/package.json` `contributes.configurationDefaults` (preferred, reviewable), or `product.json configurationDefaults` if the owner prefers. Values:

```jsonc
{
  "workbench.startupEditor": "none",
  "workbench.tips.enabled": false,
  "workbench.editor.empty.hint": "hidden",
  "workbench.welcomePage.walkthroughs.openOnInstall": false,
  "workbench.editor.showTabs": "none",
  "workbench.activityBar.location": "hidden",
  "workbench.statusBar.visible": true,
  "workbench.reduceMotion": "auto",
  "workbench.tree.indent": 12,
  "workbench.tree.renderIndentGuides": "onHover",
  "workbench.sash.hoverDelay": 300,
  "workbench.hover.delay": 600,
  "workbench.iconTheme": "tacet-files",
  "workbench.productIconTheme": "tacet-icons",
  "workbench.experimental.modernUI": true,
  "workbench.experimental.modernUIEditorTabStyle": "pill",
  "window.density.editorTabHeight": "compact",
  "window.dialogStyle": "native",
  "breadcrumbs.enabled": false,
  "explorer.decorations.badges": false,
  "editor.fontFamily": "'Cascadia Code', 'Cascadia Mono', Consolas, monospace",
  "editor.fontSize": 14,
  "editor.lineHeight": 22,
  "editor.fontLigatures": false,
  "editor.minimap.enabled": false,
  "editor.renderLineHighlight": "gutter",
  "editor.cursorBlinking": "phase",
  "editor.cursorSmoothCaretAnimation": "explicit",
  "editor.cursorWidth": 2,
  "editor.guides.bracketPairs": "active",
  "editor.showFoldingControls": "mouseover",
  "editor.occurrencesHighlight": "singleFile",
  "editor.renderWhitespace": "selection",
  "editor.overviewRulerBorder": false,
  "editor.hideCursorInOverviewRuler": true,
  "editor.scrollbar.verticalScrollbarSize": 10,
  "editor.scrollbar.horizontalScrollbarSize": 10,
  "editor.padding.top": 16,
  "editor.stickyScroll.enabled": false,
  "editor.inlineSuggest.enabled": false,
  "editor.hover.delay": 500,
  "diffEditor.useInlineViewWhenSpaceIsLimited": true,
  "terminal.integrated.fontFamily": "'Cascadia Code', 'Cascadia Mono', Consolas, monospace",
  "terminal.integrated.fontSize": 13,
  "terminal.integrated.lineHeight": 1.4,
  "terminal.integrated.cursorStyle": "line",
  "terminal.integrated.cursorWidth": 2,
  "terminal.integrated.minimumContrastRatio": 4.5,
  "[markdown]": { "editor.lightbulb.enabled": "off", "editor.wordWrap": "on", "editor.lineNumbers": "on" },
  "[plaintext]": {
    "editor.fontFamily": "'Segoe UI Variable Text', 'Segoe UI', sans-serif",
    "editor.fontSize": 17, "editor.lineHeight": 28,
    "editor.lineNumbers": "off", "editor.glyphMargin": false, "editor.folding": false,
    "editor.wordWrap": "bounded", "editor.wordWrapColumn": 72,
    "editor.padding.top": 56, "editor.renderWhitespace": "none", "editor.lightbulb.enabled": "off"
  }
}
```
- Coding Tools layout flips: `workbench.activityBar.location: "top"`, `workbench.editor.showTabs: "single"`, `breadcrumbs.enabled: true`, `editor.stickyScroll.enabled: true` (as user-scope layout state owned by M10, not as permanent setting writes).
- **Accept:** fresh profile shows the writing layout; `Preferences: Open Default Settings (JSON)` shows the Tacet values.

### T3.2 Centered literal-text layout (M)
- `.txt` Write/Read: enable centered layout per editor with fixed width = measure (`workbench.editor.centeredLayoutFixedWidth: true`, width 680 + 64 gutters) scoped to plaintext editors in Tacet's document router; line numbers off; no gutter. Text size setting maps to `editor.fontSize`/`lineHeight` for `[plaintext]`.
- **Accept:** a 200-character line wraps at the measure and the column stays centered from 720 to 2560px wide windows.

## Phase 4: Document surface

### T4.1 Tacet document theme in the rich editor (M)
- Copy `tacet/design/css/md-theme-tacet.css` to `extensions/markdown-language-features/markdown-editor-src/mdThemeTacet.css` (add copyright header), import it in `editor.ts` after `markdownEditor.css`, and change `editor.ts` line ~302 `classNames: ['md-theme-vscode-default']` → `['md-theme-tacet']`.
- Keep `@vscode/markdown-editor/themes/vscode-default.css` imported until the diff is reviewed, then remove it.
- Map syntax variables: in `syntaxHighlighter.ts` (or host CSS) set `--tacet-syntax-*` from the theme's token colors so fences match Code view.
- **Accept:** `tacet/design/css/typography-specimen.png` metrics reproduced in the real editor (overlay at 50% opacity, deviations ≤ 1px in line positions); Write↔Read switch moves 0 pixels (automated: capture element rects of the first 20 blocks in both modes and diff).

### T4.2 Document text size and line width settings (M)
- Settings `tacet.document.fontSize` (12 to 28, default 17), `tacet.document.lineWidth` (`narrow` 600 / `standard` 680 / `wide` 800), `tacet.document.typeface` (`sans` / `serif` / `mono`).
- Host passes them to the webview as CSS variables `--markdown-font-size`, `--tacet-line-width`, `--markdown-font-family`. Commands: Increase/Decrease/Reset Document Text Size; Ctrl+wheel over the document (setting `tacet.document.mouseWheelZoom`, default true).
- **Accept:** text size change preserves the reading anchor (first visible block stays within ±1 line).

### T4.3 Remove in-document read-only toggle; placeholder (S)
- The theme CSS hides `.md-readonly-toggle`; in `editor.ts` stop creating it when Tacet's mode control is present (`md-editor-content-with-readonly-toggle` class must not add padding).
- Empty draft placeholder `Start writing.` in ink3 on the first empty paragraph (webview-side, not in the file).
- Disable the `:running:` agent spinner rendering path (docs/06-NO-AI); CSS already neutralizes it.
- **Accept:** blank draft shows the placeholder; typing removes it; the file on disk never contains it.

### T4.4 Caret, selection and scrollbars in the webview (S)
- `markdownEditor.css`: `#editor` scrollbar styling to match §4.30 (`::-webkit-scrollbar { width: 10px }`, thumb radius full, `scrollbarSlider.*` colors, transparent track); keep `.monaco-editor-background` rules untouched.
- **Accept:** scrollbar thumb visibly identical in rich editor and Monaco (side-by-side screenshot).

## Phase 5: Shelf

### T5.1 Shelf view container and rows (L)
- Owned with M06. Views: Drafts, Recent Files, Folders, On This Page. Row renderer: 32/44 heights, icon 16, one secondary line max, dirty dot, single hover action, missing-file inline actions.
- CSS in `src/vs/workbench/contrib/tacet/browser/shelf/media/shelf.css`; section headers use the pane header without chevrons and without borders (`paneviewlet.css` override scoped to `.tacet-shelf`).
- Find field at top: a button styled as an input that opens Ctrl+P (not a second search implementation).
- **Accept:** keyboard traversal (arrows, Home/End, type-ahead, Enter), two same-title files distinguishable, empty sections hidden.

### T5.2 Shelf responsive overlay (M)
- Below 960px window width the shelf opens as an overlay (Level 2 shadow, above the editor, not resizing it); Escape or clicking the document closes it; focus returns to the toggle.
- **Accept:** 720px window: opening the shelf does not move any document text.

## Phase 6: Icons

### T6.1 Product icon font (M)
- Build `tacet-icons.woff` from `tacet/design/icons/*.svg` (24 glyphs, codepoints in `glyph-map.json`) plus the Fluent UI System Icons 16 Regular subset for the remaining ids in guide §10.3 (MIT; add to ThirdPartyNotices). Tool: any SVG→font build (e.g. `fantasticon` run once, output committed; no runtime dependency).
- Contribute `productIconThemes` in `extensions/theme-tacet/package.json` → `icons/tacet-product-icon-theme.json` (draft in `tacet/design/icons/`).
- **Accept:** `Preferences: Product Icon Theme` → Tacet; every icon in guide §10.3 renders; no codicon remains visible in the writing layout (DevTools query `.codicon:not([class*="margin"])` inside title bar, shelf, footer returns zero).

### T6.2 File icon theme `tacet-files` (S)
- Five SVG glyphs (note, text, code, folder, folder-open) derived from `icons/file.svg`, `file-text.svg`, `mode-code.svg`, `folder.svg`; monochrome ink2; dark variants via `"light"`/default sections.
- **Accept:** Explorer and quick open show monochrome icons; `.md` and `.txt` distinguishable.

## Phase 7: Overlays and controls

### T7.1 Quick input frame (M)
- `src/vs/platform/quickinput/browser/quickInputController.ts`: `MAX_WIDTH` 600 → 640; top offset 88 (layout service quick input top); input row 48 (`quickInput.css`), radius 12, Level 3 shadow, rows radius 8 inset 8; two-line file rows 52 for the Tacet file picker; footer hint row.
- **Accept:** matches `assets/mockups/05-file-finder-palette.png` palette anatomy (not its position); Escape restores focus.

### T7.2 Menus (S)
- `src/vs/base/browser/ui/menu/menu.ts` style constants: container padding 4, row height 28, row padding 0 12, radius 8 outer / 4 rows, separator margin 4, keybinding color ink2.
- **Accept:** context menu on shelf row and editor matches guide §4.20; HC shows borders.

### T7.3 Hovers, notifications, dialogs (M)
- `hoverWidget.css`, `hover.css`: radius 8, padding 6 10, max width 480.
- `notificationsToasts.css`: width 400, 16 from edges, radius 8, Level 2; max 3 visible; info auto-hide 6s (upstream timeouts), warnings/errors persist.
- `dialog.css`: width 440, padding 24, radius 12, title 18/24 Display, buttons 32; primary = safe action.
- **Accept:** screenshots vs guide; Narrator reads dialog title and default button.

### T7.4 Controls (M)
- `button.css`: radius 4, heights 28/32, padding 0 12, 13 semibold primary.
- `inputBox.css`: 28 tall, 1px controlQuiet, focus 1px accent + 2px ring.
- `toggle.css` and settings boolean renderer: Windows 11 toggle switch (guide §4.25) for Tacet-owned settings sections.
- Checkbox 16 in UI (`checkbox.*` colors already themed).
- **Accept:** control gallery page (the upstream component explorer if available, else a Tacet dev command) screenshot in light/dark/HC.

### T7.5 Find widget (S)
- `findWidget.css`: radius 8, width 360/440, input 28, toggles 24 with compact 12 glyphs, count label tabular ink2, `No results` in ink2 (not error red). Rich editor find inherits via `--md-find-*` (T4.1).
- **Accept:** Ctrl+F / Ctrl+H in Write and Code look identical; replace hidden in Read.

## Phase 8: Footer

### T8.1 Document footer (M)
- Status bar height 28 (`statusbarpart.css`), item padding 0 8, text 12/16 ink2, hover fill radius 4.
- Tacet items: save state (left, fixed 160 width, aligned to the column's left edge via a computed `margin-left` from the editor layout), word count + read time (right, aligned to the column's right edge). In Coding Tools use upstream items (Ln/Col, indentation, encoding, EOL, language, branch); hide notifications bell when empty, feedback, layout, accounts, language status in writing.
- `Saving…` only after 400ms; failure text persists in danger ink.
- **Accept:** state never shifts neighboring items; screen reader announces saves and failures only (not word counts).

## Phase 9: Pages and states

### T9.1 First run and empty editor (S)
- Remove Getting Started from startup (T3.1). Draft-on-launch owned by M05.
- `editorGroupWatermark.ts`: replace entries with `No document open.` and text buttons New Note / Open File; hide the letterpress (`editorgroupview.css`).
- One-time footer hint `Ctrl+O to open a file` (hidden after first keystroke or 20s; stored in profile).
- **Accept:** first-run profile: caret blinking in a blank draft within the startup budget; nothing else on screen.

### T9.2 Settings landing (M)
- Tacet settings landing (sections Appearance, Editing, Files and recovery, Coding tools, Keyboard shortcuts, All settings) in `settingsEditor2.ts` TOC filter + `settingsEditor2.css` (page title 24/32 Display, rows 64, 640 max width, modified indicator 2px accent bar).
- **Accept:** matches `assets/mockups/06-settings.png`; 200% scale fits without horizontal scroll.

### T9.3 File notices (M)
- Editor overlay notice component for S13/S15/S16 (guide §4.24) above both editors; actions as buttons; warning surface; height animation gentle.
- **Accept:** all notice messages from docs/03 reachable and keyboard-operable.

## Phase 10: Accessibility and motion

### T10.1 Focus (S)
- Adopt modern UI `keyboardFocusOnly.css` (via `workbench.experimental.modernUI: true`); global `:focus-visible` 2px accent, offset 2 in `style.css`; add 4px padding to scroll containers that clip rings (shelf list, palette list, settings TOC).
- **Accept:** Tab through title bar → shelf → document → footer: ring visible and unclipped at every stop.

### T10.2 High contrast (M)
- Verify Tacet High Contrast Light and upstream HC Dark on every surface; rich editor `forced-colors` rules (T4.1); title bar split drawn as a line in HC (`contrastBorder`).
- Re-test upstream issue 321623 behaviors in the rich editor.
- **Accept:** Aquatic, Desert, Dusk, Night sky screenshots of S01 to S10; no information by color alone.

### T10.3 Reduced motion (S)
- `workbench.reduceMotion: "auto"` honored by mode thumb, shelf width, overlays, notices, caret (`editor.cursorBlinking` stays phase; smooth caret off under reduced motion).
- **Accept:** with Windows "Animation effects" off, no element translates.

## Phase 11: Compact window

### T11.1 Breakpoints (M)
- Implement guide §3.3: window min size 480 × 360 (`windows.ts` `minWidth/minHeight`), title bar truncation order (folder name, then filename ellipsis, then mark), segments 52 below 720, shelf overlay below 960, rich editor `md-editor-narrow` below 600 (padding 24, H1 28/36), footer keeps state + one metric.
- **Accept:** matches `assets/mockups/08-compact-480.png`; at 480 × 360 and 200% scale every essential action is reachable.

## Phase 12: Verification

### T12.1 Contrast audit script (S)
- Node script under `margin/tests/` that loads the three theme JSONs and checks the pairs listed in tokens.json `$description` ratios (ink/canvas, ink2/shell, accent/canvas, onAccent/accent, etc.). Fails below 4.5:1 for text roles and 3:1 for control edges.
- **Accept:** CI-runnable, green.

### T12.2 Design review pass (M)
- Run the guide §13 checklist on the real build for S01 to S20; file one issue per failure with feeling → surface → principle → move (design-philosophy phrasing).
- **Accept:** zero open "Calm" or "Focused" issues on S01, S02, S03, S19.

## Dependency order at a glance

```
T0.1 → T0.2 → T1.1 → T1.2 ─┐
                T1.3        ├→ T2.1 → T2.2 → T2.3 → T2.4
                            │           └→ T2.5 → T2.6 → T2.7
T3.1 → T3.2 ────────────────┤
T4.1 → T4.2 → T4.3 → T4.4 ──┤ (needs T1.1)
T5.1 → T5.2 ────────────────┤ (needs M06 data)
T6.1 → T6.2 ────────────────┤
T7.1 … T7.5 ────────────────┤
T8.1 → T9.1 → T9.2 → T9.3 ──┤
T10.1 → T10.2 → T10.3 → T11.1 → T12.1 → T12.2
```

Critical path for a first "it looks like Tacet" build: T0.1, T0.2, T1.2, T2.1, T2.2, T3.1, T4.1, T8.1 (about 6 to 8 engineer-days).

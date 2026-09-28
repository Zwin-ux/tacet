# Margin design guide

Status: authoritative overhaul guide, v1, 2026-09-24, **with the v2 amendments below (2026-09-27), which win over any section they name.** Owner: margin/design.

## v2 amendments (2026-09-27, owner direction + coordinator rulings)

Sources: owner messages 2026-09-27, [REFERENCES-V2.md](REFERENCES-V2.md), [ANIMATION-GATE.md](ANIMATION-GATE.md), [UI-KIT.md](UI-KIT.md), [FIRST-BOOT.md](FIRST-BOOT.md), [motion/MOTION.md](motion/MOTION.md), [../SHIP-PLAN.md](../SHIP-PLAN.md).

| # | Amends | Rule now |
| --- | --- | --- |
| A1 | Whole guide | Product = "Notepad with a VS Code feel". No git, no source control, no AI. Must not look like VS Code. |
| A2 | §4.18 footer | **No status bar by default.** Window = title bar + page. Save state = dirty dot beside the document title; "Saved"/"Edited" on title hover/focus. A status line is an opt-in Extra (first boot or Settings). |
| A3 | §4.5 mode control | No centered segmented control. Left-aligned document title; a quiet `Write ▾` menu at the title bar's right (REFERENCES-V2 C3). |
| A4 | §4.7 shelf | Shelf closed at launch. Top rows `New note  Ctrl+N` and `Search  Ctrl+P` (no bordered field); Drafts / Recent / Folders; no icons on Drafts and Recent rows; section controls on hover/focus only. Opening the shelf never moves the page text (column stays anchored). |
| A5 | §2.3 type | UI body 14/20; nothing below 12 px regular; small titles 14 semibold. |
| A6 | §4.10, §4.31 | modernUI and shadows off: no floating cards, gaps or shadows on docked regions. Ignore cited contrib/modernUI paths. |
| A7 | §4.28 first run | **There is a first boot**: 4 short steps (look; import VS Code settings and shortcuts; where notes live; Extras, all off), Enter continues, Esc skips, no sign-in. React webview with Animate UI (FIRST-BOOT.md). |
| A8 | §2.7 motion, §4.19 palette | Every motion passes ANIMATION-GATE.md. Command palette, quick open, find: **instant** (no 160 ms). Focus ring: instant. Notice height: no animation. Animate UI components per UI-KIT.md. |
| A9 | §4.23 dialogs | Unsaved changes on close uses the **native Windows dialog**. |
| A10 | UI-KIT reading progress | Dropped. No always-visible reading-progress line. |
| A11 | .md opening | A `.md` opens in the rich editor (Write) by default; `.txt` in the plain editor, no line numbers. Line numbers only in Code view when the Extra is on. |
| A12 | Links (§4.12, §4.14) | Only http, https and mailto open; the destination is shown first. Relative links and images resolve from the file folder; remote images blocked until allowed. |
| A13 | Downloaded files | A `.md` with Mark of the Web opens in Read. |
| A14 | §4.7 shelf | Add a Pinned section above Drafts. Missing recent files stay listed with Locate / Remove. |
| A15 | File-state notices | With no status bar, a quiet notice appears only for non-UTF-8 encoding or unusual line endings; the full path lives in the title menu. |
| A16 | Source view | Always reachable for `.md` (Write ▾ → Code + shortcut); never an opt-in Extra. |
Scope: every surface of the Code OSS 1.139.0 workbench that a Margin user can see.
Companions: [tokens.json](tokens.json) (values), [theme/](theme/) (generated color themes), [css/md-theme-margin.css](css/md-theme-margin.css) (document typography), [icons/](icons/) (product icons), [assets/README.md](assets/README.md) (mockups, app icon, rejection log), [IMPLEMENTATION-MAP.md](IMPLEMENTATION-MAP.md) (engineering order).

Precedence: [docs/02-DOCUMENT-CONTRACT.md](../docs/02-DOCUMENT-CONTRACT.md) behavior beats everything here. This guide beats [docs/04-DESIGN-SYSTEM.md](../docs/04-DESIGN-SYSTEM.md) where they differ; §12 lists every change to 04. Written numbers beat the mockups; §11 lists what each mockup gets wrong.

---

## 1. The feeling

**Margin should feel like a clean sheet of paper that knows how to be a program.**

Open it and you see a white page, a blue caret, and nothing asking for your attention. Nothing in the chrome is louder than the first word you type. When you need more (a folder, a terminal, a diff), it arrives calmly and leaves when you are done, and the page never stops looking like the page.

Three words, in priority order: **Quiet. Exact. Trustworthy.**

- *Quiet* is the Apple part: restraint, whitespace, one accent, one typeface family, and no ornament that does not do a job.
- *Exact* is the text-tool part: characters sit where you expect, the caret is sharp, selection is honest, and the source is always one keystroke away.
- *Trustworthy* is the Windows part: real title bar behavior, real dialogs, real file locations, and no hidden state.

### 1.1 What "white, iconic, Apple-quality" means for a text tool on Windows 11

These are commitments, not moods. Each one is testable.

1. **White is the material, not the absence of design.** The page is `#FFFFFF`. The only other surface in writing mode is the shell tray, `#F6F7F9`, 3.5% darker. There is no third grey. If a screen needs a third grey to work, the layout is wrong.
2. **Iconic means one recognizable gesture, repeated.** The gesture is the margin: a single blue vertical line. It appears in the app icon (inset rule), the caret (2px blue), the blockquote (2px rule), the active outline item (2px bar), the focus ring (2px), and the selected shelf row's text color. Nothing else is blue. When blue appears, it means *here*.
3. **Apple quality means the details that nobody lists are finished:** optical sizes (Segoe UI Variable Display at 24px and up, Text below), tracking that tightens as type grows, balanced heading wraps, a checkbox tick drawn with the same stroke as the icons, a caret that fades instead of blinking hard, overlays that arrive in 160ms and leave faster, and hairlines that exist only where two surfaces meet.
4. **Windows-native means we never pretend to be a Mac.** Caption buttons are Windows caption buttons (46px wide, right side, snap layouts on hover of Maximize). The title bar double-clicks to maximize, Alt+Space opens the system menu, dialogs are native, the font is Segoe UI Variable, focus rings follow Windows keyboard cues, and Contrast Themes win over our palette.
5. **Chrome earns its pixels by being used.** Every always-visible control must be used in more than half of sessions (New, Open Documents, Write/Read/Code, the shelf toggle, save state). Everything else lives in the overflow (…), the command palette, the context menu, or the Alt menu.

### 1.2 What we take from each reference

| Reference | What we take | What we leave |
| --- | --- | --- |
| **Apple Notes** (macOS 14/15) | Full-height sidebar as a quiet tray; the list row as title plus at most one secondary line; the note opens straight into a caret; the "title is the first line" feeling (we show the first H1 in the shelf, the filename in the title bar). | Yellow accent, folder counts on every row, the gallery view, iCloud. |
| **TextEdit** | The promise that a text file stays a text file. Plain `.txt` shows no formatting UI. Open, type, save, done. | The ruler and format bar at the top. |
| **Pages** | The unified toolbar: title and document controls share one row with the window chrome. The document title menu: click the title to see name and location, rename, and show in Explorer. The centered mode control. | The inspector sidebar, templates, the gray canvas around a floating page. |
| **iA Writer** | Measure discipline (a 64 to 72 character column), the focus on typography as the product, hiding Markdown markers until the caret is on them, a blue caret. | The typeface itself (it would make Margin read as an iA clone), Focus Mode dimming, the monospaced default. |
| **Bear** | Markdown as a live, lightly revealed syntax; restrained color for markers; a delightful but tiny task checkbox. | Tags as navigation, the red accent, the three-pane layout by default. |
| **Things 3** | Checkbox craft (rounded square, confident tick, a completed item dims instead of being struck through); motion that confirms without performing; generous row height. | Magic Plus button, checklist animations longer than 200ms, areas and projects. |
| **Windows 11 Fluent** | Segoe UI Variable with optical sizes, caption-button metrics, the 4px grid, control radius 4 and overlay radius 8, the toggle-switch control, focus visuals, Contrast Themes, reduced-motion and transparency settings, snap layouts. | Mica (see §2.9), acrylic menus, the navigation-view hamburger, accent color derived from wallpaper. |
| **Windows 11 Notepad** | Proof that a white page, a slim title bar, and a small status line are a complete product; the "Saved" and line/column footer vocabulary. | Tabs in the title bar by default (Margin is one document per view, tabs optional), the Copilot button. |

### 1.3 Principles

These specialize the upstream design philosophy (Calm, Focused, Consistent, Delightful; [.github/skills/design-philosophy](../../.github/skills/design-philosophy/SKILL.md)) for a document tool. Use them in reviews in the same order: feeling, principle, move.

| # | Principle | Ask | Upstream value |
| --- | --- | --- | --- |
| M1 | **The page leads.** | Is anything on screen more prominent than the first line of the document? | Focused |
| M2 | **Material follows region.** | Does each strip (title bar, footer) take the color of the region it sits above or below, so the page reads as one sheet and the shelf as one tray? | Calm, Consistent |
| M3 | **Modes change affordances, never layout.** | When I switch Write, Read, Code (or open the shelf), does any character of text move that did not have to? | Focused |
| M4 | **Blue means here.** | Is blue used for anything other than caret, focus, selection, link, checked state, or active location? | Consistent |
| M5 | **Honest state, stable place.** | Is save/read-only/error state in the same place, at the same width, every time, in words? | Calm |
| M6 | **One stroke, two weights, three surfaces.** | 1px lines, 400/600 type, canvas/shell/raised. Anything else needs a written reason. | Consistent |
| M7 | **Reveal on intent.** | Is any control showing a fill, border, or badge while nothing is happening? | Calm |
| M8 | **Motion only confirms, orients, or smooths a jump.** | What job is this animation doing? If none, cut it. | Delightful |
| M9 | **The same file looks like the same file.** | Is a note recognizable across Write, Read, Code, the shelf, the palette, and the taskbar? | Consistent |

### 1.4 The slop list (reject on sight)

Gradients in UI; glow; drop shadows on docked panels; floating cards on a grey dashboard; pills and chips for status; badges with counts in the writing layout; sparkles or any AI glyph; avatars or account slots; empty-state illustrations; motivational copy; Title Case Marketing Headlines inside the app; tiny uppercase grey labels; hamburger menus; macOS traffic lights; skeleton shimmer; bounce; text that is lighter than 4.5:1 when it carries information; a second accent color; icons without labels when a word fits.

---

## 2. The system

All values live in [tokens.json](tokens.json). This section explains roles. In CSS, use the `--vscode-*` theme variables and size tokens listed per element in §4. Hex values below are Margin Light unless noted.

### 2.1 Surfaces and color roles

| Role | Light | Dark | Used for |
| --- | --- | --- | --- |
| canvas | `#FFFFFF` | `#1B1C1F` | The page: editor, title bar above the page, footer below the page, panel, overlays. |
| shell | `#F6F7F9` | `#222428` | The tray: shelf, title-bar and footer segments that sit over and under the shelf. |
| sunken | `#F2F4F7` | `#26282C` | Inset content on canvas: code, segmented-control track, keycaps, secondary buttons. |
| raised | `#FFFFFF` | `#2A2C31` | Overlays. In light, elevation comes from edge and shadow; in dark, from a lighter surface. |
| hover (canvas / shell) | `#F2F4F7` / `#ECEEF2` | `#27292E` / `#2C2F34` | Pointer hover fills. |
| pressed | `#E6E9EE` | `#34373D` | Pointer-down fill. |
| ink | `#22252B` 15.4:1 | `#E7E9EC` 14.0:1 | Text, headings. |
| ink2 (secondary) | `#596272` 6.2:1 | `#A2A9B4` 7.2:1 | Labels, metadata, icons, footer. |
| ink3 (tertiary) | `#676F7C` 5.1:1 | `#8B929D` 5.4:1 | Placeholder, comments, markers, URLs. |
| quiet | `#8A94A3` 3.1:1 | `#6B7380` | Inactive line numbers, whitespace glyphs. Incidental only. |
| accent | `#2167D5` 5.3:1 | `#6EA6FF` 7.0:1 | Caret, focus ring, link, checked box, active indicator, primary button fill (dark uses `#2F6FD8` for fills). |
| tint | `#E3ECFB` | `#24324A` | Selected row. Text on tint: `#1A58BA` / `#9CC2FF`. |
| selection | `#CCDEFB` | `#2B4C7E` | Text selection. Ink keeps its color. |
| rule | `#BCD3F6` | `#34507A` | Blockquote rule. |
| hairline | `#E6E9EE` | `#2E3136` | The one line between two regions. |
| control edge | `#8A94A3` 3.07:1 | `#6B7380` 3.56:1 | Boundaries that identify a control (checkbox, unfocused text field in forms). |
| find match | `#FFD66B` / other `#FFF0C2` | `#8A6A1F` / `#4A3D1C` | Warm, because blue already means selection. |
| warning | surface `#FFF8E8`, ink `#7A5313` | `#2E2718`, `#E9C77A` | Recoverable file notices. |
| danger | `#B42A33` | `#FF8A80` | Errors and destructive words. Never decorative. |
| success | `#1E7A4C` | `#8FD19E` | Diff insertions and Git added. **Never for "Saved".** Saved is not an achievement. |

### 2.2 Material follows region (M2)

The workbench has four horizontal bands (title bar, parts, panel, status bar) and one vertical split (shelf | page). Upstream paints the title bar and status bar as single full-width strips. Margin splits them at the shelf edge:

```
┌──────────── shell ─────────────┬───────────────── canvas ──────────────────────────┐
│ ▯ mark   ◫ shelf toggle         │ A quieter morning.md  Notes   [Write|Read|Code]  … │ ─ □ ✕
├─────────────────────────────────┤                                                    │
│ ⌕ Find a file          Ctrl+P   │          A quieter morning                         │
│ Drafts                          │          Leave the phone in the kitchen…           │
│ ▯ A quieter morning   (tint)    │                                                    │
│ ▯ Ideas for the weekend         │          For Saturday                              │
│ Recent                          │          ☑ Walk to the bakery                      │
│ ▯ Kitchen notes.txt             │          ☐ Read the essay Maya sent                │
│ Folders                         │                                                    │
│ ▭ Weekend project               │                                                    │
│                                 │          Edited                 126 words · 1 min  │
└──────────── shell ─────────────┴───────────────── canvas ──────────────────────────┘
          ▲ one 1px hairline, full height, is the only line in the window
```

Implementation: the title bar and status bar receive a CSS variable `--margin-shelf-width` from the layout (0 when hidden) and paint `linear-gradient(to right, var(--vscode-sideBar-background) var(--margin-shelf-width), var(--vscode-titleBar-activeBackground) 0)`. Fallback, if that patch is not accepted: title bar and footer both use `titleBar.activeBackground = canvas` and the shelf starts below the title bar; this is Notepad-correct and still calm. See IMPLEMENTATION-MAP T2.3.

When the shelf is closed the window is one continuous white sheet: no line under the title bar, no line above the footer. A 1px hairline appears under the title bar only while the document is scrolled (scroll shadow, `reveal on intent`).

### 2.3 Typography

Three families, two weights (400, 600), two optical sizes of one system face. Full decision and licenses in §9.

| Role | Face | Size / line | Weight | Tracking | Where |
| --- | --- | --- | --- | --- | --- |
| Page title | Segoe UI Variable Display | 24 / 32 | 600 | -0.012em | Settings page heading, recovery surface title |
| Dialog title | Segoe UI Variable Display | 18 / 24 | 600 | -0.006em | Dialogs |
| Title | Segoe UI Variable Text | 13 / 18 | 600 | 0 | Document title in title bar, setting labels, result titles |
| Body | Segoe UI Variable Text | 13 / 20 | 400 | 0 | Shelf rows, menus, palette rows, buttons, tree |
| Label | Segoe UI Variable Small | 12 / 16 | 400 (600 for section labels) | 0 | Footer, section labels, descriptions, hints, breadcrumbs |
| Caption | Segoe UI Variable Small | 11 / 14 | 400 | +0.01em | Keycaps and badges only |
| Document | see §5 | 17 / 28 base | 400/600 | per level | Write and Read |
| Code | Cascadia Code | 14 / 22 | 400 | 0 | Code view, fences |
| Terminal | Cascadia Code | 13 / 1.4 | 400 | 0 | Terminal |

Rules: sentence case everywhere inside the app (menus included; this reconciles the upstream conflict in favor of sentence case for Margin-owned surfaces and keeps title case only in unmodified upstream command titles until a sweep lands); no uppercase labels; no size below 11px; numbers in footer and tables use `tabular-nums`.

### 2.4 Spacing, grid and sizes

Spacing ramp: 2, 4, 6, 8, 10, 12, 16, 20, 24, 28, 32, 36, 40 (upstream `--vscode-spacing-*`), plus document insets 48, 56, 64. Off-ramp values are bugs.

| Size | Value | Notes |
| --- | --- | --- |
| Title bar | 48 | One row: identity, title, mode control, overflow, caption buttons. |
| Caption button | 46 × 48 | Windows metric; via Window Controls Overlay height 48. |
| Status bar (footer) | 28 | Text baseline aligned with the text column. |
| Shelf | 240 default, 200 to 360 | Remembered. |
| Shelf row | 32 | Title only; 44 when a secondary line shows. |
| Tree row (Coding Tools) | 24 | Upstream density. |
| Icon button | 32 × 32 (28 in compact) | 16px glyph. |
| Segmented control | 28 tall, segments 68 wide (52 compact) | Track padding 2. |
| Text column | 680 max (600 / 800 options) | 56 top inset, 96 bottom run-out, 32 min side (24 compact). |
| Palette | 640 wide, top 88 | 48 input row. |

### 2.5 Radius (elevation tiers)

| Tier | Radius | Examples |
| --- | --- | --- |
| xSmall | 2 | Find-match marks, link focus |
| Control | 4 | Buttons, inputs, list rows, segments, checkbox |
| Inner | 6 | Segment track, code block, notice, image, settings search |
| Outer | 8 | Menus, hovers, suggest, find widget, toasts |
| Sheet | 12 | Palette (quick input), dialogs |
| Window | 8 | Drawn by Windows DWM. Never by CSS. |
| Circle | full | Toggle switch, radio |

### 2.6 Elevation

Level 0 for everything docked. Level 1 (`0 1px 2px`) only for the selected segment and toggle knob. Level 2 (`0 4px 12px`, `0 1px 3px`) for menus, hovers, suggest, find, toasts. Level 3 (`0 16px 48px`, `0 2px 8px`) for the palette and dialogs. Shadow color is ink-blue `#1D2A3D` at 6 to 12% in light, black at 40 to 65% in dark. `widget.shadow` carries the single-color fallback.

### 2.7 Motion

| Name | Duration | Easing | Use |
| --- | --- | --- | --- |
| instant | 0 | none | Pointer-down fill, caret placement, mode switch, file open. |
| quick | 100ms | standard `(0.2,0,0,1)` | Hover color/fill, focus ring appearance. |
| base | 160ms | enter `(0,0,0,1)` | Overlay fade + 4px rise; toast; segment thumb slide (spring `(0.32,0.72,0,1)`). |
| gentle | 240ms | spring | Shelf open/close width. The text column recenters with the available width; text does not reflow (column width is capped, so only its position moves). |
| exit | 70% of enter | exit `(0.3,0,1,1)` | Anything leaving; opacity only. |

The caret uses `editor.cursorBlinking: "phase"` (a soft fade, 1060ms cycle) and `editor.cursorSmoothCaretAnimation: "explicit"` (glides only for jumps you asked for, never while typing). `workbench.reduceMotion` and `prefers-reduced-motion` remove all movement; color and opacity changes remain at 0 to 80ms.

### 2.8 Focus

Keyboard focus only (`:focus-visible`), 2px accent ring, 2px offset, following the element's radius. In lists and trees the focused row uses an inset 1px `list.focusOutline` in HC only; in standard themes the focused row is the tint fill, and keyboard focus inside a non-focused selection shows the ring. The document editor never shows a ring around itself; the caret is its focus indicator.

### 2.9 Why no Mica

Mica would make the shell tray tint with the wallpaper. It is native and pretty, but it breaks M2 (the tray color would no longer match the footer and title segments painted by CSS), it requires transparent workbench backgrounds that upstream does not support, it varies per user so screenshots and contrast cannot be verified, and it costs GPU on the 16 GB target. Margin ships a static shell. Revisit only if upstream adds first-class `backgroundMaterial` support.

### 2.10 Words

UI copy follows the product voice in [01-PRODUCT](../docs/01-PRODUCT.md) and ASD-STE100 discipline: short, literal, present tense, no jargon, no metaphors, never narrate what is visible. Examples: `Saved`, `Edited`, `Saved in Drafts`, `Read only`, `This file changed outside Margin.`, `Couldn't save to this folder.` Buttons are verbs: `Save a Copy`, `Compare Changes`, `Keep Both`, `Use File on Disk`. Never: "Oops", "Awesome", "Let's", "Magic", "Smart".

---

## 3. Layouts

### 3.1 Writing layout (default)

- Title bar 48, custom, command center off, layout controls off, menu bar hidden until Alt (`window.menuBarVisibility: "toggle"`: Alt reveals the File/Edit/View row inside the title bar; never `"compact"`, which turns it into a hamburger).
- Activity bar hidden (`workbench.activityBar.location: "hidden"`).
- Side bar = the **shelf** (Margin view container: Drafts, Recent Files, Folders, On This Page).
- Editor: one group, no tabs (`workbench.editor.showTabs: "none"`), no breadcrumbs, no minimap, no line numbers, no glyph margin, no folding gutter in Write/Read.
- Panel closed. Status bar = the **footer**.

### 3.2 Coding Tools layout (explicit toggle)

- Activity bar moves to the top of the shelf (`workbench.activityBar.location: "top"`), four icons: Files, Search, Source Control, Run. Extensions icon removed (reviewed built-ins only).
- Tabs: `single` by default (the title bar already names the file); users can choose `multiple`.
- Line numbers, folding, bracket guides on in Code. Minimap stays off (M1: the page leads; the overview ruler carries markers).
- Panel available (terminal, problems, output, debug console). Footer gains Ln/Col, indentation, encoding, EOL, language, branch.
- Turning Coding Tools off restores 3.1 without killing terminals.

### 3.3 Width breakpoints (CSS px, at 100% zoom)

| Width | Changes |
| --- | --- |
| ≥ 1200 | Everything at default. Shelf may stay open beside a full 680 column. |
| 960 to 1199 | On This Page collapses into the shelf's lower section (never a right column). |
| 720 to 959 | Shelf becomes an overlay (Level 2, 240 wide) when opened; document keeps full width. Title bar hides the folder name after the filename. |
| 600 to 719 | Segments shrink to 52 wide; overflow gathers New/Open. |
| 480 to 599 | Compact: text inset 24, H1 28/36, footer keeps state (left) and one metric (right). Mode control remains visible. Title truncates first, then the mark hides. |
| < 480 | Not supported as a layout; window minimum is 480 × 360. |

---

## 4. Element-by-element inventory

Format for every element: **Target** (what it is and why), **Tokens**, **Size & spacing**, **Radius**, **Motion**, **States**, **Maps to** (theme keys, CSS files, settings, code). Paths are relative to the repo root. "Theme" means the generated Margin themes in [theme/](theme/).

### 4.1 Window frame

- **Target:** a standard Windows 11 window. Rounded corners and the 1px frame are drawn by DWM. Minimum 480 × 360.
- **Tokens:** `window.activeBorder` `#D5DAE1`, `window.inactiveBorder` `#E1E5EA` (used only when Windows draws no frame).
- **Size:** min 480 × 360 logical px.
- **Radius:** window (DWM). CSS draws none.
- **Motion:** none (OS).
- **States:** active / inactive. Inactive dims title text to ink2; nothing else changes (the page stays white; we do not grey out the user's document).
- **Maps to:** `src/vs/platform/windows/electron-main/windows.ts` (min size, `titleBarOverlay`), `window.titleBarStyle: "custom"`, theme `window.*`.

### 4.2 Title bar

- **Target:** Pages-style unified toolbar: `[mark] [shelf toggle] | [document title ▾] [folder]   [Write|Read|Code]   [New] [… overflow] [caption buttons]`. One row, 48 tall, no border. Double-click empty area maximizes; drag anywhere empty; Alt+Space works.
- **Tokens:** background `titleBar.activeBackground` = canvas (split per §2.2), foreground `titleBar.activeForeground` = ink, inactive `titleBar.inactiveForeground` = ink2, `titleBar.border` = transparent (HC: contrastBorder).
- **Size & spacing:** padding-left 12; mark 16 at x=16; shelf toggle 32 × 32 at 8 after mark; title starts at shelf width + 16 when shelf open, else 16 after toggle; mode control centered on the *document area*, not the window; right group gap 4; caption buttons 3 × 46.
- **Radius:** icon buttons control (4).
- **Motion:** hover fill quick (100ms). When the shelf opens, the title group slides with the shelf edge at gentle.
- **States:** hover `toolbar.hoverBackground`; pressed `toolbar.activeBackground`; focus ring; inactive window ink2. Scroll state: 1px hairline appears under the canvas segment when the editor scrollTop > 0 (scroll shadow).
- **Document title button:** filename 13/18 semibold ink, then folder name 13/18 regular ink2 (`Notes`), or `Draft` for drafts. Click opens the **title menu** (Level 2 popover, 320 wide): editable name field, location path with `Show in File Explorer`, `Move…`, `Save As…`, `Open Documents` list, `Version History`. Dirty state: a 6px ink2 dot after the filename (not a color change, not italic). Read-only file: `lock` glyph 12px after the name.
- **Maps to:** `src/vs/workbench/browser/parts/titlebar/titlebarPart.ts` (height, center slot), `titlebarpart.css`, `commandCenterControl.ts` (replaced by `MarginTitleControl` in the command-center slot), `src/vs/platform/window/common/window.ts` `DEFAULT_CUSTOM_TITLEBAR_HEIGHT` (35 → 48 for Margin), `windows.ts` `titleBarOverlay.height` (29 → 48), `window.title: "${dirty}${activeEditorShort}${separator}Margin"` for the taskbar, `window.commandCenter: false`, `workbench.layoutControl.enabled: false`.

### 4.3 Windows caption controls

- **Target:** native Windows Control Overlay buttons (minimize, maximize/restore with Snap Layouts flyout, close). Never drawn in HTML.
- **Tokens:** overlay color = title bar canvas; symbol color = ink (`#22252B`) light, `#E7E9EC` dark. Close hover is Windows red (system), not ours.
- **Size:** 46 × 48.
- **States:** OS-owned.
- **Maps to:** `windows.ts` `titleBarOverlay { color, symbolColor, height: 48 }`; `src/vs/platform/theme/electron-main/themeMainServiceImpl.ts` overlay colors from theme; `window.controlsStyle: "native"`.

### 4.4 Command center (replaced)

- **Target:** the upstream search box in the title bar is removed. Its slot hosts the document title button (§4.2). Ctrl+P and Ctrl+Shift+P keep working. Rationale: M1, and "giant command box" is on the product's no list.
- **Tokens:** `commandCenter.*` set transparent at rest, `hoverCanvas` on hover, so if it is re-enabled by a user it is quiet.
- **Maps to:** `window.commandCenter: false` default; `commandCenterControl.ts` untouched; new `MarginTitleControl` contribution.

### 4.5 Mode control (Write | Read | Code)

- **Target:** a segmented control, the only control centered in the title bar. Words, not icons. Code-only files show a single static `Code` label (not a disabled Write/Read pair). `.txt` shows Write and Read (literal) plus Code.
- **Tokens:** track `sunken` (`#F2F4F7`; dark `#2A2C31`), selected thumb `canvas` with 1px `controlQuiet` (`#D9DDE3`) edge and elevation 1; selected label ink 600, other labels ink2 400 (weights swap without width change: segments are fixed width).
- **Size:** 28 tall; track padding 2; thumb 24 tall; segment 68 wide (52 compact); label 13/18.
- **Radius:** track inner (6); thumb control (4).
- **Motion:** thumb slides between segments, base 160ms spring; labels never move. Reduced motion: thumb jumps.
- **States:** hover on unselected segment: label ink; pressed: track `pressed` under the segment; focus: ring around the whole control, arrow keys move selection (roving tabindex), `aria-pressed`; disabled segment (Write on a read-only file): label `disabledForeground` plus tooltip `This file is read-only.`
- **Maps to:** new `src/vs/workbench/contrib/margin/browser/modeControl.ts` rendered into the title bar center; commands `margin.mode.write|read|code` (Ctrl+Alt+1/2/3); CSS `src/vs/workbench/contrib/margin/browser/media/modeControl.css`.

### 4.6 Activity bar (replaced)

- **Target:** hidden in writing. In Coding Tools it becomes a top row inside the shelf: four 16px icons, 32 × 32 targets, 8 gap, active item ink with a 2px accent underline (the margin line turned sideways), inactive ink2. No badges except a single 6px accent dot on Source Control when there are changes (no numbers).
- **Tokens:** `activityBarTop.foreground` ink, `activityBarTop.inactiveForeground` ink2, `activityBarTop.activeBorder` accent, `activityBarBadge.*` (dot only).
- **Radius:** control (4) on hover fill.
- **Motion:** underline slides quick.
- **Maps to:** `workbench.activityBar.location: "hidden" | "top"` switched by the Coding Tools command; `src/vs/workbench/browser/parts/activitybar/media/activityaction.css` (badge → dot), `paneCompositeBar.ts` for the pinned set (Explorer, Search, SCM, Run and Debug; unpin Extensions, Testing, Remote, Accounts).

### 4.7 Shelf (side bar)

- **Target:** a tray, not a dashboard. Top to bottom: find field; sections **Drafts**, **Recent Files**, **Folders**; optional **On This Page**. Empty sections vanish. No section header chevrons in writing layout (sections are always expanded; On This Page collapses by toggle).
- **Tokens:** `sideBar.background` shell, `sideBar.foreground` ink, `sideBar.border` hairline, `sideBarSectionHeader.foreground` ink2, `sideBarSectionHeader.background/border` transparent.
- **Size & spacing:** padding 8 horizontal; find field 32 tall at top 8; section label 12/16 semibold ink2, margin 20 above, 4 below, indent 12; rows 32 (44 with secondary line), row padding 0 12, icon 16, gap 10 icon-to-text.
- **Radius:** rows control (4); find field inner (6).
- **Motion:** open/close width gentle; rows do not animate in.
- **States (row):** rest transparent; hover `list.hoverBackground` hoverOnShell; selected `list.activeSelectionBackground` tint + text/icon `#1A58BA`; selected but shelf unfocused `list.inactiveSelectionBackground` `#E9ECF1` + ink; focus (keyboard) ring inset 1px accent (HC outline); drag target `list.dropBackground`. Missing file: title in ink3 plus `Locate` and `Remove` inline text buttons (never color alone). Dirty: 6px ink2 dot at row end. Max one hover action (`…`), revealed on hover or focus.
- **Row content:** Drafts show the first heading or first line (display title). Files show the display title and, if it differs from the filename, the filename as a 12px ink2 second line. Two identical titles always show their parent folder as the second line.
- **Maps to:** new built-in view container `margin.shelf` in `extensions/margin/` (tree views: `margin.drafts`, `margin.recent`, `margin.folders`, `margin.outline`) or a workbench contribution `src/vs/workbench/contrib/margin/browser/shelf/*`; CSS `src/vs/workbench/browser/parts/sidebar/media/sidebarpart.css`, `src/vs/workbench/browser/parts/views/media/paneviewlet.css` (headers), `src/vs/base/browser/ui/list/list.css`; `workbench.tree.indent: 12`, `workbench.tree.renderIndentGuides: "none"` in writing.

### 4.8 Explorer tree (Coding Tools)

- **Target:** the upstream Explorer, restyled to match the shelf: monochrome file icons (Margin file icon theme, §10.4), 24 rows, indent 12, indent guides on hover only, twisties chevron-right/down 12px compact.
- **Tokens:** as shelf; `tree.indentGuidesStroke` hairline; `gitDecoration.*` (added success, modified `#1A58BA`, deleted danger, untracked success, ignored ink3, conflict warningInk).
- **Size:** row 24; icon 16; twistie 12 in a 16 box.
- **States:** as shelf rows; cut/compressed folder `list.deemphasizedForeground`.
- **Maps to:** `src/vs/workbench/contrib/files/browser/media/explorerviewlet.css`, `workbench.iconTheme: "margin-files"`, `explorer.compactFolders: true`, `explorer.decorations.badges: false` (color only plus letter in tooltip; badges are noise in M1).

### 4.9 Recents and drafts "shelf" semantics

- Drafts: unsaved notes with durable local identity. Row icon `note-draft` (dashed page). Right-click: `Save As…`, `Rename`, `Copy Text`, `Discard Draft…` (confirm dialog, preserves by default).
- Recent Files: most recent first, max 12 visible, `Show All` at the end. Right-click: `Show in File Explorer`, `Copy Path`, `Remove from Recent`. No delete.
- Folders: explicitly opened folders. Selecting one reveals its tree inline (indent 12) in writing layout, capped at 200 visible items with `Open in Coding Tools` beyond that.
- **Maps to:** `IWorkspacesService.getRecentlyOpened()`, working-copy backup for drafts (docs/05 §5), context menus via `MenuId` contributions.

### 4.10 Editor tabs

- **Target:** off in writing (`showTabs: "none"`). When enabled: Modern UI pill tabs, 32 tall, label 13 regular ink2, active tab ink **400** (not 600: weight changes cause width jumps) on a `sunken` fill, close button revealed on hover/active only, dirty dot replaces close at rest.
- **Tokens:** `tab.*`, `modernEditorTab.*`, `editorGroupHeader.tabsBackground` canvas (no strip fill).
- **Radius:** control (4).
- **Maps to:** `workbench.experimental.modernUI: true` with `workbench.experimental.modernUIEditorTabStyle: "pill"`, `window.density.editorTabHeight: "compact"` (32), `src/vs/workbench/browser/parts/editor/media/multieditortabscontrol.css`, `src/vs/workbench/contrib/modernUI/browser/media/tabs.css`.

### 4.11 Breadcrumbs

- **Target:** off in writing (the title bar says where you are). In Code for folder files: on, 22 tall, 12/16 ink2, separators `chevron-right` 12px quiet, current item ink.
- **Tokens:** `breadcrumb.*`.
- **Maps to:** `breadcrumbs.enabled` per layout, `src/vs/workbench/browser/parts/editor/media/breadcrumbscontrol.css`.

### 4.12 Editor surface: Write (rich Markdown)

- **Target:** the upstream rich Markdown editor (`@vscode/markdown-editor`) with the Margin document theme. One column, left-aligned text inside a centered measure. Markers (`#`, `**`, `` ` ``, `>`, `-`, `|`) appear only on the block that holds the caret, in ink3, and never shift the text horizontally (heading `#` markers hang into the left margin).
- **Tokens:** `editor.background` canvas, `editor.foreground` ink, `editorCursor.foreground` accent, `editor.selectionBackground` `#CCDEFB`, `editor.inactiveSelectionBackground` `#E4E9F0`, `textLink.foreground`, `textBlockQuote.border`, `textCodeBlock.background`, `textSeparator.foreground`, `checkbox.*`.
- **Size & spacing:** measure 680 (setting `margin.document.lineWidth`: 600 / 680 / 800), top inset 56, bottom run-out 96, side minimum 32. Typography per §5.
- **Caret:** 2px wide (`editor.cursorWidth: 2` equivalent: `--md-cursor-background` accent), height = line box minus 4px, phase blink.
- **Selection:** `#CCDEFB`, rounded 2px ends by the editor; unfocused `#E4E9F0`.
- **Active block:** no background box (`--md-block-active-background: transparent`). The reveal of markers is the only cue.
- **Placeholder:** `Start writing.` 17/28 ink3 on the first empty line of an empty draft only.
- **States:** Read (see §4.14); disabled (file too large): never shown, route to notice §4.24.
- **Maps to:** `extensions/markdown-language-features/markdown-editor-src/editor.ts` (`classNames: ['md-theme-margin']`), new `mdThemeMargin.css` from [css/md-theme-margin.css](css/md-theme-margin.css), `markdownEditor.css`; custom editor id `vscode.markdown.editor` default for `*.md` via `workbench.editorAssociations`.

### 4.13 Editor surface: Code (Monaco) and literal text

- **Target:** exact source with calm chrome. Code: line numbers quiet, active line number ink2, no current-line highlight fill, no minimap, overview ruler 10px with no border, folding controls on hover, bracket guides active-only, indent guides hairline. Literal `.txt` (Write/Read) is Monaco with prose settings: Segoe UI Variable Text 17/28, wrap at the 680 measure (`editor.wordWrap: "bounded"`, `wordWrapColumn` computed from measure), centered (`workbench.editor.centeredLayoutFixedWidth` + centered layout), no line numbers, `editor.padding.top: 56`.
- **Tokens:** `editor.*`, `editorLineNumber.foreground` quiet `#8A94A3`, `editorLineNumber.activeForeground` ink2, `editor.lineHighlightBackground` transparent, `editorIndentGuide.background` hairline, `editorWhitespace.foreground` quiet 60%, `editorRuler.foreground` hairline, syntax per §6.
- **Size:** Cascadia Code 14/22; gutter left padding 16; `editor.padding.top: 16` in Code.
- **Settings (Code):** `editor.fontFamily: "'Cascadia Code', 'Cascadia Mono', Consolas, monospace"`, `editor.fontSize: 14`, `editor.lineHeight: 22`, `editor.fontLigatures: false`, `editor.minimap.enabled: false`, `editor.renderLineHighlight: "gutter"`, `editor.cursorBlinking: "phase"`, `editor.cursorSmoothCaretAnimation: "explicit"`, `editor.cursorWidth: 2`, `editor.guides.bracketPairs: "active"`, `editor.showFoldingControls: "mouseover"`, `editor.stickyScroll.enabled: false` (writing) / `true` (Coding Tools), `editor.occurrencesHighlight: "singleFile"`, `editor.renderWhitespace: "selection"`, `editor.scrollbar.verticalScrollbarSize: 10`, `editor.overviewRulerBorder: false`, `editor.hideCursorInOverviewRuler: true`, `editor.lightbulb.enabled: "off"` in `.md`/`.txt`, `editor.inlineSuggest.enabled: false`.
- **Maps to:** `src/vs/editor/browser/viewParts/viewCursors/viewCursors.css`, `src/vs/editor/browser/viewParts/lineNumbers/lineNumbers.css`, configuration defaults (§ IMPLEMENTATION-MAP T3).

### 4.14 Read view

- **Target:** identical metrics to Write (M3). Differences only: no caret, no marker reveal, checkboxes inert and drawn in ink2/ink3 (informative, not greyed), links open on single click, text selectable, find works, replace disabled. Footer shows `Read only` with a 12px lock glyph. Title-bar mode control shows Read selected.
- **Tokens:** same as Write plus `.md-readonly` rules in the theme CSS.
- **Motion:** switching Write↔Read is instant (0ms). Nothing moves.
- **Maps to:** `.md-theme-margin.md-readonly` in [css/md-theme-margin.css](css/md-theme-margin.css); hide upstream `.md-readonly-toggle` (the mode lives in the title bar); per-resource mode state (docs/05 §6).

### 4.15 Find widget (in document)

- **Target:** the familiar compact find, restyled as an overlay: anchored top-right of the document area, 8 below the title bar, 360 wide (grows to 440 with replace). Input 28 tall; option toggles (Aa, ab, .*) 24 × 24 compact icons; count `3 of 12` label 12 ink2 tabular; prev/next, close.
- **Tokens:** `editorWidget.background` raised, `editorWidget.border` overlayEdge, `widget.shadow`, `inputOption.activeBackground` tint + `inputOption.activeForeground` `#1A58BA`, `editor.findMatchBackground` `#FFD66B`, `editor.findMatchHighlightBackground` `#FFF0C2`, `editor.findRangeHighlightBackground`.
- **Radius:** outer (8); input control (4); toggles control (4).
- **Motion:** enter base (fade + 4px down), exit 110ms fade.
- **States:** invalid regex: input border danger + message below `Invalid regular expression.`; no results: count reads `No results` in ink2 (never red); replace hidden in Read.
- **Maps to:** `src/vs/editor/contrib/find/browser/findWidget.css`, `findWidget.ts` (width), rich editor `src/contrib/find/find.css` via `--md-find-*` variables (set in md-theme-margin.css), `editor.find.addExtraSpaceOnTop: false`.

### 4.16 Minimap and gutter

- **Decision:** minimap off everywhere by default. Gutter in Write/Read: none (the rich editor has its own diff gutter; keep `md-gutter-marker-*` as 2px bars in the left margin, colors `editorGutter.*`). Gutter in Code: line numbers, 2px change bars, folding on hover, glyph margin only when breakpoints exist (`editor.glyphMargin: false` until debugging).
- **Maps to:** `editor.minimap.enabled: false`, `editor.glyphMargin` per layout, theme `editorGutter.*`.

### 4.17 Panel and terminal

- **Target:** a white continuation of the page separated by one hairline, never a dark console slab. Header 32: view titles as text tabs (12/16, active ink 600 with 2px accent underline, inactive ink2), actions right (+, trash, …, maximize, close) 28 × 28. Terminal padding 12 left, font Cascadia Code 13, line height 1.4, cursor bar accent, selection `#CCDEFB`.
- **Tokens:** `panel.background` canvas, `panel.border` hairline, `panelTitle.activeBorder` accent, `panelTitle.activeForeground` ink, `panelTitle.inactiveForeground` ink2, `terminal.background` canvas, `terminal.foreground` ink, `terminal.ansi*` (Margin ANSI palette, each ≥ 4.5:1 on canvas), `terminalCursor.foreground` accent, `terminal.selectionBackground`.
- **Size:** default height 240; min 120.
- **Motion:** open/close gentle height; content does not fade.
- **States:** focused terminal: nothing changes except caret blink (no border highlight).
- **Maps to:** `src/vs/workbench/browser/parts/panel/media/panelpart.css`, `src/vs/workbench/contrib/terminal/browser/media/terminal.css`, `terminal.integrated.fontFamily`, `terminal.integrated.fontSize: 13`, `terminal.integrated.lineHeight: 1.4`, `terminal.integrated.cursorStyle: "line"`, `terminal.integrated.cursorWidth: 2`, `terminal.integrated.minimumContrastRatio: 4.5`.

### 4.18 Status bar (document footer)

- **Target:** a quiet footer that reads like the bottom margin of the page. Left, aligned to the text column's left edge in writing: save state, stable width 160 (`Saved`, `Edited`, `Saved in Drafts`, `Saving…`, `Couldn't save`), or `Read only`. Right, aligned to the column's right edge: `126 words · 1 min read` (words, then time; toggled in settings). In Coding Tools: left state; right `Ln 15, Col 1`, `Spaces: 2`, `UTF-8`, `LF`, `Markdown`, branch. Each item is a text button with hover fill; no icons except branch and errors/warnings counts (only in Coding Tools).
- **Tokens:** `statusBar.background` canvas (split per §2.2), `statusBar.foreground` ink2, `statusBar.border` transparent, `statusBarItem.hoverBackground` hoverCanvas, `statusBarItem.errorForeground` danger (text, no fill), `statusBarItem.warningForeground` warningInk, `statusBar.debuggingBackground` canvas + `statusBar.debuggingForeground` warningInk (no orange bar).
- **Size:** 28 tall; item padding 0 8; text 12/16.
- **Radius:** item hover control (4), inset 2 vertically.
- **Motion:** state text crossfades quick; `Saving…` appears only if a save takes > 400ms.
- **States:** save failure is persistent until resolved: danger text `Couldn't save` + the notice in §4.24. Nothing flashes.
- **Maps to:** `src/vs/workbench/browser/parts/statusbar/media/statusbarpart.css`, Margin status items (`margin.status.save`, `margin.status.count`), hide upstream items in writing (notifications bell when empty, language mode, feedback, layout, accounts), `workbench.statusBar.visible: true`.

### 4.19 Quick input and command palette

- **Target:** Ctrl+P file finder and Ctrl+Shift+P commands share one frame: 640 wide, top 88, Level 3, sheet radius 12. Input row 48 (16px search glyph at 16, text 15/20 ink, placeholder ink3 `Find a file` / `Run a command`), divider subtle, scope line 12/16 ink2 (`Searching Drafts, Recent and Weekend project`, clickable `Change`), results, footer hints 36 tall (`↑↓ Navigate  Enter Open  Esc Close`, 12 ink2, keycaps as plain text).
- **Rows:** file rows 52 (two lines: title 13/18 semibold ink with match in `#1A58BA`; context line 12/16 ink2 with the matched word ink semibold; path right-aligned 12 ink2). Command rows 32 (label body + keybinding keycaps right). Group separators: label 12 ink2 + subtle line.
- **Tokens:** `quickInput.background` raised, `quickInput.foreground` ink, `quickInputList.focusBackground` tint, `quickInputList.focusHighlightForeground` `#1A58BA`, `list.highlightForeground`, `pickerGroup.foreground` ink2, `pickerGroup.border` subtle, `keybindingLabel.*` (sunken, ink2, controlQuiet edge), `widget.shadow`.
- **Radius:** frame 12; rows 8 (outer, inset 8 from frame); input none (it is the frame).
- **Motion:** enter base (opacity + 4px rise), exit 110ms; results never animate.
- **States:** empty query shows recent; no match: `No files match "train".` + `Change Scope` button; loading: `Searching…` label in scope line, results stream.
- **Maps to:** `src/vs/platform/quickinput/browser/media/quickInput.css`, `quickInputController.ts` (width 640 via `QuickInputController` layout constants), `workbench.quickOpen.preserveInput: false`, `quickInput` top offset (layout service `quickInputTop`).

### 4.20 Context menus and the Alt menu

- **Target:** Windows-feeling custom menus (not native, so they can follow the theme and HC exactly): Level 2, outer radius 8, 4 padding, rows 28 with 12 left/right padding, label body 13/20, keybinding 12 ink2 right, separators subtle with 4 margins, submenu chevron 12. Max width 320. Destructive items in danger text, always last, separated.
- **Tokens:** `menu.background` raised, `menu.foreground` ink, `menu.selectionBackground` tint, `menu.selectionForeground` `#1A58BA`, `menu.separatorBackground` subtle, `menu.border` overlayEdge, `menubar.selectionBackground`.
- **Motion:** enter 120ms fade (no scale), submenu delay 250ms.
- **Maps to:** `window.menuStyle: "custom"`, `src/vs/base/browser/ui/menu/menu.ts` (inline style constants: padding, row height, radius), `src/vs/workbench/browser/parts/titlebar/media/menubarControl.css`.

### 4.21 Hovers and tooltips

- **Target:** delayed tooltips (600ms, 300ms when moving between items) with plain text 12/16, max width 480, padding 6 10. Rich hovers (Code only): same frame, sections separated by subtle lines, status bar row in shell.
- **Tokens:** `editorHoverWidget.background` raised, `editorHoverWidget.border` overlayEdge, `editorHoverWidget.foreground` ink, `editorHoverWidget.statusBarBackground` shell, `widget.shadow`.
- **Radius:** outer (8).
- **Motion:** fade 100ms.
- **Maps to:** `src/vs/base/browser/ui/hover/hoverWidget.css`, `src/vs/editor/contrib/hover/browser/hover.css`, `workbench.hover.delay: 600`, `editor.hover.delay: 500`.

### 4.22 Notifications and toasts

- **Target:** rare. Toasts bottom-right, 400 wide, 16 from edges, Level 2, outer 8. Row: 16px severity glyph (info accent, warning warningInk, error danger), message 13/20 ink, source hidden, actions as secondary buttons right-aligned, close on hover. Max 3 stacked. Info toasts auto-hide after 6s; warnings and errors persist. File-level problems are never toasts: they are notices (§4.24).
- **Tokens:** `notifications.*`, `notificationToast.border` overlayEdge, `notificationsInfoIcon.foreground` accent, `notificationsWarningIcon.foreground` warningInk, `notificationsErrorIcon.foreground` danger, `notificationLink.foreground` accent.
- **Motion:** enter base (fade + 8px rise), exit 110ms fade.
- **Maps to:** `src/vs/workbench/browser/parts/notifications/media/notificationsToasts.css`, `notificationsList.css`, `notificationsCenter.css`; bell hidden in writing unless unread.

### 4.23 Dialogs

- **Target:** use native Windows dialogs for file open/save/overwrite (`window.dialogStyle: "native"`). Custom in-app dialogs only for Margin decisions (Discard Draft, recovery). Frame 440 wide, Level 3, sheet radius 12, padding 24; title 18/24 Display semibold; body 13/20 ink2; buttons right-aligned, 32 tall, 8 gap; primary is the safe action (focus on it by default).
- **Tokens:** `editorWidget.background`/raised, `button.*` (primary accent fill, white label, hover `#1A58BA`; secondary sunken, ink), scrim `#1D2A3D1F` behind.
- **Maps to:** `src/vs/base/browser/ui/dialog/dialog.css`, `window.dialogStyle: "native"`, `src/vs/base/browser/ui/button/button.css` (radius 4, height 32 in dialogs, 28 elsewhere).

### 4.24 Notices (file state)

- **Target:** the inline notice from S13/S15/S16: sits at the top of the document area, inside the text column width (680) plus 24, 12 below the title bar. Icon 16, sentence 13/20 semibold ink, detail 12/16 ink2, actions as secondary buttons (primary only for the safe default). Warning surface for recoverable; danger ink text on canvas with danger 1px edge for failures.
- **Tokens:** `banner.*` mapped to warningSurface/warningInk; edges `#F0DCAE`.
- **Radius:** inner (6).
- **Motion:** expand height gentle; reduced motion: appears instantly.
- **Maps to:** a Margin editor overlay contribution (`src/vs/workbench/contrib/margin/browser/notice/*`) above both the rich editor and Monaco; CSS new file.

### 4.25 Buttons, inputs, toggles, checkboxes (controls)

- **Buttons:** primary accent fill / white 13 semibold, 28 tall (32 in dialogs), padding 0 12, radius 4; hover `#1A58BA`; pressed `#164A9C`; disabled 40% opacity. Secondary sunken / ink; hover pressed fill. Text button (link-like) accent text, underline on hover. Never more than one primary per surface.
- **Inputs:** 28 tall (32 in shelf find and settings search), canvas fill, 1px controlQuiet edge at rest, focus 1px accent edge + 2px ring; placeholder ink3; error edge danger + message below.
- **Toggle switch** (settings booleans): Windows 11 style 40 × 20 track, circle radius; off: 1px control edge, ink2 knob 12; on: accent fill, white knob 14; knob slides base.
- **Checkbox:** 18 × 18 in documents, 16 × 16 in UI; 1.5px control edge; checked accent fill and 1.75px white tick.
- **Maps to:** `src/vs/base/browser/ui/button/button.css`, `inputbox/inputBox.css`, `toggle/toggle.css`, `selectBox/selectBox.css`; settings booleans switch from checkbox to toggle via `settingsTree.ts` renderer (Margin-owned sections only).

### 4.26 Settings editor

- **Target:** a restrained page, not a database. Left nav 200 (Appearance, Editing, Files and recovery, Coding tools, Keyboard shortcuts, then `All settings` at the bottom which opens the upstream full list), content 640 max, page title 24/32 Display, search 32 tall at top. Rows 64+: label 13/18 semibold, description 12/16 ink2, control right-aligned. Segmented controls for 2 to 3 choices, stepper for text size (with `Reset`), toggles for booleans. Modified indicator: 2px accent bar at the row's left (the margin line again), not a dot.
- **Tokens:** `settings.*` (headerForeground ink, modifiedItemIndicator accent, rowHoverBackground sunken 60%, focusedRowBorder accent).
- **Radius:** controls 4, search 6.
- **Motion:** none beyond control feedback.
- **Content (Appearance):** Theme (System / Light / Dark), Text size (17, 12 to 28), Line width (Narrow 600 / Standard 680 / Wide 800), Typeface (Sans / Serif / Mono), Show word count, Reduce motion (follows Windows). **Editing:** Spelling (when available), Smart quotes (off), Autosave named files (off), Tabs (hidden / single / multiple). **Files and recovery:** draft location (read-only path + Open), history retention, default file type for new notes (.md / .txt), Windows file associations help. **Coding tools:** show on startup, default terminal, Git.
- **Maps to:** `src/vs/workbench/contrib/preferences/browser/media/settingsEditor2.css`, a Margin settings landing page (`settingsEditor2.ts` TOC filtered by `margin.*` tags), `workbench.settings.editor: "ui"`.

### 4.27 Keyboard shortcuts editor

- **Target:** the upstream table, restyled: rows 32, zebra off, keycaps as sunken 4-radius chips with 1px controlQuiet edge and 11/14 caption text.
- **Maps to:** `src/vs/workbench/contrib/preferences/browser/media/keybindingsEditor.css`, `keybindingLabel.*`, `keybindingTable.rowsBackground` transparent.

### 4.28 Welcome and first run

- **Target:** there is no welcome page. First launch = S01: a new draft, shelf closed, caret in the document, placeholder `Start writing.` The only first-run affordance is a single one-time line in the footer right slot: `Ctrl+O to open a file` in ink3 that disappears after the first keystroke or 20s. No carousel, walkthrough, sign-in, theme picker, or sample document.
- **Maps to:** `workbench.startupEditor: "none"` plus Margin's draft-on-launch contribution, `workbench.tips.enabled: false`, `workbench.editor.empty.hint: "hidden"`, remove `welcomeGettingStarted` contributions from startup, `workbench.welcomePage.walkthroughs.openOnInstall: false`.

### 4.29 Empty states

- **Target:** words, not pictures. Editor area with no document (only reachable by closing the last draft with a folder open): centered at 40% height, 13/20 ink2: `No document open.` then text buttons `New Note  Ctrl+N` and `Open File  Ctrl+O`. Shelf sections: empty sections are hidden, not labeled empty. On This Page: `Add a heading to see an outline.` Search: `No results for "…" in Weekend project.` + `Change Scope`.
- **Maps to:** `src/vs/workbench/browser/parts/editor/editorGroupWatermark.ts` (replace upstream watermark entries and letterpress), `editorgroupview.css` (`.editor-group-watermark`), Margin view `viewsWelcome` contributions.

### 4.30 Scrollbars

- **Target:** overlay scrollbars that appear on scroll or hover: 10 wide track area, 6 wide thumb at rest growing to 8 on hover, radius circle, thumb ink2 at 25% / 40% hover / 50% active, no track fill, no shadow. The document's scrollbar sits at the window edge, not at the column edge.
- **Tokens:** `scrollbarSlider.background` `#59627240`, `.hoverBackground` `#59627266`, `.activeBackground` `#59627280`, `scrollbar.shadow` transparent.
- **Motion:** fade out 800ms after scroll stops (upstream behavior), fade in quick.
- **Maps to:** `src/vs/base/browser/ui/scrollbar/media/scrollbars.css` (rounded thumb, inset 2), `editor.scrollbar.verticalScrollbarSize: 10`, `editor.scrollbar.horizontalScrollbarSize: 10`, rich editor `#editor` scrollbar via `::-webkit-scrollbar` in `markdownEditor.css`.

### 4.31 Focus rings

- **Target:** 2px accent, 2px offset, radius = element radius + 2, keyboard only. Never clipped: containers that scroll add 4px padding so rings on the first/last row are visible. Inside the title bar, rings sit inside the 48 height.
- **Tokens:** `focusBorder` accent; HC: `contrastActiveBorder`.
- **Maps to:** `src/vs/workbench/browser/media/style.css` (global `:focus-visible` rule), `src/vs/workbench/contrib/modernUI/browser/media/keyboardFocusOnly.css` (adopt), `workbench.experimental.modernUI: true`.

### 4.32 Sashes and resizing

- **Target:** invisible at rest; on hover (after 300ms) a 2px accent line appears centered on the boundary. Shelf edge double-click resets to 240.
- **Tokens:** `sash.hoverBorder` accent; `modernSash.gripForeground` ink2 40% (grip dots hidden in writing).
- **Maps to:** `src/vs/base/browser/ui/sash/sash.css`, `workbench.sash.hoverDelay: 300`, `workbench.sash.size: 4`.

### 4.33 Diff and compare (S13)

- **Target:** native diff editor with calm color: inserted line `#E9F6EE`, inserted text `#C6EBD4`, removed line `#FCEDEE`, removed text `#F6CDD0`, gutter bars 2px. Header labels plain words: `Your version (unsaved)` and `File on disk, changed 9:14 AM`. Inline diff under 720px.
- **Tokens:** `diffEditor.*`, `diffEditorGutter.*`, `diffEditorOverview.*`.
- **Maps to:** `diffEditor.renderSideBySide` responsive (`diffEditor.useInlineViewWhenSpaceIsLimited: true`), `diffEditor.renderIndicators: true`.

### 4.34 Suggest widget, parameter hints, lightbulb (Code only)

- **Target:** Level 2 overlay, outer 8, rows 24, selected tint, icons compact 12 monochrome ink2 (no rainbow symbol icons: `symbolIcon.*` map to five syntax hues at most), details pane on shell.
- **Maps to:** `src/vs/editor/contrib/suggest/browser/media/suggest.css`, `editor.suggest.showIcons: true`, lightbulb only in Code.

### 4.35 Print and PDF (S18)

- **Target:** the document CSS at 11pt, no chrome, headings avoid page breaks, code wraps with a 1px edge, links underlined. See `@media print` in [css/md-theme-margin.css](css/md-theme-margin.css).

### 4.36 About (S20)

- **Target:** a native-feeling dialog: 64px app icon, `Margin` 18/24 Display semibold, version and upstream commit 12/16 ink2 selectable, `Copy` text button, licenses link. No marketing.
- **Maps to:** `src/vs/workbench/electron-browser/actions/*about*` or Margin replacement; `window.dialogStyle: "native"` yields the OS dialog which is acceptable for v1.

---

## 5. Markdown typography (Write and Read)

Base 17/28 Segoe UI Variable Text. All sizes in `em` of the document size so text zoom (Ctrl+wheel, 12 to 28px) scales proportionally. Implemented in [css/md-theme-margin.css](css/md-theme-margin.css); rendered specimen [css/typography-specimen.png](css/typography-specimen.png).

| Block | Size / line | Weight | Tracking | Space before / after | Color and treatment |
| --- | --- | --- | --- | --- | --- |
| Paragraph | 17 / 28 | 400 | 0 | 0 / 16 | ink |
| H1 | 32 / 40 (Display) | 600 | -0.022em | 40 / 16 (0 if first) | ink, `text-wrap: balance`, no underline rule |
| H2 | 24 / 32 (Display) | 600 | -0.014em | 32 / 12 | ink, no rule |
| H3 | 20 / 28 | 600 | -0.008em | 28 / 8 | ink |
| H4 | 17 / 28 | 600 | 0 | 24 / 4 | ink |
| H5 | 15 / 24 | 600 | 0 | 20 / 4 | ink |
| H6 | 15 / 24 | 600 | 0 | 20 / 4 | ink2 |
| Heading markers `#` | same as heading | 400 | 0 | hang left of the column | ink3, only on the active block |
| Bullet list | 17 / 28 | 400 | 0 | 0 / 16; items 4 apart | bullets ink2, hang in a 26px gutter |
| Ordered list | 17 / 28 | 400 | 0 | as bullets | numbers ink2, tabular |
| Nested list | 17 / 28 | 400 | 0 | indent 26 per level | second-level bullet is a ring, third a square (browser defaults, ink2) |
| Task | 17 / 28 | 400 | 0 | as list | 18px box, 1.5px control edge, radius 4, 10 gap; checked accent fill, white 1.75 tick; done text ink2, **no strikethrough**; Read: inert, checked box ink2 fill |
| Blockquote | 17 / 28 | 400 | 0 | 0 / 16 | 2px `rule` line at left, 20 padding, ink (not dimmed, not italic) |
| Alerts `> [!NOTE]` | 17 / 28 | 400 | 0 | 0 / 16 | rule colored by kind (note accent, tip success, important keyword purple, warning warningInk, caution danger); label word in 600 |
| Inline code | 15 (0.88em) Cascadia Code | 400 | 0 | n/a | sunken fill, radius 4, padding 1 4, ligatures off |
| Code block | 14 / 22 Cascadia Code | 400 | 0 | 0 / 20 | sunken fill, radius 6, padding 16 20, no border, horizontal scroll, syntax per §6 |
| Table | 15 / 24 | 400; header 600 | 0 | 0 / 20 | rows separated by hairline, header underline controlQuiet, no zebra, no vertical rules, padding 8 12, tabular numbers, horizontal scroll inside the column |
| Link | inherit | 400 | 0 | n/a | accent, no underline at rest, 1px underline on hover (offset 0.18em); focus ring; external links show nothing extra |
| Image | max 100% of column | n/a | n/a | 8 / 8 | radius 6, 1px hairline ring for white-on-white screenshots; alt text shown as ink3 caption if the image is missing; remote images blocked by policy show a sunken placeholder `Image not loaded` + `Load` text button |
| Horizontal rule | 1px | n/a | n/a | 34 / 34 | hairline, full column width |
| Bold / italic / strike | inherit | 600 / 400 italic / 400 | 0 | n/a | strike text ink2 |
| Highlight `==x==` | inherit | 400 | 0 | n/a | findMatchOther fill, radius 2 |
| Footnotes | 14 / 22 | 400 | 0 | 32 / 0 | ink2 |
| Math | KaTeX default | n/a | n/a | 0 / 20 | block math centered in column |
| Front matter | 14 / 22 mono | 400 | 0 | 0 / 24 | shown as a sunken block in Write, hidden in Read with a small ink3 `Properties` disclosure |
| HTML comment | 14 mono | 400 | 0 | n/a | ink3, revealed on hover |

Plain text (`.txt`) Write/Read: 17/28 Segoe UI Variable Text, literal, wrapped at the measure, no interpretation, same insets.

---

## 6. Syntax color

Five hues plus ink, each ≥ 5:1 on white (≥ 7:1 dark). The palette is deliberately smaller than upstream Light+ so code looks calm next to prose. Full scopes in the generated themes (`tokenColors`, `semanticTokenColors`).

| Role | Light | Dark | Scopes |
| --- | --- | --- | --- |
| keyword / storage / decorator | `#8B3FB0` | `#C792EA` | keyword, storage, `this` (italic) |
| string | `#1E7A4C` | `#8FD19E` | string, template |
| number / constant / attribute | `#A34D00` | `#E3B866` | constant.numeric, constant.language, attribute-name, regex |
| type / class / CSS property | `#0F7B83` | `#5FC4CC` | entity.name.type, support.class |
| function / tag / Markdown heading | `#1A58BA` | `#7FB0FF` | entity.name.function, entity.name.tag, markup.heading |
| comment | `#676F7C` italic | `#8B929D` italic | comment |
| punctuation / operators | `#596272` | `#A2A9B4` | punctuation, keyword.operator |
| Markdown raw (inline code, fences in Code view) | `#8A6A1F` | `#E3B866` | markup.inline.raw, fenced_code |
| Markdown link text / URL | accent / ink3 | accent / ink3 | string.other.link, markup.underline.link |

Markdown in Code view keeps task syntax literal (`- [x]` in ink2), per the concept correction.

---

## 7. Dark variant

"Night paper": graphite, not black. The shell (`#222428`) is lighter than the page (`#1B1C1F`) so the page recedes like paper under a desk lamp, and overlays are lighter again (`#2A2C31`) because shadows barely read on dark. Accent lightens to `#6EA6FF` for text and caret; fills use `#2F6FD8` so white labels keep 4.8:1. Selection `#2B4C7E`. Find match becomes a dark amber so it does not glare. Images get no ring. `window.autoDetectColorScheme: true` with `workbench.preferredDarkColorTheme: "Margin Dark"` follows Windows. Reference mockup: [assets/mockups/07-dark-writing.png](assets/mockups/07-dark-writing.png).

## 8. High contrast

Two paths:

1. **Windows Contrast Themes on:** `window.autoDetectHighContrast: true` switches to `workbench.preferredHighContrastColorTheme` (upstream Dark High Contrast) or `workbench.preferredHighContrastLightColorTheme: "Margin High Contrast Light"` ([theme/margin-hc-light-color-theme.json](theme/margin-hc-light-color-theme.json)). Every surface gets a `contrastBorder` edge, focus uses `contrastActiveBorder`, the shelf/page split is drawn as a line (not a tint), selection is a real fill with black text, links are underlined, icons are solid ink.
2. **Inside webviews** (rich Markdown): `@media (forced-colors: active)` maps to system colors (`Canvas`, `CanvasText`, `LinkText`, `Highlight`, `HighlightText`), checkboxes revert to native appearance, and no information is carried by background color alone. See [css/md-theme-margin.css](css/md-theme-margin.css).

Gate: every screen in §4 at 100% and 200% scaling in Aquatic and Desert contrast themes, with keyboard focus visible on every control (upstream issue 321623 must be re-checked on the Margin build).

## 9. Typography decision

| Use | Face | Ship? | License | Source | Why |
| --- | --- | --- | --- | --- | --- |
| UI, default document | **Segoe UI Variable** (Display / Text / Small optical sizes) | No, system font (Windows 11). Fallback Segoe UI on Windows 10. | Microsoft system font; not redistributable, and does not need to be. | Ships with Windows 11 | The Apple lesson is *use the system face and use it well*. Segoe UI Variable is tuned for ClearType and DirectWrite, has true optical sizes (the direct equivalent of SF Pro Display/Text), and makes Margin feel native next to Notepad and Explorer. Product doc 01 already chose platform fonts. |
| Code, terminal, inline code | **Cascadia Code** (variable, 200 to 700) | **Yes**, bundled so Windows 10 and stripped Windows 11 images match. | SIL OFL 1.1, Reserved Font Name "Cascadia Code" | https://github.com/microsoft/cascadia-code (release 2407.24) | Microsoft's own monospace: native to Windows Terminal, excellent hinting, Latin/Greek/Cyrillic/Arabic/Hebrew coverage. Ligatures stay off by default (source must look like source). |
| Optional document serif, Print option | **Source Serif 4** (variable, optical size axis 8 to 60) | **Yes**, bundled. | SIL OFL 1.1, Reserved Font Name "Source" | https://github.com/adobe-fonts/source-serif | A calm, well-hinted text serif with a real optical-size axis, so 17px body and 32px headings both look designed. Gives writers a Pages-like choice without shipping a web-looking face. |
| Considered and rejected | Inter / Inter Display (OFL) | No | OFL | rsms.me/inter | Beautiful, but on Windows it renders softer than Segoe UI Variable at 13px and would make Margin look like a web app inside a native frame. |
| | iA Writer Quattro/Duo (OFL, from IBM Plex) | No | OFL | github.com/iaolo/iA-Fonts | Too strongly associated with iA Writer; Margin would read as a clone. |
| | IBM Plex Sans / Mono | No | OFL | github.com/IBM/plex | Corporate voice; Plex Mono is a fine fallback but Cascadia is more native. |
| | JetBrains Mono | No | OFL | jetbrains.com/lp/mono | Excellent, but IDE-branded; Cascadia matches Windows. |

Binaries and licenses are in [fonts/](fonts/) (see [fonts/README.md](fonts/README.md)). OFL obligations: ship the license text with the fonts, do not sell the fonts alone, do not use the Reserved Font Names for modified versions (subsetting for the installer counts as modification if we rename nothing; keep the files unmodified).

Font settings: `editor.fontFamily: "'Cascadia Code', 'Cascadia Mono', Consolas, monospace"`; `terminal.integrated.fontFamily` same; `markdown.editor` document family via `--markdown-font-family` = Segoe UI Variable Text, Source Serif 4, or Cascadia Code per the Typeface setting; UI font is inherited from `src/vs/workbench/browser/media/style.css` line 18 (`.monaco-workbench.windows { font-family: "Segoe WPC", "Segoe UI", sans-serif; }` → prepend `"Segoe UI Variable Text"`, keep the CJK `:lang()` variants' fallbacks after it).

## 10. Iconography

### 10.1 Direction

Margin's product icons are **Fluent-weight line glyphs on a 16px grid**, not codicons. Codicons are drawn for a dense IDE; on a white writing surface their mixed stroke weights look busy. The base set is **Fluent UI System Icons, Regular, 16px** (MIT license, https://github.com/microsoft/fluentui-system-icons), which is the Windows 11 native vocabulary. Margin-specific glyphs are hand-drawn on the same grid in [icons/](icons/) (specimen: [icons/specimen.png](icons/specimen.png)).

### 10.2 Grid and stroke rules

- 16 × 16 artboard, 1px padding keyline (live area 14 × 14), strokes 1px centered on half-pixels (`x.5`) so they render crisp at 100% and 200%.
- Round caps and joins. Corner radius 1.5 to 2 on rectangles (page shapes 1.5, containers 2).
- Portrait page proportion 9 × 13 inside the live area. Every "note" glyph contains the inset margin line at x = 6.5.
- Documents with a folded corner mean "a file on disk"; the plain page with margin means "a note in Margin". Dashed page means "draft, not yet a file".
- Fill is used only for state (the ellipsis dots, the warning dot). No duotone. Color comes from `icon.foreground` (ink2); selected rows use `#1A58BA`; nothing else is colored.
- Two sizes only: 16 (default) and 12 (compact: twisties, find toggles, keycaps). 12px versions are redrawn, not scaled (upstream `*Compact` glyph rule).

### 10.3 Codicons visible in the notes-first layout (to be replaced by the Margin product icon theme)

Writing layout, by surface:

| Surface | Codicon / icon id | Margin glyph |
| --- | --- | --- |
| Title bar | `layout-sidebar-left`, `layout-sidebar-left-off` | `shelf` |
| Title bar | `ellipsis` (more actions), `new-file` | `more`, `new-note` |
| Title menu / footer | `lock`, `check` | `lock`, `saved` |
| Shelf | `search` (find field), `file`, `file-text`, `markdown`, `folder`, `folder-opened`, `history`, `list-tree`/`symbol-*` (outline), `close` | `search`, `file`, `file-text`, `file`, `folder`, `folder`, `recent`, `outline`, `close` |
| Shelf rows | `tree-item-expanded` / `chevron-down`, `chevron-right` | `chevron-down`, `chevron-right` (12 compact) |
| Find widget | `find-previous-match` (`arrow-up`), `find-next-match` (`arrow-down`), `find-selection` (`selection`), `find-replace` / `find-replace-all` (`replace`, `replace-all`), `find-collapsed`/`find-expanded` (`chevron-right`/`chevron-down`), `widget-close` (`close`), `case-sensitive`, `whole-word`, `regex`, `preserve-case` | Fluent 16: Arrow Up, Arrow Down, Text Box Select, Arrow Swap, Arrow Repeat All, Chevron, Dismiss; Aa, ab, .* drawn as text glyphs |
| Notices / notifications | `info`, `warning`, `error`, `bell`, `bell-dot`, `notifications-clear`(`close`), `notifications-clear-all` (`clear-all`), `notifications-collapse`/`expand` (`chevron-down`/`chevron-up`), `notifications-configure` (`gear`) | `warning`, Fluent Info, Error Circle, Alert, `close`, Dismiss Circle, chevrons, `settings` |
| Compare (S13) | `compare-changes`, `discard`, `save` | `compare`, Fluent Arrow Undo, Fluent Save |
| Quick input | `quick-input-back` (`arrow-left`), `check-all`, `filter` | Fluent Arrow Left, Checkmark, Filter |
| Menus | `menu-selection` (`check`), `menu-submenu` (`chevron-right`) | `saved` (check), `chevron-right` 12 |
| Mode control overflow (compact) | `edit`, `preview`/`book`, `code` | `mode-write` (caret I-beam), `mode-read` (open book), `mode-code` (`< >`) |
| Settings | `settings-edit`, `settings-discard`, `gear`, `add`, `remove` | Fluent Edit, Arrow Undo, `settings`, Add, Subtract |
| Coding Tools (additional) | `files`/`explorer-view-icon`, `search-view-icon`, `source-control-view-icon`, `run-view-icon`, `terminal`, `trash` (`terminal-kill`), `add` (`terminal-new`), `split-horizontal`, `debug-*`, `git-branch`, `sync`, `refresh`, `collapse-all`, `new-folder`, `panel-maximize`/`restore`, `panel-close` | Fluent Document Multiple, Search, Branch, Play, `coding-tools`, Delete, Add, Split, Fluent debug set, Branch, Arrow Sync, Arrow Clockwise, Collapse All, Folder Add, Maximize, Dismiss |

Removed entirely (AI): `sparkle`, `copilot`, `chat-*`, `mcp`, `agent`, `robot`, `wand`; `account` (no accounts); `extensions` (no marketplace).

### 10.4 File icon theme

`margin-files`: monochrome. Five glyphs only: note (`.md`, `.markdown`), text (`.txt`, `.log`), code file (all other text; a page with `< >`), folder, folder-open. Color ink2; no per-language colors. Rationale: M1 and M4. Upstream Seti is available for users who want it.

### 10.5 App icon brief (and delivered mark)

- **Concept:** one white sheet, one inset blue margin rule. The rule sits at 21% of the page width and runs the full height; it is never on the edge (edge = binder/spine = generic document icon). No fold on the app icon; folds are for documents opened by Margin (the association icons). This split lets the taskbar icon and the file icons in Explorer read as family without being identical.
- **Construction (48 grid, scaled to 256):** page 30 × 42 at (9, 3), radius 2.5; rule x 15.25, width 1.5; inner hairline 0.5 ink at 16%; material: white to `#F4F6F9` vertical falloff (Fluent app-icon material, 2% delta), contact shadow blur 0.9, offset 0.9, 18% black.
- **Optical sizes:** 16 (square corners, 1px rule at x = 6, 1px `#8793A2` frame), 24 (1px rule), 32 (1.5px rule), 48+ (master). Tested on light `#F3F4F6` and dark `#1F1F1F` taskbars: [assets/icon/icon-review.png](assets/icon/icon-review.png).
- **Variants:** flat (no material), high contrast (black page, white rule and edge), monochrome currentColor mark for UI.
- **Deliverables:** [assets/icon/margin-app-icon.svg](assets/icon/margin-app-icon.svg) (+ 1024 PNG), `-16/-24/-32.svg`, `-flat.svg`, `-hc.svg` (+1024 PNG), `margin-mark-16.svg`, `margin-mark-mono.svg`, `margin-file-md.svg`, `margin-file-txt.svg`. ICO assembly (16, 20, 24, 32, 40, 48, 64, 256) is an engineering task (IMPLEMENTATION-MAP T1.3).

---

## 11. Mockups and their known deviations

High-fidelity renders (GPT Image 2 via Higgsfield) live in [assets/mockups/](assets/mockups/). They show material, rhythm, and hierarchy. Where they disagree with this guide, the guide wins:

| Mockup | Use it for | Ignore |
| --- | --- | --- |
| 01-first-launch | The one-sheet feeling, title bar composition, placeholder placement | Caret is taller than the line box; footer not aligned to the column |
| 02-writing-markdown | Shelf rhythm, heading scale, task and quote treatment, footer | All task text dimmed (only completed should be); mark drawn as a panel glyph; column slightly wider than 680 |
| 03-read-view | Read calm, On This Page active bar, `Read only` footer | Title bar is tinted full width (should split, §2.2); "Margin" wordmark in the title bar (not in spec) |
| 04-explorer-shelf-coding | Coding Tools composition, top activity row, terminal as white panel, footer items | Code segment selected with a dark outline (should match the white thumb); footer tint spans full width |
| 05-file-finder-palette | Palette frame, row anatomy, scope line, hints | Palette sits lower than top 88; the window behind has a "Margin" wordmark and a duplicated toggle; the paragraph text behind is invented |
| 06-settings | Page structure, segmented controls, stepper, toggles | Modified indicator not shown; mark drawn as a panel glyph |
| 07-dark-writing | Night paper palette and contrast | Title bar tinted over the page (should be canvas) |
| 08-compact-480 | Compact title bar, inset 24, footer | Title bar slightly tinted (should be white with shelf closed) |

Rejected renders and the reasons are logged in [assets/README.md](assets/README.md).

## 12. Changes to docs/04-DESIGN-SYSTEM.md

1. Toolbar height 52 → **48**, merged with the title bar (one row).
2. Shelf default 236 → **240** (on the 4/8 grid).
3. `muted` `#737D8B` → tertiary **`#676F7C`** (the old value fails 4.5:1 on the shell).
4. `selection` `#E8EFFB` → **`#CCDEFB`** (the old value was indistinguishable from hover on many panels); unfocused selection `#E4E9F0`.
5. Weights: H1 650 to 700 → **600** (two-weight system, Segoe UI Variable Display semibold is already strong at 32px). H1 34/41 → **32/40**, H3 19/28 → **20/28**.
6. Radius tiers aligned to upstream (4 / 6 / 8 / 12) instead of 5 / 8 / 12.
7. Completed tasks: dim, never strike through.
8. Bundled fonts: Cascadia Code and Source Serif 4 (OFL). UI and default document stay on the system Segoe UI Variable.
9. Command center removed; document title menu replaces it.

## 13. Review checklist (per screen, before merge)

1. Is the first line of the document the most prominent thing on screen? (M1)
2. Count the greys. More than canvas, shell, sunken? Fix the layout. (M6)
3. Count the blues. Each one must be caret, focus, selection, link, checked, or active. (M4)
4. Switch Write → Read → Code → Write. Did any character move? (M3)
5. Save, edit, fail a save: is the state in the same place, same width, in words? (M5)
6. Tab through everything: is focus always visible and never clipped?
7. 480 × 360, 200% scale, Contrast Theme Aquatic: is every control reachable?
8. Reduced motion on: does anything still slide?
9. Does anything have a fill, border, or badge while idle that it has not earned? (M7)
10. Could a stranger read every label aloud and know what it does?

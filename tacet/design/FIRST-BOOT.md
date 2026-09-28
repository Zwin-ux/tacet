# Tacet first boot

Status: design spec v2.1, 2026-09-27 (v2: no status bar anywhere, optional Extras step, animated mark on step 1; v2.1: Markdown source view row removed and OneDrive honesty on step 3, from CRITICISM.md C1, C2; `Check spelling` Extra, owner decision). Owner: tacet/design. Built in `extensions/tacet-welcome` (M3); test gate `tacet/tools/first-boot.mjs`.
Basis: [docs/10-REBUILD.md](../docs/10-REBUILD.md) revision 2026-09-27 (first boot is a React webview built with Animate UI in `extensions/tacet-welcome`; git removed), [REFERENCES-V2.md](REFERENCES-V2.md) §6, owner direction 2026-09-27 (title bar + page only by default; the status line is an opt-in extra), [ANIMATION-GATE.md](ANIMATION-GATE.md), and [DESIGN-GUIDE.md](DESIGN-GUIDE.md) for everything not changed here. DESIGN-GUIDE §4.28 ("no first-run surface") and §4.18 (footer always on) conflict with this file; the guide owner must fold the changes in. This file does not edit the guide.

Renders: [assets/first-boot/](assets/first-boot/). Motion: [motion/MOTION.md](motion/MOTION.md) (M-07), mark: [assets/animated/](assets/animated/). Written numbers beat the renders.

## 1. Idea

The first boot is up to four short pages on the same white sheet the user will write on. Same window, same title bar, same column position as a note. When setup ends, the setup text clears and the same page is ready with the caret. Nothing slides in, nothing resizes. No welcome tab, no feature tiles, no walkthrough, no sign-in. Enter alone finishes it; Esc leaves at any point.

## 2. Frame (all steps)

| Item | Value |
| --- | --- |
| Window | 1120 x 760 logical, centered on the primary display (smaller work area: 80% of it; min 480 x 360). This becomes the remembered size. |
| Surface | Whole window canvas `#FFFFFF` (dark `#1B1C1F`). Shelf closed. No hairline. **No status bar.** |
| Title bar | 48, canvas. Only the 16px mark at x = 16 and native caption buttons. Drag, double-click and Alt+Space work. |
| Column | Left edge = left edge of the centered 680 document column: x = (window width - 680) / 2 (220 at 1120). Content width 560, left-aligned. |
| Step line | `1 of 4` (12/16 ink2, tabular), line box at y = 80 (24 above the heading). Crossfades 100ms between steps. |
| Top | Heading line box starts 56 below the title bar (y = 104): the same line where a note's first line sits. |
| Type | Heading: Segoe UI Variable Display 28/36, 600, -0.012em, ink. Line: Text 14/20 ink2. Control labels: 14/20 ink. Secondary lines: 12/16 ink2. Nothing below 12. |
| Button row | 32 below the last block. Primary 32 tall, padding 0 16, accent fill, label 14/20 semibold white, then the key hint `Enter` in 12/16 white at 70%. Secondary 32 tall, sunken fill, ink. Gap 8. One primary per step. At the right end of the same row, right-aligned to the column's right edge (x + 560): text button `Skip setup` (14/20 ink2) + `Esc` (12/16 ink3). Same place on every step. |
| Vertical rhythm | heading -> line 8; line -> first control group 32; group -> group 24; last group -> button row 32. All on the 4px grid. |
| Compact (< 720 wide) | Column inset 24, content full width minus 48, heading 24/32; `Skip setup` wraps to its own line under the buttons. |

## 3. Step 1 of 4: Look

| Block | Spec |
| --- | --- |
| Heading | 36 x 36 animated Tacet mark, then 12 gap, then `Tacet`, on one line. The mark plays the pen-stroke draw once when the step appears (880ms, [assets/animated/tacet-mark.css](assets/animated/tacet-mark.css) `.mm--draw`; reduced motion: 200ms fade). Input is live from the first frame. |
| Line | `Choose how the page looks. You can change this later in Settings.` |
| Theme | Label `Theme` (14/20 semibold ink), 8 below: segmented control `System` / `Light` / `Dark`, 28 tall, segments 80 wide, track sunken radius 6, white thumb radius 4 with 1px controlQuiet edge (guide §4.5 anatomy). Default `System`. |
| Text size | Label `Text size`, 8 below: stepper `-` `17` `+` (buttons 28 x 28 sunken, radius 4; value 14/20 tabular, 40 wide centered), range 12 to 28, and `Reset` text button when not 17. |
| Sample | 16 below the stepper: one sentence in the real document typography at the chosen size (Segoe UI Variable Text, 17/28 at default, ink): `Leave the phone in the kitchen. Open the window.` Not boxed. |
| Live | Theme and size apply to the whole window at once (color change 100ms; size change instant). |
| Buttons | Primary `Continue  Enter`. |
| Writes | System: `window.autoDetectColorScheme: true`, `workbench.preferredLightColorTheme: "Tacet Light"`, `workbench.preferredDarkColorTheme: "Tacet Dark"`. Light / Dark: `workbench.colorTheme` = `"Tacet Light"` / `"Tacet Dark"`, `window.autoDetectColorScheme: false`. Size: `tacet.document.fontSize` (default 17; only written when changed). Contrast Themes always win (guide §8). |
| Initial focus | The selected theme segment. |

## 4. Step 2 of 4: Bring your settings (conditional)

Shown only if at least one source folder exists: `%APPDATA%\Code\User`, `%APPDATA%\VSCodium\User`, `%APPDATA%\Cursor\User`, `%APPDATA%\Windsurf\User` (verify the Cursor and Windsurf/Devin paths on a device; REFERENCES-V2 §9). If none exists the step is skipped and the counter counts one step less (`1 of 3` ... `3 of 3`).

| Block | Spec |
| --- | --- |
| Heading | `Use your VS Code settings?` |
| Line | `Tacet can copy your keyboard shortcuts and editor settings. Your VS Code files do not change.` |
| Choice | Radio rows, 44 tall (label 14/20 + path 12/16 ink2), padding 0 12, radius 6, hover fill hoverCanvas, no border at rest. One row per found source: `Copy from VS Code` / `%APPDATA%\Code\User` (etc.), then `Start with Tacet defaults`. Default: `Start with Tacet defaults`. |
| What to copy | Under a copy row when selected, indented 28: two checkboxes (16px, radius 4) `Keyboard shortcuts` and `Editor settings`, both on. Then a fixed line 12/16 ink2: `Tacet does not copy extensions.` |
| Result | After `Copy and continue`, step 3 shows one extra line 8 under its own line, 12/16 ink2: `Copied 42 shortcuts and 18 settings. 6 do not apply.` (real counts). The detail list is in the command `Show Import Report`. |
| Buttons | Primary `Copy and continue  Enter` (reads `Continue  Enter` when defaults are chosen), secondary `Back`. |
| Writes | Keybindings: entries from the source `keybindings.json` whose commands exist in Tacet, appended to the user `keybindings.json`. Settings: keys from the source `settings.json` that Tacet registers, excluding `workbench.colorTheme`, `workbench.iconTheme`, `workbench.statusBar.visible`, `extensions.*`, anything AI or account related, and any removed feature (debug, tasks, git, scm, remote, sync). Non-destructive, one way; the source files are only read. |
| Initial focus | The selected radio row. |

## 5. Step 3 of 4: Where your notes live

| Block | Spec |
| --- | --- |
| Heading | `Where your notes live` |
| Line | `New notes are drafts. Tacet keeps them safe until you save them to a folder.` |
| Choice | Radio rows, 44 tall, same anatomy as step 2: `Notes folder in Documents` / `C:\Users\Alex\Documents\Notes` (real path; if missing, add ` · Tacet makes this folder` in ink3), and `A folder I choose` / text button `Choose Folder…` (accent). The picker is the native folder dialog. Cancelled with no folder picked: selection returns to row 1. Default row 1. |
| OneDrive (from CRITICISM.md C2) | Documents is often synced by OneDrive (Known Folder Move), which would break the no-cloud promise without the user knowing. Detect it: the Documents shell folder (`HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders` `Personal`, expanded) is under `%OneDrive%`, `%OneDriveConsumer%` or `%OneDriveCommercial%`, or under a folder named `OneDrive` / `OneDrive - <org>`. If so: one plain line under row 1, 12/16 ink2, `Documents is synced by OneDrive. Your notes will sync too.`, and an extra row between rows 1 and 2: `Keep notes only on this PC` / `%USERPROFILE%\Tacet` (same ` · Tacet makes this folder` rule). Row 1 stays the default: do not block, just be honest. |
| Buttons | Primary `Continue  Enter`, secondary `Back`. |
| Writes | `tacet.notes.folder: "<absolute path>"` (default Save location for drafts); the folder is added to the shelf's Folders. The Notes folder is created when setup finishes, never earlier. Drafts storage does not change. |
| Initial focus | The selected radio row. |

## 6. Step 4 of 4: Extras (optional)

Everything here is off. Enter keeps it that way; the step costs one keystroke.

| Block | Spec |
| --- | --- |
| Heading | `Extras` |
| Line | `All are off. You can turn them on later in Settings.` |
| Rows | Four switch rows (v2.1: the Markdown source view row is removed, `Check spelling` is added), each one line, 40 tall, full 560 width, padding 0 12, radius 6, hover fill hoverCanvas, no border at rest. Label 14/20 ink at left; Windows 11 toggle switch at the right end (guide §4.25: 40 x 20 track; off: 1px control edge, ink2 knob 12; on: accent fill, white knob 14). No descriptions, no icons. |
| Row 1 | `Show a status line` -> `workbench.statusBar.visible: true` (the footer of guide §4.18: save state and word count in Write/Read; Ln/Col and language in Code). Default `false`. |
| Row 2 | `Show line numbers in Code view` -> `tacet.code.lineNumbers: true` (sets `editor.lineNumbers: "on"` for the Code view only; Write and Read never show them). Default `false`. |
| Row 3 | `Open a terminal with Ctrl+\`` -> `tacet.terminal.shortcut: true` (registers `workbench.action.terminal.toggleTerminal` on Ctrl+\`, which Tacet does not bind by default). Default `false`. |
| Row 4 | `Check spelling` -> `tacet.spelling.enabled: true` (owner decision 2026-09-27). Squiggle underlines only; Tacet never autocorrects or changes text. Default `false`. The fork has no spell checker yet (Electron `spellcheck: false` in `windows.ts`); M6 implements it against this setting. |
| Removed (from CRITICISM.md C1) | `Show Markdown source view`. Source view for `.md` is always one key away (`Write ▾` -> `Code`, and its keybinding), never behind a switch: hidden characters and formatting are the top Notepad-Markdown complaint. There is no `tacet.markdown.sourceView` setting. |
| Buttons | Primary `Start writing  Enter`, secondary `Back`. |
| Writes | Only the rows switched on; nothing is written for rows left off. |
| Initial focus | Row 1. |

Deliberately left out (fewer elements; each is one command away later): line width (Settings), default-app association (Settings > Files, opens Windows Default Apps), telemetry (Tacet has none).

## 7. Landing: the page clears

After `Start writing` or `Skip setup`:

1. Setup content (step line, heading, line, controls, button row) fades out: opacity 1 to 0, 110ms, exit `cubic-bezier(0.3, 0, 1, 1)`. No movement.
2. 40ms on the empty page.
3. Fade in together, opacity 0 to 1, 160ms, enter `cubic-bezier(0, 0, 0, 1)`: title-bar controls (shelf toggle, title `Draft`, mode picker, overflow), the placeholder `Start writing.` (17/28 ink3) and the caret. The placeholder line is at y = 104, where the setup heading was.
4. 8 below the placeholder, a one-time hint in 12/16 ink3: `Ctrl+O opens a file.` It hides on the first keystroke or after 20s, and never shows again. (It replaces the footer hint of guide §4.28, since there is no footer by default.)
5. Caret solid for 500ms, then the phase blink (1060ms cycle). Focus is in the document.

Total 310ms. A keystroke during the fade ends the fade at once and types the character.

Save state without a status bar (owner direction): unsaved changes show as the 6px ink2 dot after the document name in the title bar (guide §4.2); hover or keyboard focus on the title shows `Saved`, `Edited` or `Saved in Drafts` as the title's tooltip text (12/16). A save failure still shows the notice (guide §4.24) and puts `Couldn't save` in danger text after the title until resolved. With `Show a status line` on, the footer returns exactly as guide §4.18.

Between steps: outgoing content fades 110ms (exit), incoming 160ms (enter), opacity only. The heading sits at the same y on every step; only the words change.

Reduced motion (`workbench.reduceMotion`, Windows animation effects off, or `prefers-reduced-motion`): every fade is 0ms, the mark shows drawn (200ms fade), the switch knob jumps, theme change is instant.

## 8. Keyboard map

| Key | Action |
| --- | --- |
| Enter | Primary action (`Continue`, `Copy and continue`, `Start writing`). On a focused button, activates that button. |
| Esc | `Skip setup` (§9). |
| Alt+Left | `Back` (steps 2 to 4). |
| Tab / Shift+Tab | Control groups in order, then primary, secondary, `Skip setup`, then wrap. Title bar is not in the tab order. |
| Arrow keys | Move inside a segmented control or radio group (roving tabindex); Up/Down move between switch rows. |
| Space | Select radio, toggle checkbox, toggle switch. |
| - / + | Text size down / up when the stepper has focus. |
| Alt+C / Alt+B / Alt+S | Access keys: the step's primary, Back, Skip setup. Underline the letter only while Alt is held. |

Focus ring: 2px accent, 2px offset, keyboard only. Every step completes with Enter alone. Screen reader: each step is a region labelled by its heading and announces `Step 1 of 4. Tacet. Choose how the page looks.` on arrival; switches announce `Show a status line, switch, off`.

## 9. Skip, persistence, re-entry

- `Skip setup` keeps choices already confirmed with Continue and writes nothing else. Defaults: theme System, size 17, no import, no `tacet.notes.folder` (Save opens the native dialog in Documents), all extras off.
- Completion flag `tacet.firstBoot.completed = true` in application storage (`StorageScope.APPLICATION`, `StorageTarget.MACHINE`), set on `Start writing` or `Skip setup`. Closing the window mid-setup: next launch starts again at step 1, with earlier choices kept.
- A launch with a file argument skips setup for that launch and opens the file.
- Command `Show Setup` (palette only, no chrome icon) reopens step 1 over a new empty draft.
- Never shown on update.

## 10. Animate UI and Motion (webview only)

[UI-KIT.md](UI-KIT.md) (2026-09-27) also maps the first boot to Animate UI components (`texts/splitting`, `radix/radio-group`, `base/toggle-group`, `base/switch`, `effects/fade` + `effects/slide`). Where its motion differs from this section (12 px step slide, splitting welcome line, switch spring bounce 0.15), the conflict and a recommendation are in [motion/MOTION.md](motion/MOTION.md) §4; the owner decides. The webview uses Tacet tokens and CSS variables from the host theme (`--vscode-*`), Segoe UI Variable, and Tacet radii. Nothing keeps Animate UI's demo look: no gradients, no glow, no blur, no scale-in, no spring overshoot, no text effects. The only animated icon is the Tacet mark on step 1.

| Use | Animate UI (registry, verify exact ids in `extensions/tacet-welcome`) | Motion values |
| --- | --- | --- |
| Mark on step 1 | none; inline SVG with `tacet-mark.css` (or `tacet-mark-draw.lottie.json` via lottie-web if the webview prefers) | 880ms draw once (see ANIMATED-IDENTITY.md); never loops |
| Theme segmented control | Radix-based Tabs or Radio Group component with the animated highlight (the sliding thumb) | Thumb: `{ type: "tween", duration: 0.16, ease: [0.32, 0.72, 0, 1] }`. Labels never animate. |
| Radio rows (steps 2, 3) | Radix Radio Group | Indicator dot: opacity + scale 0.6 to 1 in 0.1s, `ease: [0.2, 0, 0, 1]`. Row hover fill 0.1s. |
| Checkboxes (step 2) | Radix Checkbox (animated check path) | Tick: opacity + scale 0.9 to 1 in 0.1s, `ease: [0.23, 1, 0.32, 1]`; uncheck instant. |
| Extras switches (step 4) | Radix Switch (animated thumb). Not the Checkbox: a setting that takes effect is a switch in Windows 11. | Knob: `x` 0 to 20px, `{ type: "tween", duration: 0.16, ease: [0.32, 0.72, 0, 1] }`; knob size 12 to 14 at the same time; track fill color 0.1s. No spring bounce. |
| Text size value | Sliding Number text primitive, or a plain number | 0.1s tween, `ease: [0.2, 0, 0, 1]`, vertical offset 4px max. Plain number is acceptable; do not use a counting effect. |
| Step change | Motion `AnimatePresence mode="wait"` (no Animate UI component) | Exit `{ opacity: 0 }` 0.11s `ease: [0.3, 0, 1, 1]`; enter `{ opacity: 1 }` 0.16s `ease: [0, 0, 0, 1]`. No x/y movement. |
| Landing (page clears) | Motion, host-coordinated | §7 values. The webview posts `tacet.firstBoot.done` after its exit fade; the workbench fades its own controls in with CSS. |
| Heading and lines | Plain text. Text primitives (typing, splitting, rolling, highlight) are not used: text that animates in performs (M8). | none |

Reduced motion: wrap the tree in `MotionConfig reducedMotion="always"` when the host reports reduced motion; all values above become instant, and the mark uses its 200ms fade.

## 11. What first boot never does

No sign-in, no account slot, no telemetry prompt, no "What's new", no feature list, no sample note, no illustration, no progress dots or bars, no confetti, no "You're all set", no tips, no status bar. The last button says `Start writing`, and Tacet answers with a white page and a caret.

## 12. Build notes (M3, 2026-09-27)

The settings `tacet.document.fontSize`, `tacet.notes.folder`, `tacet.code.lineNumbers`, `tacet.terminal.shortcut` and `tacet.spelling.enabled` are registered by `extensions/tacet-welcome`; their consumers (Write/Read size, Save location, Code view, spell checking) land in M4 to M6. `tacet.terminal.shortcut` gates a `Ctrl+\`` binding, but the core terminal still binds `Ctrl+\`` by default until the engineering lane removes it. The completion flag lives in the extension's global state (`tacet.firstBoot.completed`), and the palette command is `Tacet: Show Setup`. The workbench half of the landing (title-bar controls fade in, `Start writing.` placeholder, the one-time `Ctrl+O opens a file.` hint) is M4; today the webview fades out and a new untitled draft opens with the caret.

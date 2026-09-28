# Margin references v2: ChatGPT desktop, Windsurf, Cursor, Zed, Notepad

Status: research input, 2026-09-27. Owner: margin/design. Not authoritative: [DESIGN-GUIDE.md](DESIGN-GUIDE.md) wins until its owner accepts a change listed in §7.
Brief (owner, 2026-09-27): "bare bones / high quality, kinda like a mix of the ChatGPT app and VS Code to make it clean, Windsurf and such." Margin has no AI. We borrow visual and interaction discipline only, never features.

Evidence rules used here:

- A number with a URL is sourced. A number marked **observed** comes from screenshots or from use and is not measured. **Unknown** means no primary source was found; nothing was guessed.
- Limits of this pass: chatgpt.com blocked the headless browser (Cloudflare challenge; no computed styles were captured), and help.openai.com returned HTTP 403 to fetches. ChatGPT numbers therefore come from open-source userscripts, extension source and bug reports that quote OpenAI's CSS. Treat them as "true at the date of the source".
- Guide vocabulary: principles M1 to M9 and the slop list are in [DESIGN-GUIDE §1.3–1.4](DESIGN-GUIDE.md); tokens (canvas, shell, sunken, ink, ink2, ink3, accent, tint, hairline) are in §2.1.

---

## 1. ChatGPT desktop (Windows and macOS, 2025–2026)

### 1.1 What the product is now

- On 2026-07-09 OpenAI merged Chat, Work and Codex into one desktop app with three modes ([codex.danielvaughan.com](https://codex.danielvaughan.com/2026/07/10/chatgpt-work-codex-unification-cli-developer-guide-scheduled-tasks-unified-runtime/), [developersdigest.tech](https://www.developersdigest.tech/blog/chatgpt-work-codex-desktop-app)). The launch buried chat history and made mode switching awkward; OpenAI patched it by putting conversation history and projects back in the sidebar ([Digital Trends](https://www.digitaltrends.com/computing/openai-patches-chatgpt-desktop-after-user-backlash-over-its-recent-redesign/)).
  - **Lesson for Margin:** a mode merge that hides the user's own list of things is the failure users punish. Margin's shelf (Drafts, Recent) must never be displaced by Coding Tools.
- Build 26.924 (September 2026) redesigned the sidebar again: Projects, Sites, Maps, GPTs and Pull requests moved under a `…` menu; sort changed from manual to automatic by default; hovering the Projects heading reveals collapse, `…` and `+` ([OpenAI community, 26.924 thread](https://community.openai.com/t/chatgpt-desktop-26-924-sidebar-redesign-some-missing-features-are-still-there-just-moved/1401386)).
  - **Lesson:** secondary destinations go behind one `…`; section controls appear only on hover of the section heading. This is M7 (reveal on intent) done by a large product.
- Windows release notes list a redesigned sidebar that shows up to eight recent conversations and a new **floating sidebar** mode ([Windows app release notes, via search index](https://help.openai.com/en/articles/10003026-windows-app-release-notes); page returns 403 to fetch). The companion window opens with Alt+Space, remembers its position and resets to bottom centre ([Using the ChatGPT Windows app](https://help.openai.com/en/articles/9982051-using-the-chatgpt-windows-app)).

### 1.2 Layout and numbers

| Element | Value | Source / status |
| --- | --- | --- |
| Sidebar width | 260px default, via CSS variable `--sidebar-width` | Extension source `DEFAULT_LEFT_WIDTH = 260` sets `--sidebar-width` ([raulconchello/gpt-custom-sidebar-width](https://github.com/raulconchello/gpt-custom-sidebar-width)) |
| Right panel (canvas/side content) | 400px default | Same source, `DEFAULT_RIGHT_WIDTH = 400` |
| Conversation column max width | `--thread-content-max-width: 40rem` (640px) | Userscript targeting OpenAI's class ([gist alexchexes](https://gist.github.com/alexchexes/d2ff0b9137aa3ac9de8b0448138125ce)) |
| Composer radius | `border-radius: 28px` on `div[data-composer-surface="true"]` | Bug report, 2026-01-30 ([OpenAI community](https://community.openai.com/t/chrome-regression-chat-composer-input-clipped-when-container-uses-border-radius-overflow-clip/1372879)) |
| Composer max text height | `max-h-[25dvh]` then scrolls | Same gist |
| Theme choices | Light, Dark, System only; no accent or font choice | [aichroma.shop guide](https://aichroma.shop/how-to-change-chatgpt-theme) (secondary) |
| UI font on Windows | System stack (Segoe UI on Windows); OpenAI Sans is the brand face, not the UI face | Secondary only ([byteplus](https://www.byteplus.com/en/topic/410772), [ain.ua](https://en.ain.ua/2025/02/05/openai-updates-the-chatgpt-logo-font/)); treat as **unverified** |
| Surface hexes (for example `#212121`, `#171717`, `#F9F9F9`) | **Unknown.** Widely repeated, but no primary source was found | — |
| Title bar height, sidebar row height, motion durations | **Unknown** | — |

**Observed** (screenshots and use, not measured): the window has two surfaces only (sidebar a hair darker than the page, page white or near-black); no divider line is drawn when the sidebar is open and the colors differ; sidebar rows are single-line titles with no icons and no timestamps; the selected row is a soft grey fill, not a color; section labels are sentence case and small; the header over the conversation holds one left-aligned picker (text plus chevron) and a few right-aligned icons; the empty state is one short line of text above a vertically centred composer.

### 1.3 Keyboard (desktop, 2026)

From OpenAI's own reference ([learn.chatgpt.com commands](https://learn.chatgpt.com/docs/reference/commands)):

| Action | Windows | Clash with Code OSS? |
| --- | --- | --- |
| Command menu | Ctrl+K or Ctrl+Shift+P | **Ctrl+K clashes**: in Code OSS Ctrl+K is a chord prefix (Ctrl+K Ctrl+S, Ctrl+K Ctrl+T…). Ctrl+Shift+P matches. |
| Settings | Ctrl+, | Matches |
| Keyboard shortcuts reference | Ctrl+/ | **Clashes** with Toggle Line Comment in Code |
| Toggle sidebar | Ctrl+B | Matches VS Code exactly |
| New chat | Ctrl+N or Ctrl+Shift+O | Ctrl+N matches; Ctrl+Shift+O clashes with Go to Symbol |
| Find in chat | Ctrl+F | Matches |
| Search chats | no default binding | — |
| Quick chat | Ctrl+Alt+N | Unused in Code OSS defaults (not verified exhaustively) |

### 1.4 Why it reads as "clean"

1. **One focal object per screen.** The composer is the only bordered, raised control in the page area. Everything else is text on a flat surface. (Margin's equivalent is the caret on the page, not a box.)
2. **Two surfaces, no lines.** The sidebar/page boundary is made by a small tone step, not a rule. (Same as Margin's canvas/shell, M2.)
3. **Rows are words.** No per-row icons, counts or dates in the sidebar at rest. Actions (`…`) appear on hover.
4. **One picker, left-aligned, as text.** The only mode-like control in the header is a text label with a chevron, not a segmented control.
5. **Secondary destinations collapse under `…`.** The 26.924 build pushed five destinations out of view.
6. **Width is capped for reading.** 640px column regardless of window width.

### 1.5 Take / leave

| Take | Leave |
| --- | --- |
| Sidebar rows as single-line titles; hover-only `…` | The 28px pill composer radius (Margin's largest radius is 12) |
| Top-of-sidebar "New" and "Search" as plain rows, not a bordered field | Starter pills and suggestion chips (slop list: pills, chips) |
| Section heading reveals its controls on hover | The greeting line in the empty state (motivational copy) |
| One text-plus-chevron picker instead of a segmented control (see §6.1) | Ctrl+K as a single-key command menu (breaks Code chords) |
| Floating (overlay) sidebar on narrow windows | Auto-sorting that silently overrides the user's order |
| Ctrl+B sidebar, Ctrl+N new, Ctrl+, settings — identical to Code, so free wins | Merging modes in a way that hides the user's list (July 2026 backlash) |
| Two-surface palette, no divider when surfaces differ | Account avatar in the sidebar footer (slop list: avatars) |

---

## 2. Windsurf (now Devin Desktop) and Cursor, as Code OSS forks

### 2.1 Windsurf: identity and recent chrome changes

- **Windsurf is now Devin Desktop** (v3.0.12, 2026-06-02). Config and repo names still say `windsurf`; the CLI is `devin-desktop` ([Devin Desktop changelog](https://docs.devin.ai/desktop/changelog), [getting started](https://docs.devin.ai/desktop/getting-started)).
- Chrome changes recorded in the official changelog ([docs.devin.ai/desktop/changelog](https://docs.devin.ai/desktop/changelog)):
  - v3.1.7 (2026-06-10): "Added the Agent/Editor switch to the collapsed-sidebar titlebar." Settings pages "now scroll across the full panel width."
  - v3.5.17 (2026-07-17): "Hiding the status bar by default in the Agent Command Center." "Restyled the command palette."
  - v3.6.21 (2026-07-29): "Refreshed the agent window UI: Inter font by default, web-app icon set at web-app sizing, rounded pill session tabs."
  - v3.7.16 (2026-08-10): "left-aligned titlebar, unsaved-changes indicator on file tabs."
- **What this means:** Windsurf now runs two shells in one app: an agent-first window (Inter, web icons, pill tabs, no status bar, left-aligned title bar) and the classic Code OSS editor, with an Agent/Editor switch living in the title bar. That is structurally the same idea as Margin's Write | Code split. They made the calm shell the default and kept the IDE one switch away.
- Exact pixel sizes, theme hexes and the default theme name: **unknown** (no primary source; the product ships closed binaries and I did not install it).

### 2.2 Windsurf first run in detail

Two versions exist; both are documented.

**Classic Windsurf (2025 to mid-2026), four steps, about 3 to 5 minutes** ([baeseokjae setup guide](https://baeseokjae.github.io/posts/windsurf-setup-tutorial-2026/), [windsurf.directory](https://www.windsurf.directory/posts/windsurf_getting_started), [lowcode.agency](https://www.lowcode.agency/blog/windsurf-settings-customization)):

1. **Setup path:** `Start fresh`, `Import from VS Code`, or `Import from Cursor`. Import copies extensions, keybindings, settings.json, themes and snippets. It is one-way and does not change the VS Code install.
2. **Keybindings:** `VS Code` (default) or `Vim`.
3. **Theme:** dark, light or high contrast; changeable later.
4. **Account:** sign up or log in (required).

Missed the import? Command palette → `Import VS Code Settings` (same sources).

**Devin Desktop (June 2026 onward), three steps** ([docs.devin.ai getting started](https://docs.devin.ai/desktop/getting-started)):

1. **Theme and settings** on one screen; `Import Settings` is a collapsed section that also holds keybindings; a checkbox `Install devin-desktop terminal command` is **checked by default**.
2. **Log in** (required; API-key fallback).
3. **Start page** centred on the agent input, with `Open project`, `Clone repository`, `Connect via SSH`.

**What to learn:** they cut from four screens to three by folding keybindings into the import section, and the last screen is the real product, not a "You are all set" page. The import step is the only step that saves real time for a VS Code user.

### 2.3 Cursor

- Default activity bar is **horizontal** (at the top of the side bar), "to make room for chat"; Cursor adds `workbench.activityBar.orientation` and removes the GUI option to move it ([Cursor forum](https://forum.cursor.com/t/activity-bar-position/101806), [Cursor docs: VS Code migration](https://cursor.com/docs/configuration/migrations/vscode)). Margin's guide already does the same in Coding Tools (§4.6: activity bar at top of the shelf), which Code OSS 1.139 supports natively via `workbench.activityBar.location: "top"`.
- Cursor Settings is a separate surface (Ctrl+Shift+J) from VS Code Settings ([Cursor docs](https://cursor.com/docs/configuration/migrations/vscode)). **Leave:** two settings surfaces is the exact thing users complain about; Margin's §4.26 single restrained page with `All settings` at the bottom is better.
- Import: one button, `VS Code Import`, under Settings > General > Account; transfers extensions, themes, settings, keybindings ([Cursor docs](https://cursor.com/docs/configuration/migrations/vscode)).
- Themes: built-in `Cursor Dark` plus upstream `Default Light Modern` / `Default Dark Modern`; follow-OS via Auto Detect Color Scheme ([Cursor help: themes](https://cursor.com/help/customization/themes)).
- Cursor 3.0 (2026-04-02) added a separate **Agents Window**, "simpler… centered around agents, while keeping the depth of a development environment"; you "can switch back to the IDE anytime, or have both open simultaneously" ([Cursor 3.0 changelog](https://cursor.com/changelog/3-0), [blog](https://cursor.com/blog/cursor-3)). No layout numbers are published.

### 2.4 How the forks avoid looking like stock VS Code (pattern summary)

| Move | Windsurf / Devin | Cursor | Margin today (guide) |
| --- | --- | --- | --- |
| Calm default shell, IDE one switch away | Agent window default; Agent/Editor switch in title bar | Agents Window; switch back any time | Write layout default; Coding Tools toggle (§3) |
| Activity bar | kept in editor; icon returned in agent mode | horizontal at top | hidden; top-of-shelf in Coding Tools |
| Status bar | hidden by default in agent shell | kept | kept as footer |
| Title bar | left-aligned | kept, plus layout controls | centred mode control |
| UI font | Inter (agent window) | unknown | Segoe UI Variable |
| Tabs | rounded pill session tabs; unsaved dot | upstream | off in Write; pill when on |
| Import from VS Code | first-run step | settings button + first run | **none** (guide §4.28 forbids a first run) |

### 2.5 Take / leave

| Take | Leave |
| --- | --- |
| Calm shell as the default; full IDE through one switch in the title bar | Required sign-in; any account step |
| Import from VS Code as an optional first-run step, one-way, non-destructive | Importing extensions (Margin ships reviewed built-ins only; import settings and keybindings only) |
| Folding keybinding choice into the import step | A separate settings surface for product settings |
| Hide the status bar where it carries nothing (their agent shell) — Margin: hide it in Read when empty? see §6.1 | Inter as UI face (would make Margin look like a web app; Segoe UI Variable is the Windows-native choice) |
| Left-aligned title bar content | Web-app icon sizing in a desktop tool |
| Last onboarding screen = the real product | Checking a PATH/terminal option by default without asking (make it explicit and off if Coding Tools is off) |

---

## 3. Bare-bones benchmarks

### 3.1 Zed (open source; numbers from `assets/settings/default.json`, main branch, fetched 2026-09-27)

Source: [zed-industries/zed default.json](https://github.com/zed-industries/zed/blob/main/assets/settings/default.json).

| Setting | Default | Margin relevance |
| --- | --- | --- |
| `ui_font_family` | `.ZedSans` (aliases IBM Plex Sans) | A dedicated UI face at 16 |
| `ui_font_size` | **16** | Zed's UI text is larger than VS Code's 13 |
| `buffer_font_family` / size | `.ZedMono` (Lilex) / 15 | — |
| `theme` | mode `system`, light `One Light`, dark `One Dark` | Follow system by default |
| `minimap.show` | `never` | Same as Margin |
| `title_bar.show_menus` | `false` | Menus hidden, same as Margin's Alt menu |
| `tabs.file_icons` | `false` | **No file icons on tabs** |
| `tabs` close button | shown on hover | Same as guide |
| `status_bar.line_endings_button` | `false` | **Line endings hidden** |
| `status_bar.active_encoding_button` | `non_utf8` | **Encoding shown only when it is not UTF-8** |
| `status_bar.show_active_file` | `false` | — |
| `project_panel.default_width` | 240, docked **right**, entry spacing `comfortable` | 240 matches Margin's shelf |
| `centered_layout` | 0.2 / 0.2 padding | — |
| `active_pane_modifiers.border_size` | 0 | No active-pane border |

Onboarding (source: [crates/onboarding/src](https://github.com/zed-industries/zed/tree/main/crates/onboarding/src)): **one page**, max width 780px, headline `Welcome to Zed`, then sections for Theme (Light / Dark / System plus three live theme previews), `Import Settings` ("Automatically pull your settings from other editors"), `Base Keymap` (VS Code, Atom, Emacs, JetBrains, Sublime Text, TextMate, Cursor…), `Vim Mode`, telemetry toggles (usage data, crash reports), project trust, and a single filled `Finish Setup` button, 200px wide, **with its keybinding shown on the button**. Zed also lets new users switch off all AI in onboarding with one switch ([Zed blog](https://zed.dev/blog/disable-ai-features)).

Take: exception-only status items; no tab icons; one-page onboarding with a keyboard-labelled finish button; live theme preview. Leave: IBM Plex, right-docked project panel, user picture and sign-in in the title bar.

### 3.2 Windows 11 Notepad (the direct competitor on Margin's home turf)

- **Lightweight formatting** (May 2025): bold, italic, links, lists, headings, Markdown files; "switch between formatted Markdown and Markdown syntax views in the view menu or by selecting the **toggle button in the status bar**"; formatting can be turned off entirely in settings ([Windows Insider blog 2025-05-30](https://blogs.windows.com/windows-insider/2025/05/30/text-formatting-in-notepad-begin-rolling-out-to-windows-insiders/)). Tables followed in November 2025 ([blog 2025-11-21](https://blogs.windows.com/windows-insider/2025/11/21/notepad-update-begins-rolling-out-to-windows-insiders/)); strikethrough and nested lists in January 2026 ([blog 2026-01-21](https://blogs.windows.com/windows-insider/2026/01/21/notepad-and-paint-updates-begin-rolling-out-to-windows-insiders/)).
- **Welcome experience** (January 2026): a dismissible dialog giving "a quick overview of what's possible", reopened from a megaphone icon at the top right of the toolbar ([blog 2026-01-21](https://blogs.windows.com/windows-insider/2026/01/21/notepad-and-paint-updates-begin-rolling-out-to-windows-insiders/)).
- Notepad now has Copilot Write/Rewrite/Summarize behind a Microsoft account sign-in (same source). **This is Margin's clearest positioning line:** Notepad has formatting and AI; Margin has formatting and no AI.
- Take: the view toggle (formatted vs syntax) lives in the **status bar**, not the title bar. A re-openable, dismissible welcome. Leave: the megaphone icon, Copilot, Mica header (guide §2.9 already rejects Mica).

### 3.3 Apple Notes (macOS 26 Tahoe)

- Tahoe's Liquid Glass sidebars "subtly reflect your wallpaper" and toolbars became floating, rounded glass ([Apple support](https://support.apple.com/en-us/122868), [TechPowerUp](https://www.techpowerup.com/337895/apples-macos-26-tahoe-introduces-floating-transparent-liquid-glass-ui)). Reviewers flagged Finder's floating sidebar as a noisy "double bezel" ([Mac Observer](https://www.macobserver.com/news/macos-26-critics/), [Six Colors](https://sixcolors.com/post/2025/09/macos-26-tahoe-review-power-under-glass/)).
- Take: nothing new beyond guide §1.2 (list rows as title plus one line; open straight into a caret). Leave: floating/glass sidebars. The "double bezel" critique is direct evidence against Code OSS Modern UI floating cards (see §4).

### 3.4 Windows 11 type ramp (the tie-breaker for sizes)

Microsoft's Windows 11 ramp for Segoe UI Variable ([Microsoft Learn: Typography in Windows](https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/typography)):

| Style | Optical size | Size / line |
| --- | --- | --- |
| Caption | Small | 12/16 |
| Body | Text | **14/20** |
| Body strong | Text semibold | 14/20 |
| Body large | Text | 18/24 |
| Subtitle | Display semibold | 20/28 |
| Title | Display semibold | 28/36 |

The same page sets **minimums of 14px semibold and 12px regular** ("text smaller than these sizes and weights are illegible in some languages"), sentence case everywhere, and Semibold instead of Bold.

---

## 4. Local finding: Code OSS 1.139 Modern UI is on by default and floats the panels

Checked in this repo (`src/vs/workbench/browser/workbench.contribution.ts`, `src/vs/workbench/browser/media/floatingPanels.css`, `src/vs/workbench/browser/part.ts`):

- `workbench.experimental.modernUI` **defaults to `true`** (experiment mode `auto`). Its description: "the side bars and bottom panel are shown as floating cards with rounded corners and gaps… matching the Agents window design." `workbench.shadows` also defaults to `true`.
- `floatingPanels.css` draws cards with `--vscode-cornerRadius-large` and card margins from `--vscode-spacing-size40`.
- `part.ts` has `AREA_HEIGHT_MODERN_UI = 32` and a comment `KEEP IN SYNC WITH: modernUI/browser/media/padding.css`, but **`src/vs/workbench/contrib/modernUI/` is not in this tree** (`git ls-files | grep -i modernui` returns nothing). The guide cites `contrib/modernUI/browser/media/tabs.css` and `keyboardFocusOnly.css` (§4.10, §4.31); those paths do not exist here.

Consequence: out of the box, Margin's build shows floating cards with gaps and shadows — "floating cards on a grey dashboard" from the slop list, the Tahoe "double bezel", and a break of M2 (one sheet, one tray). Upstream is moving toward the agents-window look; Margin must opt out of the card layer on purpose and keep only the parts it wants.

---

## 5. Synthesis (a): Margin shell v2

Goal: ChatGPT-desktop calm at rest, VS Code power one keystroke away, Windows-native throughout.

```
┌── shell 240 ───────────────┬──────────────── canvas ─────────────────────────────┐
│ ◫   (shelf toggle)         │ A quieter morning  ·  Notes          Write ▾  …  │ ─ □ ✕
│                            │                                                     │
│ New note           Ctrl+N  │            A quieter morning                        │
│ Search             Ctrl+P  │            Leave the phone in the kitchen…          │
│                            │                                                     │
│ Drafts                     │                                                     │
│ A quieter morning  (tint)  │                                                     │
│ Ideas for the weekend      │                                                     │
│ Recent                  …  │   (… and chevron appear on heading hover only)      │
│ Kitchen notes.txt          │                                                     │
│                            │                                                     │
│                            │   Saved                         126 words · 1 min   │
└────────────────────────────┴─────────────────────────────────────────────────────┘
```

1. **Two surfaces, one boundary.** Keep canvas/shell and the full-height split (guide §2.2). ChatGPT proves the tone step alone can carry the boundary; keep the hairline only where the guide already allows it, and force Modern UI floating cards off (§4).
2. **Title bar = identity on the left, one quiet picker, overflow.** Left-align the document title (Windsurf v3.7.16 moved to a left-aligned title bar; ChatGPT's header is left-aligned). Replace the centred Write | Read | Code segmented control with a **text picker `Write ▾`** in the right group (ChatGPT's model picker pattern), opened by click, Ctrl+Alt+1/2/3 unchanged. A **second, always-visible cue** goes in the footer: the state word already there plus `Read only` in Read. Option B, if the owner wants to keep the segmented control: keep it but give its track no fill at rest (M7). Either way, nothing centred in the title bar competes with the H1 (M1).
3. **Shelf top = two rows, not a field.** `New note  Ctrl+N` and `Search  Ctrl+P` as ordinary 32px rows with the shortcut in ink2 right-aligned (ChatGPT's "New chat / Search chats" rows). Search opens the palette (§4.19). This removes the only bordered control in the tray.
4. **Section headings reveal controls on hover.** `Recent` shows `…` (Show all, Clear) and a collapse chevron only on hover or focus (ChatGPT 26.924). At rest the tray is words only.
5. **Rows stay single-line words.** Keep §4.7 rules; drop row icons in Drafts and Recent in the writing layout (ChatGPT, Zed tabs `file_icons: false`). Keep icons in the Coding Tools tree, where type matters.
6. **Floating shelf below 960px.** Already §3.3; ChatGPT for Windows shipped the same pattern.
7. **Footer as exception-only status.** In Coding Tools, show encoding only when not UTF-8 and line endings only when they differ from `files.eol` (Zed defaults). Language and indentation stay. In Write/Read, the footer is state (left) and count (right), nothing else.
8. **Power one keystroke away, with Code OSS keys.** Ctrl+P, Ctrl+Shift+P, Ctrl+B (shelf; also ChatGPT's key), Ctrl+` (terminal, auto-enters Coding Tools), Ctrl+Alt+3 (Code). Do **not** bind Ctrl+K alone or Ctrl+/ for a shortcut sheet (Code chords and Toggle Comment). Shortcut sheet stays Ctrl+K Ctrl+S.
9. **UI type at the Windows body size.** Shelf rows, menus, palette rows and buttons at Segoe UI Variable Text **14/20** (Windows Body), titles 14/20 semibold, labels 12/16. Code-dense surfaces (explorer tree 24px rows, terminal, keybinding table) may keep 13. Evidence: Windows ramp and minimums (§3.4), Zed UI 16. Row heights stay 32/44; 14/20 fits.
10. **No second visual language.** Do not import Inter, web icon sizes, pill composers or 28px radii. Windsurf's agent window shows what that looks like: a web app inside a Windows frame.

---

## 6. Synthesis (b): first boot

The guide (§4.28) says no welcome page. The new brief ("like ChatGPT app and Windsurf") and the evidence argue for a **short, optional** first boot, because the one thing that saves a VS Code user real time — importing keybindings and settings — has no other discoverable place. Notepad (January 2026) and Zed both ship one; both make it dismissible.

### 6.1 Rules

- Shown once, on the first launch only, as a full-window page on canvas (Zed pattern), not a modal and not a carousel. Content column 560px, left-aligned, top inset 88 (palette top offset). Title bar and caption buttons stay live.
- 3 steps, step text `1 of 3` in the label style (no dots, no progress bar).
- Keyboard-complete: Tab/Shift+Tab move, arrow keys move inside a choice group, **Enter = Continue** (the primary button shows `Enter`), **Esc = Skip setup** from any step (keeps defaults, lands in the draft). Alt+letter access keys on every button.
- Every choice applies live (theme and text size preview on this page).
- No sign-in, no account, no telemetry prompt unless Margin actually collects telemetry (then the toggle lives on step 3, off by default, in plain words).
- Reopen later from the command palette: `Show Setup` (no icon anywhere in the chrome; Notepad's megaphone is rejected).
- Copy in ASD-STE100 style: short sentences, present tense, one instruction per sentence, no metaphors, no "Welcome aboard".

### 6.2 Screens and copy

**Step 1 of 3 — Look**

- Heading (Display 28/36 semibold): `Margin`
- Line (Body 14/20 ink2): `Choose how the page looks. You can change this later in Settings.`
- `Theme`: segmented `System | Light | Dark` (default System).
- `Text size`: stepper `17` with a live sample paragraph set in the document typography below it.
- `Line width`: `Narrow | Standard | Wide`.
- Buttons: `Continue  Enter` (primary), `Skip setup  Esc` (text button).

**Step 2 of 3 — Bring your settings** (shown only if a VS Code, VSCodium, Cursor or Windsurf/Devin Desktop user folder is found; otherwise skipped and the counter reads `1 of 2`)

- Heading: `Use your VS Code settings?`
- Line: `Margin can copy your keyboard shortcuts and editor settings. Your VS Code files do not change.`
- Radio list: `Copy from VS Code` / `Copy from Cursor` / … (only found sources) / `Start with Margin defaults` (default).
- Checkboxes under the copy option: `Keyboard shortcuts` (on), `Editor settings` (on). A fixed line in ink2: `Margin does not copy extensions or AI settings.`
- Buttons: `Copy and continue  Enter`, `Back`, `Skip setup  Esc`.
- After copying: one line of result in place, for example `Copied 42 shortcuts and 18 settings. 6 settings do not apply to Margin.` with `Show details`.

**Step 3 of 3 — Where your notes live**

- Heading: `Where your notes live`
- Line: `New notes are drafts. Margin keeps them safe until you save them to a folder.`
- `Drafts folder` path (read only) with `Show in File Explorer`.
- `Open a folder…` (optional; secondary button).
- `Coding tools`: toggle `Show coding tools` (off). Line: `Adds files, search, source control and a terminal.`
- `Open .md and .txt files with Margin`: button `Open Default Apps` (Windows 11 requires the user to set defaults in Settings; the button opens that page).
- Buttons: `Start writing  Enter` (primary). This lands in a new draft with the caret on the first line (guide S01 unchanged).

The existing one-time footer hint (`Ctrl+O to open a file`, §4.28) stays for the session after setup.

---

## 7. Synthesis (c): conflicts with the current DESIGN-GUIDE

| # | Guide says | Evidence | Proposed change |
| --- | --- | --- | --- |
| C1 | §4.10, §4.31: turn on `workbench.experimental.modernUI` for pill tabs and keyboard-only focus; cites `contrib/modernUI/browser/media/*.css` | In 1.139 Modern UI **defaults to on** and draws floating cards with gaps and shadows; the cited `contrib/modernUI` folder is not in this tree (§4) | Set `workbench.experimental.modernUI: false` and `workbench.shadows: false` in Margin defaults, or keep it on and zero the card margins, radius and shadow for Margin themes. Port pill-tab and focus-only CSS into a Margin-owned file. Fix the dead paths. Engineering decision; affects T-order in IMPLEMENTATION-MAP. |
| C2 | §2.3: Title 13/18 **semibold**; Body 13/20; Caption 11/14 | Windows ramp Body is 14/20; minimums are 14px semibold and 12px regular (§3.4). Zed UI is 16. | UI Body 14/20, Title 14/20 semibold, Label/Caption 12/16. Keep 13 only for Code-dense surfaces (tree, terminal-adjacent, tables). Remove the 11px caption; keycaps at 12. |
| C3 | §4.5: segmented Write/Read/Code, the only centred control in the title bar | ChatGPT uses one left-aligned text picker; Notepad puts its formatted/syntax toggle in the status bar; Windsurf left-aligned its title bar. A centred segmented control is the loudest chrome object (M1 risk). | Text picker `Write ▾` in the right group (or Option B: segmented control with no track fill at rest). Title group left-aligned. |
| C4 | §4.28: "There is no welcome page… No… walkthrough… theme picker" | Owner brief now cites ChatGPT/Windsurf; Windsurf, Cursor, Zed and Notepad (Jan 2026) all ship a first run; VS Code import has no other home | Replace §4.28 with §6 here: 3 optional, skippable, keyboard-complete steps; no sign-in; lands in S01. |
| C5 | §4.7: find field (32 tall, bordered) at the top of the shelf | ChatGPT uses plain `New` / `Search` rows | Two 32px rows with shortcuts; no bordered field in the tray. |
| C6 | §4.7: sections always expanded, no header chevrons in writing | ChatGPT 26.924: heading hover reveals collapse, `…`, `+` | Keep expanded by default; reveal chevron and `…` on heading hover/focus (M7). |
| C7 | §4.18: Coding Tools footer always lists encoding, EOL, indentation, language | Zed hides EOL and shows encoding only when non-UTF-8 | Exception-only: encoding if not UTF-8, EOL if it differs from `files.eol`. |
| C8 | §2.4: shelf rows 32 with icon 16 + 10 gap | ChatGPT and Zed tabs: no per-row icons | No icons in Drafts/Recent rows in the writing layout; keep them in Folders and the Coding Tools tree. |
| C9 | §1.2 reference table has no entry for ChatGPT, Windsurf, Zed | Owner brief | Add rows (take/leave from §1.5, §2.5, §3.1). Update the Notepad row: Notepad now has Markdown formatting, a status-bar view toggle and Copilot. |
| C10 | §2.4: shelf 240 | ChatGPT 260; Zed project panel 240 | **No change.** 240 is fine; recorded so nobody "fixes" it to 260. |
| C11 | Palette shortcuts only Ctrl+P / Ctrl+Shift+P | ChatGPT uses Ctrl+K as command menu | **No change.** Do not add Ctrl+K; it breaks Code chords. Note in §4.19 so it is a decision, not an omission. |

---

## 8. Synthesis (d): the 15 highest-impact moves, ranked

1. **Kill the floating-card layer.** Default `workbench.experimental.modernUI: false` and `workbench.shadows: false` (or zero the card margins/radius/shadow), and fix the guide's dead `contrib/modernUI` paths. Without this, every other move sits on a grey dashboard. (C1)
2. **Raise UI body text to 14/20** and remove the 13px semibold and 11px sizes on Margin-owned surfaces. Single largest "feels like a Windows app, not an IDE" change. (C2)
3. **Replace the centred segmented control with a quiet `Write ▾` picker** and left-align the title group. (C3)
4. **Ship the 3-step optional first boot** with Enter/Esc, live preview, and VS Code settings/keybinding import (no extensions). (C4, §6)
5. **Shelf top as `New note` / `Search` rows**, no bordered field. (C5)
6. **Heading-hover controls** on shelf sections; nothing interactive shows at rest. (C6)
7. **No icons in writing-layout shelf rows.** (C8)
8. **Exception-only footer in Coding Tools** (encoding, EOL). (C7)
9. **Keep Code OSS keys and document the rejections** (no Ctrl+K alone, no Ctrl+/ sheet); advertise Ctrl+B, Ctrl+N, Ctrl+, which match ChatGPT for free. (C11)
10. **Hide tab file icons** when tabs are on (Zed default), unsaved dot replaces close (Windsurf v3.7.16, guide §4.10 already close).
11. **`Show Setup` command** to reopen first boot; no chrome icon for it.
12. **Positioning line against Notepad** in About and first boot copy: formatting, source view and folders, and no AI. (Copy only; no marketing inside the app beyond one line.)
13. **Protect the shelf across modes.** Coding Tools adds the activity row above the shelf; it never replaces Drafts/Recent (ChatGPT July 2026 backlash).
14. **Live theme and text-size preview** on step 1 using the real document CSS, not a screenshot (Zed's live previews).
15. **Update the guide's reference table** (§1.2) with ChatGPT, Windsurf/Devin, Zed and the 2026 Notepad facts, so future reviews argue from the same evidence. (C9)

---

## 9. Open questions (need the owner or a device)

- Real ChatGPT desktop metrics (title bar height, row height, surface hexes, motion): capture from the installed Windows app with a screen ruler; none are guessed here.
- Windsurf/Devin Desktop and Cursor theme hexes and fonts in the classic editor: install both in a throwaway profile and read `product.json` and bundled theme JSON.
- Does Margin collect any telemetry? Step 3's toggle depends on it.
- Which import sources to detect on Windows: `%APPDATA%\Code\User`, `%APPDATA%\VSCodium\User`, `%APPDATA%\Cursor\User`, `%APPDATA%\Windsurf\User` are the expected folders (Code OSS convention; **not verified** for Cursor/Windsurf/Devin Desktop on this machine).

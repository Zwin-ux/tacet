# Tacet 1.0 quality bar

Status: draft for coordinator review, 2026-09-27. This file is the one measurable definition of "high quality" for Tacet 1.0, with a gap audit against the evidence in the repository on this date.

Precedence: `SHIP-PLAN.md`, `docs/10-REBUILD.md`, `docs/02-DOCUMENT-CONTRACT.md` and the gates in `docs/07-EXECUTION.md` still win. This file does not change a gate. It gives each promise a number, a way to measure it, and an owner milestone. Budgets that come from `docs/08-ACCEPTANCE.md` are marked **(08)**. New budgets are marked **(proposed)** with a one-line reason. A missed budget is changed only by an owner decision written here, never by editing a test.

## 0. How to read this file

**The bar in one line.** A stranger downloads Tacet, double-clicks a `.md`, writes, closes the lid, and never loses a character. It opens as fast as they expect, it does not look like VS Code, and it never talks to the network or to a model.

**Requirement format.** Each row has an ID `QB-<AREA>-N`, a target (a number or a pass/fail check), the measuring tool, the current status with evidence, and the milestone that owns it.

**Status words.**

| Word | Meaning |
| --- | --- |
| PASS | A receipt in `tacet/evidence/` shows it passes on the current branch. |
| FAIL | A receipt shows it fails. |
| PARTIAL | Part of the requirement has a passing receipt. The rest has none. |
| NOT TESTED | The feature exists, but no receipt covers it. |
| NOT BUILT | The feature does not exist yet. |

**Reference machine.** The owner's HP Victus: 16 GB RAM, Windows 11 Home 10.0.26200, x64. Record CPU model, storage, power mode (Balanced, on AC), display scale and binary hash in every performance receipt. Windows 11 Home has no Hyper-V and no Windows Sandbox. Tests that need OS-level input or a hard power-off run in a disposable VirtualBox VM, or on a GitHub Actions `windows-latest` runner after the repository is public (M11).

**Build under test.** Every number in §3 must come from a **release build** (`gulp vscode-win32-x64-min` plus the installer), not the dev build (`scripts\code.bat`, unminified `out/`). No release build exists today. All current timings are dev-build timings and are labeled so.

**Evidence snapshot used for this audit.**

| Evidence | What it proves |
| --- | --- |
| `evidence/r1b-finish-3-smoke.json` (2026-09-28 06:30Z) | launch, writingLayout, richEditor, typeSave, undo, terminal, noGit PASS; **typingCases FAIL** (`after-heading`) |
| `evidence/m3-first-boot.json` (2026-09-28 02:02Z) | first-boot cases a, b, c, d all PASS |
| `evidence/r1b-finish-3-*.png`, `evidence/m3-*.png` | current look of the window, first boot, landing, second launch |
| `evidence/r1b-finish-3-launch.log` | startup log of the latest smoke run |
| `evidence/w1-ai-inventory.md` | the static AI-removal inventory (2026-09-24) |
| `tools/smoke.mjs`, `tools/first-boot.mjs` | the only automated gates today |
| `git log 2242ebbb..HEAD` | 36 commits on top of Code OSS 1.139.0 |

---

## 1. Never lose text (QB-DUR)

This is promise number one. Tie-in: gate **G2** (M5), acceptance **A03, A04, A05, A09 to A12, A16, A18, A22**, contract **D-03 to D-14, D-21 to D-24**. At M5, M6 and M9, an adversarial reviewer tries to lose text for one full session. Every finding needs a repro and becomes a fixture in `tools/durability.mjs`.

| ID | Requirement and target | Measured by | Status and evidence | Milestone |
| --- | --- | --- | --- | --- |
| QB-DUR-1 | **Checkpoint window.** Typed text is in recovery storage within **500 ms p95, 1,000 ms max** **(08, D-22)** after the keystroke. | `tools/durability.mjs` kill matrix (§12 C1): the loss window is measured, not assumed. | **FAIL by design.** Upstream schedules backups 1,000 ms after the last change (`src/vs/workbench/services/workingCopy/common/workingCopyBackupTracker.ts:91-93`, `default: 1000`, `delayed: 2000`). The floor of the loss window is therefore about 1 s plus the write time. | M5 |
| QB-DUR-2 | **Renderer kill (A11).** After 50 kills at random points while typing, the recovered text is always a prefix of what was typed, and never loses more than the QB-DUR-1 window. 0 corrupt or duplicate drafts. | C1, `renderer` target | NOT TESTED | M5 |
| QB-DUR-3 | **Main process and extension host kill (A11).** Same target as QB-DUR-2 for each process type. The rich editor is a webview custom editor: its backup path must be proven separately from Monaco's. | C1, `main` and `exthost` targets | NOT TESTED. No receipt shows that a dirty rich-editor document takes part in hot exit. | M5 |
| QB-DUR-4 | **Normal close and relaunch.** Close with drafts and dirty files, then relaunch: every draft is back, with its text, title and caret. 0 extra empty drafts (D-07). | C2 `tools/relaunch.mjs` | **FAIL (unexplained).** First-boot case a types `Caret ready.` into `untitled:Untitled-1`, closes the app, and relaunches the same profile. `m3-a-second-launch.png` shows an empty window, with no draft and no caret. The harness uses `--new-window` and CDP `Browser.close` (`tools/first-boot.mjs:161-168, 180-192`). These can explain it, but a user sees their text gone. Diagnose before any M4 work. | M5 (diagnose now) |
| QB-DUR-5 | **Power loss.** "Saved in Drafts" is shown only after the backup write is flushed to disk. After 10 hard power-offs in a VM, 0 corrupt backups and 0 lost acknowledged text. | Code review of the backup write path (flush before acknowledgement), plus the manual VM test in C1 `--power` | NOT TESTED | M9 |
| QB-DUR-6 | **Save failure (A04, D-24).** Save to a read-only file, a locked file, a full disk, or a folder without permission: the text stays in the editor, `Couldn't save` shows, the document stays dirty, and `Save a Copy` works. | C1 `save-fail` cases: `attrib +R`, an exclusive handle held by the harness, a small VHD filled to 100 % (VM) | NOT BUILT (no save-failure surface yet) | M5 |
| QB-DUR-7 | **External change (A09, A10, D-10, D-11).** A clean external change reloads the file. An external change while the document is dirty pauses autosave and shows `Changed outside Tacet`. Both versions stay recoverable. A save that races an external write never overwrites it silently. | C1 `external` cases: the harness writes the file with and without local edits, and inside the save window | NOT TESTED | M5 |
| QB-DUR-8 | **Cloud folders.** In a OneDrive folder, saving a file, a sync conflict (`name-PCNAME.md`), and opening a cloud-only placeholder never lose text. A placeholder that cannot be read says so; it never opens as empty. | Manual script on a OneDrive-linked VM account; C1 cannot fake Files On-Demand | NOT TESTED. Only the honesty line exists: case d shows `Documents is synced by OneDrive. Your notes will sync too.` (`m3-d-2-notes-onedrive.png`). | M9 |
| QB-DUR-9 | **Read-only files.** A file with the read-only attribute opens with the `Read-only file` state. Typing is refused at the model boundary. Nothing tries to write. | C3 `tools/fidelity.mjs`, `readonly` fixture | NOT TESTED | M5 |
| QB-DUR-10 | **Huge files (A16).** Files of 1, 10 and 100 MiB and a 1,000,000-line `.txt` open without truncation. Saving one with a one-character edit changes only that character. Files over the rich-editor limit (start: 1 MiB or 20,000 lines, contract §9) route to Code with a one-line notice. | C3 `size` fixtures, SHA-256 and byte diff | NOT TESTED | M6 |
| QB-DUR-11 | **Byte identity (A05, D-08).** For every file in the corpus (08 §Corpus): open, switch Write → Code → Read → Write, then type one character and delete it, then save. The SHA-256 is unchanged. BOM, EOL, final newline, trailing spaces and front matter are kept. | C3 | NOT TESTED. The smoke test checks one LF UTF-8 fixture only (`tools/smoke.mjs:36`). | M6 |
| QB-DUR-12 | **Minimal edits.** A one-word edit in Write changes only that word's byte range. The rich editor never re-serializes untouched blocks. | C3 `minimal-diff` | NOT TESTED | M6 |
| QB-DUR-13 | **Encodings (D-09).** UTF-16 LE/BE with BOM, Windows-1252, Shift-JIS and GB18030 open, edit and save in their own encoding. U+FFFD is never written over the original. A binary file shows a non-editing notice. | C3 `encoding` fixtures | NOT TESTED | M6 |
| QB-DUR-14 | **Line endings.** CRLF and LF files keep their EOL. A **mixed-EOL** file shows the "unusual line endings" notice (guide A15) **before** the first edit, because Monaco's text model keeps one EOL per document and normalizes on load. The user decides; Tacet never converts silently. | C3 `eol-mixed` | NOT TESTED; known upstream behaviour makes this a real risk | M4 (notice), M6 (test) |
| QB-DUR-15 | **Paths (A18, D-12, D-14).** Unicode, spaces, over 260 characters, UNC (`\\localhost\c$\...`), case-only rename, symlinks and removable drives: honest state, no identity confusion, no write through a changed symlink. | C3 `paths` + C12 | NOT TESTED | M8 |
| QB-DUR-16 | **Draft Save As (A03, A12, D-03 to D-05).** Cancel keeps the draft. Success moves identity and the latest edit. A crash during Save As leaves either the draft or the file complete, never neither, and never two silently diverging copies. | C1 `save-as` + kill during save | NOT BUILT | M5 |
| QB-DUR-17 | **No writes on open (D-13).** Opening, reading and switching views writes 0 bytes to the user's file and creates 0 files next to it (no `.margin/`, no `.vscode/`). | C3: directory snapshot (names, sizes, mtimes) before and after | NOT TESTED | M5 |
| QB-DUR-18 | **Adversarial review.** A reviewer spends one session per milestone trying to lose text, with a written log. Result: 0 open data-loss findings at M5, M6 and M9. | `evidence/<milestone>-lose-text-review.md` | NOT DONE | M5, M6, M9 |

---

## 2. Typing feel and correctness (QB-TYPE)

| ID | Requirement and target | Measured by | Status and evidence | Milestone |
| --- | --- | --- | --- | --- |
| QB-TYPE-1 | **View equals disk.** After every typing case, the rich editor's text (`.md-editor` EditContext) equals the bytes on disk and the text model. 0 divergences in 20 consecutive smoke runs **(proposed: a single divergence is a data-loss bug in waiting)**. | `tools/smoke.mjs` typing cases (`:156-232`); C4 fuzz | **FAIL.** `after-heading`: disk `# Smoke note title\n…`, shown `# Smoke note titlex\n…` (`r1b-finish-3-smoke.json`). A stray `x` is in the view and not on disk. Contract §2: "Displayed and saved versions must match." | M6 (fix now: it blocks a green smoke) |
| QB-TYPE-2 | **First character lands in place.** A key chord (Ctrl+End, Ctrl+Home, End) and then immediate typing puts the first character after the caret target, never before the trailing newline. | `smoke.mjs:315-322` (`typeSave`); C4 at 0 ms and 10 ms gaps | PASS in the latest run (`r1b-finish-3-typed.png`: `Last line of the note.↵ Typed by the smoke gate.`). It was a known regression, so it needs the 20-run flake check in QB-ENG-10. | M6 |
| QB-TYPE-3 | **No dropped or reordered keys.** 2,000 characters at 0 ms and 10 ms gaps, at the start, middle and end of a 50 KiB document: the text on disk equals the sequence sent. | C4 | PARTIAL: 6 of 7 smoke cases at 10 ms pass on a 100-byte fixture | M6 |
| QB-TYPE-4 | **IME and composition (A14, D-18).** Microsoft Japanese IME, Chinese Pinyin and Korean IME, the emoji panel (Win+.), US-International dead keys and AltGr: composition, commit, cancel, undo, save and reopen are correct in Write and Code. | Automated: the CDP composition case (`smoke.mjs:190-208`). Manual: `tools/ime-script.md` checklist in the VM, since CDP `Input.imeSetComposition` is not a real IME. | PARTIAL: the CDP composition case passes (`r1b-finish-3-smoke.json` `composition: PASS`). No native IME test. | M6 |
| QB-TYPE-5 | **RTL, combining marks and emoji (A14).** Arabic mixed with English, Hebrew, combining accents, ZWJ emoji and flags: caret movement, selection, Backspace and Delete act on whole grapheme clusters, and bytes round-trip. | C4 `unicode` cases; C3 byte check | NOT TESTED | M6 |
| QB-TYPE-6 | **Undo granularity.** For the same key sequence, Write and Code make the same undo stops (parity). One Ctrl+Z never removes less than one word or more than one sentence **(proposed: this matches what Notepad and Monaco users expect)**. Undo is shared across views (D-15). | C4 `undo` cases: count Ctrl+Z presses to return to the original bytes | NOT TESTED. Smoke presses Ctrl+Z 40 times blindly (`smoke.mjs:331-334`), so it cannot see granularity. | M6 |
| QB-TYPE-7 | **Caret and scroll stability across views (A06, D-16, guide §13.4).** Write → Code → Read → Write: the source offset of the caret is unchanged, the first visible line moves by at most 1 line, and no character's box moves by more than 0 px in Write ↔ Read. | C4 `views` + C8 box diff | NOT BUILT (no mode picker yet) | M6 |
| QB-TYPE-8 | **Input latency.** Keypress to next paint in a 50 KiB Markdown file: Write **p95 ≤ 32 ms (08)**; Code **p95 ≤ 16 ms (proposed: plain Monaco has no webview hop; one 60 Hz frame is the honest target)**. No main-thread stall over 100 ms **(08)**. | C4 latency mode: Event Timing API (`PerformanceObserver` type `event`) in the workbench and inside the webview's `#active-frame`. Manual cross-check at M9 with Typometer against Notepad and VS Code. | NOT MEASURED | M9 (first number at M6) |
| QB-TYPE-9 | **Markers do not move text (guide §4.12).** Revealing Markdown markers on the caret's block shifts no text horizontally. A visible hard-break glyph (`↵` in `r1b-finish-3-typed.png`) is a design decision to record, not an accident. | C8 box diff: text boxes before and after the caret enters a block | NOT TESTED | M6 |
| QB-TYPE-10 | **Nothing changes text by itself.** No autocorrect, no smart quotes, no format on save, no trim on save unless the user set it (CRITICISM §9.3). Typing a sequence produces exactly those characters, plus list continuation only after Enter. | C4: 200 random printable sequences, disk equals input | NOT TESTED. The import step can copy `files.trimTrailingWhitespace: true` from VS Code (case c). This is correct: the user chose it. | M6 |
| QB-TYPE-11 | **Spelling (opt-in).** With `tacet.spelling.enabled`, squiggles appear in Write prose only. 0 automatic changes. Off by default. | C4 + C8 | NOT BUILT (`spellcheck: false` in `windows.ts`, FIRST-BOOT §6) | M6 |

---

## 3. Performance (QB-PERF)

Budgets must be met on a release build on the reference machine. `tools/perf.mjs` (§12 C5) measures Tacet, Windows Notepad, Notepad++ (if installed) and VS Code stable **in the same run**, so the comparisons are fair on the same day and hardware. Published numbers go in the release notes (R12).

| ID | Requirement and target | Measured by | Status and evidence | Milestone |
| --- | --- | --- | --- | --- |
| QB-PERF-1 | **Cold start to caret** (new process, file cache warm, empty draft): **p95 ≤ 1.5 s over 20 launches (08)**. The end point is the `margin/caretReady` performance mark: the draft editor has focus and a probe key reaches the model. | C5 `cold` | NOT MEASURED on a release build. Dev build only: 6,975 ms to `.monaco-workbench` and 8,038 ms to the first setup frame (`m3-first-boot.json` case a). The smoke log shows about 4 s from launch to extension host start (`r1b-finish-3-launch.log`). Dev timings are not comparable. | M9 (baseline at M4) |
| QB-PERF-2 | **True cold start** (first launch after a reboot): **p95 ≤ 3.0 s over 5 reboots (proposed: disk-cold Electron cannot match 1.5 s; this is still well inside VS Code territory)**. | C5 `reboot` (VM) | NOT MEASURED | M9 |
| QB-PERF-3 | **Warm open.** With Tacet running, `margin note.md` (50 KiB) or a double-click puts the caret in the file in **p95 ≤ 300 ms over 30 opens (08)**. | C5 `warm` | NOT MEASURED | M9 |
| QB-PERF-4 | **Idle memory.** One note open, 60 s idle: combined private working set of every process in the tree **≤ 350 MiB (08)**; stretch **≤ 250 MiB (proposed: git, debug, AI and marketplace are deleted, so Tacet must beat VS Code with the same file by a clear margin)**. Always report each process. | C5 `memory` (Win32_Process tree + `Win32_PerfFormattedData_PerfProc_Process.WorkingSetPrivate`) | NOT MEASURED | M9 |
| QB-PERF-5 | **Ten documents** (about 1 MiB total): **≤ 550 MiB (08)**. 100 open and close cycles: growth under 5 % after the first 10 **(proposed: bounded caches)**. | C5 `memory --docs 10 --cycles 100` | NOT MEASURED | M9 |
| QB-PERF-6 | **Idle CPU and disk.** 10 minutes idle: average CPU across the tree **≤ 0.2 % of one core**, 0 disk writes after 30 s of idle without edits **(proposed: Notepad-class idle; any periodic work is a removed-service leak)**. | C5 `idle` (`\Process(*)\% Processor Time`, `IO Write Bytes/sec`) | NOT MEASURED | M9 |
| QB-PERF-7 | **Large files.** A 1 MiB `.md` in Write is ready in **≤ 1.0 s**; a 10 MiB `.txt` in Code in **≤ 1.5 s**; typing latency in the 1 MiB file **p95 ≤ 50 ms** **(all proposed: VS Code-class numbers; stricter needs data first)**. | C5 `large` + C4 latency | NOT MEASURED | M9 |
| QB-PERF-8 | **Find.** Ctrl+P over 1,000 notes: results in **≤ 150 ms**. Content search over 10,000 small files: first results in **≤ 500 ms**, cancellable (08). | C5 `search` | NOT BUILT (M7) | M7 |
| QB-PERF-9 | **Installer size.** x64 installer **≤ 90 MB** and installed size **≤ 350 MB** **(proposed: VS Code's installer is about 100 MB with far more features; measure VS Code in the same run and require Tacet to be smaller)**. | C5 `size`: installer bytes, installed tree bytes | NOT MEASURED (no installer) | M10 |
| QB-PERF-10 | **No regression.** Each milestone's C5 run is within 10 % of the previous run on every metric, or the change is explained in the receipt **(proposed)**. | C5 compares with the previous `evidence/*-perf.json` | NOT STARTED | M4 onward |

Honest framing (08): an Electron app cannot be called "as small as Notepad" without numbers. The public claim is "opens in under X s and uses Y MB on a 16 GB laptop", using the measured values.

---

## 4. Visual design and identity (QB-VIS)

Gate phrase (M2): **a stranger shown a screenshot does not say "VS Code".** Measured two ways: the automated tell detector (§12 C8), and a stranger test (5 people who use Windows, shown the 1440 light screenshot for 5 seconds, asked "What app is this?"). Pass: **0 of 5 say VS Code or "a code editor" (proposed)**.

### 4.1 Guide §13 checklist as requirements

Run on every screen, at 1440 × 900 and 480 × 360, in light, dark and Tacet High Contrast Light, at 100 % and 200 % scale.

| ID | Check (guide §13) | Measured by | Status and evidence | Milestone |
| --- | --- | --- | --- | --- |
| QB-VIS-1 | The first line of the document is the most prominent thing on screen (M1). | C8: the H1 or first line has the largest rendered text and the most ink contrast; no chrome element is larger | FAIL: the floating lock/pencil pill with a shadow competes with the title (`r1b-finish-3-launch.png`) | M4 |
| QB-VIS-2 | At most three greys: canvas, shell, sunken (M6). | C8 pixel histogram of chrome regions against `design/tokens.json` (tolerance ΔE ≤ 2) | NOT TESTED | M4 |
| QB-VIS-3 | Every blue is the caret, focus, selection, a link, a checked state or the active location (M4). | C8 blue-pixel regions mapped to DOM roles | FAIL: the shelf-toggle codicon is drawn blue at rest (every screenshot) | M2 |
| QB-VIS-4 | Write → Read → Code → Write moves no character (M3). | C8 box diff (QB-TYPE-7) | NOT BUILT | M6 |
| QB-VIS-5 | Save, edit, failed save: the state is in the same place, at the same width, in words (M5). | C8 + C1 save-fail screenshots | NOT BUILT (no dirty dot or title state yet) | M4 |
| QB-VIS-6 | Tab through everything: focus is always visible and never clipped. | C10 focus traversal | PARTIAL: visible 2 px rings on first-boot rows (`m3-2-import.png`, `m3-4-extras.png`); workbench not tested | M4 |
| QB-VIS-7 | 480 × 360, 200 %, Contrast Theme Aquatic: every control is reachable. | C10 + C8 matrix | NOT TESTED | M4 |
| QB-VIS-8 | Reduced motion on: nothing slides. | C9 | PASS for first boot (`m3-first-boot.json` case d: `stepChangeMs: 3`, opacity 1, mark `mm-fade 0.2s`); workbench not tested | M3b, M4 |
| QB-VIS-9 | No fill, border or badge at rest that is not earned (M7). | C8 idle-state DOM scan | FAIL: the pill (above); the Monaco scrollbar track shows as a full-height grey strip on an empty draft (`m3-5-landing.png`, right edge) | M4 |
| QB-VIS-10 | A stranger can read every label aloud and know what it does. | C11 copy lint + stranger test | FAIL: `PROBLEMS`, `OUTPUT`, `EXPLORER`, `FIXTURES`, `powershell`, `Untitled-1`, `Plain Text` (§9) | M4 |
| QB-VIS-11 | Text column: max 680 px measure, centered, 56 px top inset, at least 32 px side (24 compact) (guide §2.4, §4.12). | C8: bounding box of the first paragraph | FAIL: the new draft's caret is flush against the left edge with no page margin (`m3-5-landing.png`, `m3-c-5-landing-dark.png`). In the rich editor, the H1 rule runs across most of the window, far past 680 px (`r1b-finish-3-launch.png`). The working tree has uncommitted edits to `centeredViewLayout.ts` and `layout.ts` that may address this; there is no receipt yet. | M2 |
| QB-VIS-12 | Opening the shelf never moves page text (guide A4). | C8 box diff, shelf closed vs open | FAIL: text moves right when the side bar opens (compare `r1b-finish-3-launch.png` with `r1b-finish-3-writing.png`) | M4 |
| QB-VIS-13 | The Tacet document theme is applied in Write and Read (guide §5). | C8: `.md-editor` has class `md-theme-tacet`; computed H1 font is Segoe UI Variable Display 600 | FAIL: no file under `extensions/markdown-language-features` references `md-theme-tacet`. The rich editor still uses the upstream theme (H1 with a bottom rule, wide measure). | M2 |

### 4.2 VS Code tells visible in the current screenshots

Each tell is a C8 assertion. All must be gone at M4, except where the Milestone column says otherwise.

| # | Tell | Where seen | Fix owner | Milestone |
| --- | --- | --- | --- | --- |
| T1 | Window title `note.md - fixtures - Code - OSS Dev`, `Setup - Code - OSS Dev`, `Untitled-1 - Code - OSS Dev`, `Code - OSS Dev` | every screenshot; `r1b-finish-3-smoke.json` `windowTitle` | eng. `product.json` `nameShort`/`nameLong` = Tacet is uncommitted in the working tree. `applicationName`, `dataFolderName`, `win32MutexName` and `urlProtocol` are still `code-oss` / `.vscode-oss` / `vscodeoss`. Target title: `note.md - Tacet`, with no folder segment and no `Dev` in release. | M2 |
| T2 | Centered window title text | every screenshot | eng: left-aligned document title with title menu (guide A3) | M4 |
| T3 | Title-bar editor actions: split editor, close editor (×), `…` | every workbench screenshot | eng. `workbench.editor.editorActionsLocation: "hidden"` is in `extensions/tacet/package.json:29` but not proven in a screenshot. | M2 |
| T4 | Shelf toggle is the codicon `layout-sidebar-left`, tinted blue | every screenshot | eng + design: Tacet `shelf` glyph, ink2 (guide §10.3) | M2 |
| T5 | No Tacet mark in the title bar (guide §4.2: mark at x = 16) | every screenshot | eng | M2 |
| T6 | Floating lock/pencil pill with a shadow over the document (upstream `.md-readonly-toggle`) | `r1b-finish-3-*.png` | eng: hide it; the view lives in `Write ▾` (guide §4.14) | M2 |
| T7 | H1 with a full-width bottom rule (VS Code preview look) | `r1b-finish-3-launch.png` | eng: wire `md-theme-tacet.css` | M2 |
| T8 | New draft is Monaco plain text, caret flush left, no `Start writing.` placeholder | `m3-5-landing.png` | eng + design (guide §4.12, FIRST-BOOT §7) | M4 |
| T9 | Draft named `Untitled-1`, language `Plain Text` | window title; `m3-c-5-landing-dark.png` status bar | eng: `Draft` (contract §2, D-02); a new note is Markdown or plain by setting | M4 |
| T10 | Side bar is the VS Code Explorer: `EXPLORER`, `FIXTURES`, `OUTLINE` in uppercase, `…` header, colored Seti Markdown icon | `r1b-finish-3-writing.png` | design + eng: the shelf (guide A4, §10.4; slop list: "tiny uppercase grey labels") | M4 |
| T11 | Panel: `PROBLEMS OUTPUT TERMINAL` uppercase tabs; `powershell` picker, +, split, trash, `…`, maximize, close | `r1b-finish-3-terminal.png` | eng: Code-mode terminal surface (guide §4.17); remove Problems and Output from the writing product | M4 |
| T12 | Terminal shell-integration decorations (green and grey dots before prompts) | `r1b-finish-3-terminal.png` | design decision: hide in 1.0 **(proposed: they are IDE language)** | M4 |
| T13 | Status line, when on, is the full VS Code status bar: ⊗ 0 ⚠ 0, `Ln 1, Col 1`, `Spaces: 2`, `UTF-8`, `CRLF`, `{ } Plain Text`, bell | `m3-c-5-landing-dark.png` | eng: Tacet footer (guide §4.18): state on the left at the column edge, words on the right | M4 |
| T14 | Empty window with no document after relaunch | `m3-a-second-launch.png` | eng: last document or a new draft (P-01); at minimum `No document open.` (guide §4.29) | M4 (after QB-DUR-4) |
| T15 | Palette command named `Tacet: Show Setup` (category prefix) | FIRST-BOOT §12 | eng: `Show setup` **(proposed: sentence case, no category prefix in Tacet-owned commands)** | M4 |
| T16 | Scrollbar track visible at rest on an empty page | `m3-5-landing.png` | eng: overlay scrollbars, hidden at rest (guide §4.30) | M4 |
| T17 | Caption buttons, app icon, taskbar name and Task Manager name are not captured by CDP screenshots | n/a | test tooling: OS window capture (`PrintWindow`) in C8; must show the Tacet icon and `Tacet` | M2 |

---

## 5. Motion (QB-MOT)

Source: `design/ANIMATION-GATE.md`, `design/UI-KIT.md`, guide §2.7 and A8.

| ID | Requirement and target | Measured by | Status and evidence | Milestone |
| --- | --- | --- | --- | --- |
| QB-MOT-1 | Every animation in the product has a gate record: frequency tier, named purpose, duration within the tier limit, and rejected alternatives. | `design/motion/MOTION.md` inventory vs C9 runtime inventory; an animation with no record fails | PARTIAL: records exist for first boot and the UI-kit map; no runtime inventory | M3b |
| QB-MOT-2 | **K tier never animates**: typing, caret, selection, scrolling, Ctrl+P, command palette, find, Write/Read/Code switch. 0 running animations within 500 ms after these actions. | C9 | NOT TESTED | M4 |
| QB-MOT-3 | Only `transform` and `opacity` animate. Hover color and fill changes are allowed at ≤ 100 ms. | C9 property check | NOT TESTED | M3b |
| QB-MOT-4 | Durations: press 100 to 160 ms; tooltip 125 to 200 ms; menus 150 to 250 ms; dialogs 200 to 500 ms; exits at 70 % of the enter duration. | C9 against the tier table | PASS for first-boot step changes by spec; runtime check only for reduced motion | M3b |
| QB-MOT-5 | **Reduced motion** (`workbench.reduceMotion`, Windows "Animation effects" off, `prefers-reduced-motion`): no travel anywhere; opacity changes ≤ 80 ms (guide §2.7); first boot instant. | C9 under CDP emulation; manual check with the real Windows setting | PASS (emulated) for first boot (case d); NOT TESTED with the real OS setting or in the workbench | M3b, M9 |
| QB-MOT-6 | **60 fps.** During each allowed animation: frame time p95 ≤ 16.7 ms, at most 1 frame over 25 ms per animation, on the reference machine on AC and on battery **(proposed: one dropped frame is visible on a 60 Hz panel)**. | C9 rAF frame sampler | NOT MEASURED | M3b |
| QB-MOT-7 | Typing is never blocked by motion: the launch mark and the landing fade accept input from frame 1. A key pressed during the landing fade appears in the draft (FIRST-BOOT §7). | C9 + first-boot case e (§12 C13) | NOT TESTED | M3 |

---

## 6. Accessibility (QB-A11Y)

| ID | Requirement and target | Measured by | Status and evidence | Milestone |
| --- | --- | --- | --- | --- |
| QB-A11Y-1 | **Keyboard only (A28).** Every flow completes without a mouse: first boot, new note, write, save, Save As, open, find, Ctrl+P, switch views, shelf, settings, terminal, close. 0 traps. | C10 traversal + scripted flows | PARTIAL: first boot completes with Enter only and Esc skips (cases a, b) | M4, M8 |
| QB-A11Y-2 | **Focus visible.** Every focusable element shows a 2 px ring, at least 3:1 against its background, never clipped (guide §2.8, §4.31). The document shows the caret instead of a ring. | C10: computed outline + pixel contrast | PARTIAL (first boot only) | M4 |
| QB-A11Y-3 | **Automated rules.** axe-core in the workbench and every webview: 0 serious or critical violations. | C10 | NOT TESTED | M4 |
| QB-A11Y-4 | **Narrator and NVDA (A29).** Names, roles, states, the save state, errors and first-boot steps are announced. Example: `Step 1 of 4. Tacet. Choose how the page looks.` and `Show a status line, switch, off` (FIRST-BOOT §8). Editing in Write is readable line by line. | Manual script `margin/tests/a11y-sr.md` with an NVDA speech-log capture; Narrator by ear | NOT TESTED | M9 |
| QB-A11Y-5 | **Contrast themes (A32, guide §8).** Aquatic, Desert, Dusk, Night sky: every surface readable, no state carried by color alone, links underlined, Tacet HC Light used for light contrast themes. | C10 `forced-colors` emulation + manual pass with real themes | NOT TESTED (the theme is registered: `extensions/tacet/package.json:19`) | M4, M9 |
| QB-A11Y-6 | **Scaling (A30).** 125 %, 150 %, 200 % display scale, and document text zoom 12 to 28 px: no clipped text or controls; Ctrl+wheel keeps the reading position. | C10 at deviceScaleFactor 2 + C8 matrix | NOT TESTED | M4 |
| QB-A11Y-7 | **Text contrast.** Information text ≥ 4.5:1; `quiet` (3.1:1) only for incidental text (guide §2.1). | C10 color-contrast rule + C8 token check | Tokens meet it on paper (guide §2.1); NOT TESTED rendered | M4 |

---

## 7. Windows citizenship (QB-WIN)

| ID | Requirement and target | Measured by | Status and evidence | Milestone |
| --- | --- | --- | --- | --- |
| QB-WIN-1 | **Double-click a `.md` (R1).** From Explorer on a fresh profile: rendered, editable page with the caret; no setup, no folder, no trust prompt; cold ≤ 1.5 s p95, warm ≤ 300 ms. | C12 (VM) + C5 | NOT BUILT | M8 |
| QB-WIN-2 | **Open With and associations (R11).** Tacet appears in Open With for `.md`, `.markdown`, `.txt`, `.mdc`. The default-app offer shows once, after a file opens, and never again after it is dismissed. | C12: registry read after install (`HKCU\Software\Classes\...\OpenWithProgids`), launch through the shell | NOT BUILT | M8 |
| QB-WIN-3 | **Single instance and CLI (R11).** `margin a.md b.txt` opens both in one process tree. `--wait` blocks until close. `--read` and `--goto` work. | C12 | NOT BUILT (the CLI is still `code-oss`) | M8 |
| QB-WIN-4 | **Own identity (A35).** Its own app ID, data folder, mutex, URL scheme and AppUserModelID. 0 reads from or writes to `%APPDATA%\Code`, `~\.vscode*` or another Code-OSS build's data (except the explicit import step, read-only). | C12 + ProcMon-style file trace (`handle`/ETW) during C1 | **FAIL.** `dataFolderName: .vscode-oss`, `win32MutexName: vscodeoss`, `urlProtocol: code-oss` (`product.json`). The latest smoke run wrote shared storage **outside its isolated profile**, to `c:\Users\mzwin\.vscode-oss-shared\sharedStorage\state.vscdb` (`r1b-finish-3-launch.log`, line 5). | M2 |
| QB-WIN-5 | **Unicode and odd paths (A34).** `ノート\café 📝.md`, paths with spaces, over 260 characters, UNC, OneDrive: open, save and show the right title. | C12 + C3 | NOT TESTED | M8 |
| QB-WIN-6 | **Native dialogs (guide A9, §4.23).** Open, Save As, folder picker and "unsaved changes on close" use the native Windows dialogs. | C12 in the VM: detect a `#32770` window owned by the Tacet PID | NOT TESTED. The first-boot harness turns on `files.simpleDialog.enable` to drive the folder picker (`tools/first-boot.mjs:376-377`), so the native path is never exercised. | M8 |
| QB-WIN-7 | **Window behaviour.** Snap layouts on Maximize hover, Alt+Space system menu, double-click title to maximize, min size 480 × 360, size and position remembered across monitors with different DPI. | Manual checklist in the VM | NOT TESTED | M8 |
| QB-WIN-8 | **Multiple windows (A21).** Two windows on two files; the same file in two windows has one owner and no duplicate draft. | C12 | NOT TESTED | M8 |
| QB-WIN-9 | **Print and PDF (A33).** Print to "Microsoft Print to PDF": selectable text, readable tables and code, no chrome, source unchanged. | C12: print to a file with the PDF printer, check the text with `pdftotext` | NOT BUILT | M8 |
| QB-WIN-10 | **Follows system dark mode.** With `System` chosen, switching Windows between light and dark switches Tacet within 1 s, without a restart. | C12 in the VM (registry `AppsUseLightTheme` + `WM_SETTINGCHANGE`) | PARTIAL: `window.autoDetectColorScheme: true` is the default and is written by first boot (case a). Live switch not tested. | M8 |
| QB-WIN-11 | **High DPI.** Crisp icons and text at 100, 125, 150, 175 and 200 %; icon strokes on half pixels (guide §10.2). | C8 matrix at each scale | NOT TESTED | M8 |
| QB-WIN-12 | **Mark of the Web (guide A13).** A downloaded `.md` opens in Read. | C12: fixture with a `Zone.Identifier` stream | NOT BUILT | M6 |
| QB-WIN-13 | **Drag to open.** Dropping a file on the window opens it. | Manual in the VM | NOT TESTED | M8 |

---

## 8. Privacy and trust (QB-PRIV)

| ID | Requirement and target | Measured by | Status and evidence | Milestone |
| --- | --- | --- | --- | --- |
| QB-PRIV-1 | **Zero network by default (06 §5, N-04).** Empty launch, first boot (all steps), open, edit and save Markdown with a remote image, Read view, search, 10 minutes idle: **0 product-originated connection attempts** to any non-loopback address, online and offline. A blocked attempt still fails. | C6 `tools/netaudit.mjs` | NOT TESTED. Risks to check first: `webviewContentExternalBaseUrlTemplate` points at `vscode-cdn.net`, and `reportIssueUrl`/`licenseUrl` point at Microsoft (`product.json`). The log shows `update#setState disabled` (`r1b-finish-3-launch.log`), which is good. | M1 (baseline), M9, M10 (on the packaged build) |
| QB-PRIV-2 | **Zero AI code reachable (06 §6, N-01 to N-03, N-05).** Static artifact scan, dependency scan, runtime command/menu/view/setting/keybinding inventory and process inventory each show 0 AI entries outside a reviewed allowlist. | C7 `tools/noai-audit.mjs` | PARTIAL: static inventory done by hand (`evidence/w1-ai-inventory.md`); no automated audit; not run against a packaged artifact | M1 (automate), M10 |
| QB-PRIV-3 | **Re-enable resistance (N-05, A43).** Seeded `chat.*`, `github.copilot.*` and `mcp` settings, prompt files and a `.vscode/mcp.json` create 0 new commands, processes or connections. | C7 `--reenable` | NOT TESTED (the import step already drops `github.copilot.*` and `chat.*`: case c `unexpectedKeys: []`) | M9 |
| QB-PRIV-4 | **No telemetry.** No telemetry setting is registered; C6 sees 0 requests to the known Microsoft telemetry, experiment, marketplace, update and CDN hosts (list in §12 C6). | C6 + C7 inventory | NOT TESTED | M9 |
| QB-PRIV-5 | **Upgrade resistance (N-07, A44).** After an upgrade from the previous Tacet build, C6 and C7 still pass, and extras that were off stay off (R9). | C7 + C6 after an upgrade install in the VM | NOT BUILT | M10 |
| QB-PRIV-6 | **Links and content cannot execute (R4, A36, A37).** Only http, https and mailto open, and the destination shows first. `command:`, `javascript:`, `file:` executables and `ms-*:` links do nothing but show a notice. | C3 `links` fixtures + C6 (no connection until the user confirms) | NOT BUILT | M6 |
| QB-PRIV-7 | **Remote content blocked (R5, A38).** Remote images, fonts and Mermaid assets make 0 requests until `Load`. | C6 on the remote-image fixture | NOT BUILT | M6 |
| QB-PRIV-8 | **No terminal by default (R9, C3).** No shell process exists until the user opens a terminal. No terminal shortcut is bound unless the Extra is on. | C7 process inventory + keybinding inventory | **FAIL.** The smoke test opens a terminal with Ctrl+Shift+` on a default profile (`tools/smoke.mjs:352`). FIRST-BOOT §12 notes that the core terminal still binds Ctrl+` by default. | M4 |
| QB-PRIV-9 | **Honest copy.** Every public claim (README, About, release notes) links to a passing receipt on the exact release artifact: "No telemetry" → C6; "No AI" → C7; the speed numbers → C5. | Release checklist review | NOT STARTED | M10, M11 |
| QB-PRIV-10 | **Test isolation.** Tests never touch the owner's real files, profiles or Documents. | C1 to C13 write only under their scratch root; a file-trace check fails the run on any other write | **FAIL:** see QB-WIN-4 (shared storage written to `%USERPROFILE%\.vscode-oss-shared`). | M2 |
| QB-PRIV-11 | **Webview sandbox.** Tacet webviews do not use `allow-scripts` together with `allow-same-origin` unless it is reviewed and written down. | Code review + C10 console-log scan | Warning seen: "An iframe which has both allow-scripts and allow-same-origin … can escape its sandboxing" (`r1b-finish-3-launch.log`). It is upstream; review it at M6 for the rich editor. | M6 |

---

## 9. Copy and UX writing (QB-COPY)

Rules: guide §2.10, ASD-STE100 discipline (short, literal, present tense, one idea per sentence), never narrate what is visible, never over-explain.

| ID | Requirement and target | Measured by | Status and evidence | Milestone |
| --- | --- | --- | --- | --- |
| QB-COPY-1 | Sentence case on every Tacet-owned surface, menus included (guide §2.3). Upstream command titles keep title case only until the sweep. | C11 | PARTIAL: first boot is sentence case except `Choose Folder…` (`m3-d-2-notes-onedrive.png`; it also appears in FIRST-BOOT §5) | M3, M4 |
| QB-COPY-2 | No uppercase labels anywhere visible. | C11 computed `text-transform` and all-caps text check | FAIL: `EXPLORER`, `FIXTURES`, `OUTLINE`, `PROBLEMS`, `OUTPUT`, `TERMINAL` | M4 |
| QB-COPY-3 | No leaked internal names: no setting IDs, `untitled:`, `Untitled-1`, `Plain Text`, `Code - OSS`, `vscode`, `${…}`, `undefined`, file-system URIs. | C11 runtime text crawl | FAIL: `Untitled-1`, `Code - OSS Dev`, `Plain Text` (§4.2 T1, T9) | M2, M4 |
| QB-COPY-4 | Sentence length ≤ 20 words for instructions and ≤ 25 for descriptions (STE100). No banned words: please, simply, just, easily, oops, awesome, let's, magic, smart, seamless, powerful. No exclamation marks. | C11 | PASS by inspection for the first-boot strings in the screenshots; no lint yet | M3 |
| QB-COPY-5 | Never narrate what is visible, and never explain a control that is clear. Every sentence in the UI must answer a question the user has at that moment. | Design review per screen; C11 flags any sentence over 12 words on a non-first-boot surface for review **(proposed)** | PARTIAL: first boot follows it. `Choose how the page looks. You can change this later in Settings.` passes. | M4 |
| QB-COPY-6 | Key names readable: `Ctrl+\`` is shown as `Ctrl+Backquote` or with a styled key cap, never as a lone backtick glyph. | C11 regex on visible text | FAIL: `Open a terminal with Ctrl+\`` (`m3-4-extras.png`) | M3 |
| QB-COPY-7 | Paths in first boot never wrap mid-word, and the ` · Tacet makes this folder` suffix sits on its own line when the path is long. | C8 line-box check on the path label | FAIL: the suffix wraps under the path (`m3-d-2-notes-onedrive.png`) | M3 |
| QB-COPY-8 | One term per concept (terminology table below). | C11 banned-term list | FAIL (see QB-COPY-2 and QB-COPY-3) | M4 |

**Terminology (user-facing).**

| Use | Meaning | Do not use |
| --- | --- | --- |
| note | any document the user writes in Tacet | document (in UI), buffer, editor |
| draft | a new note Tacet keeps safe until it is saved to a file | Untitled, Untitled-1, scratch, temp |
| file | a note that has a place on disk | resource, URI |
| folder | a folder the user opened | workspace, project, vault, root |
| Notes folder | the default save folder chosen in setup | notes directory |
| Write, Read, Code | the three views of one note | mode (in UI), preview, source mode, editor |
| Saved, Edited, Saved in Drafts, Saving…, Couldn't save, Changed outside Tacet, Read-only file | save states (contract §2) | Dirty, Modified, Synced, Auto-saved |
| Recent, Pinned, Drafts, Folders | shelf sections | Explorer, Open Editors, Outline (in writing) |
| shelf | internal name only. The user-facing name of the toggle needs a decision **(proposed: `Files`)** | side bar, activity bar |
| status line | the opt-in footer | status bar |
| Extras | opt-in features chosen in setup | features, add-ons, extensions, plugins |
| Setup | the first boot | Welcome, Get started, onboarding, walkthrough |
| Settings | the settings page | Preferences, Options |
| terminal | the opt-in terminal | console, shell (in UI), panel |
| Search | find across files | Find in Files, Explorer search |
| Find | find in this note | search (for in-note find) |
| Agent files | the shelf section for agent files (AGENT-FILES §5.2) | AI files, Copilot files, prompts (as a section name) |

Never in the UI: AI, Copilot, chat, agent (except "Agent files"), account, sign in, sync, marketplace, extension, trust, Restricted Mode, telemetry (except the About line "Tacet sends no telemetry."), VS Code (except the import step and About).

---

## 10. Engineering quality (QB-ENG)

| ID | Requirement and target | Measured by | Status and evidence | Milestone |
| --- | --- | --- | --- | --- |
| QB-ENG-1 | **Compile gate.** `npm run compile` exits 0 for every commit on `margin/notes-first`. The log is stored and its hash is in the commit body (`Compile: EXIT 0 <sha256-prefix>`) **(proposed: makes "compile unverified" commits visible)**. | C13 runner; commit-msg check | PARTIAL: `m3-compile.log` and `v1-compile.log` end in `EXIT 0`, but commit `c35ffd37` says "compile unverified" | now |
| QB-ENG-2 | **Smoke exits non-zero on any failure.** | `tools/smoke.mjs:398-413`; `TACET_SMOKE_INJECT_FAILURE` | PASS (`r2-fix-exit-inject-smoke.json`). The branch is **red**: the latest run fails `typingCases`. | now |
| QB-ENG-3 | **Green branch rule.** No milestone closes while any gate script is red. Each gate script passes **10 of 10 consecutive runs** before a milestone closes **(proposed: typing bugs have come back before)**. | C13 `--repeat 10` | NOT MET | every milestone |
| QB-ENG-4 | **Unit tests for Tacet-owned logic.** Settings and keybinding import filter (JSONC, removed features, AI keys, unknown commands), OneDrive detection, notes-folder resolution, first-boot state machine, link-scheme allowlist, agent-file classifier. Line coverage ≥ 80 % of Tacet-owned pure modules **(proposed)**. | `scripts\test.bat --grep Tacet`; mocha for `extensions/tacet-welcome` pure modules | **FAIL: 0 test files** under `src/vs/workbench/contrib/tacet`, `extensions/tacet`, `extensions/tacet-welcome`; `margin/tests/` is empty | M3 (import), then each milestone |
| QB-ENG-5 | **Integration gates.** The `tools/*.mjs` scripts (§12) run from one runner, write one receipt each, and exit non-zero on failure. | C13 `tools/gate.mjs` | PARTIAL: 2 gate scripts exist (`smoke.mjs`, `first-boot.mjs`) | M4 |
| QB-ENG-6 | **Lint and hygiene.** `npm run eslint` and `npm run hygiene` (copyright headers, tabs, localized strings) report 0 errors on changed files. | C13 | NOT EVIDENCED (no receipt) | now |
| QB-ENG-7 | **Layering.** `npm run valid-layers-check` reports 0 errors at each milestone. | C13 | NOT EVIDENCED | each milestone |
| QB-ENG-8 | **Review per milestone.** An independent code review of the milestone diff (`codex review --base <milestone start>`) plus, at M5, M6 and M9, the adversarial "try to lose text" review. Findings are closed or accepted in writing. | `evidence/<milestone>-review.md` | NOT EVIDENCED: no review receipt in `tacet/evidence/` | each milestone |
| QB-ENG-9 | **Small, isolated upstream patch.** New Tacet code lives in Tacet-owned folders (`src/vs/workbench/contrib/tacet/`, `extensions/tacet*`, `extensions/theme-tacet`, `margin/`). Every edit to an upstream file, other than a deletion, is listed in `margin/UPSTREAM-PATCHES.md` with its reason, and is marked `// MARGIN:` in the code **(proposed: needed to take upstream security fixes after 1.139.0)**. | C13 `patchset` report from `git diff --numstat 2242ebbb..HEAD` | PARTIAL: 36 commits; 12,249 files changed (+32,529 / −3,421,252 lines). Under `src/`: 4,695 files changed (+1,702 / −1,162,735), of which 198 files have insertions. No ledger exists. | M2, then each milestone |
| QB-ENG-10 | **No temporary files committed.** | C13: fail on files whose header says `TEMP` or "delete before commit" | FAIL: `tacet/tools/diag-type.mjs` line 1 says "TEMP diagnostic (delete before commit)" | now |
| QB-ENG-11 | **Upstream security.** At release, Electron and Chromium have no known exploited CVE without a fix, and there is a written plan to rebase onto the next Code OSS security release. | Release checklist | NOT STARTED (Electron 43.6.0, `STATE.md`) | M10 |
| QB-ENG-12 | **Receipts.** Every gate receipt has the shape in 08 §Evidence receipt shape: source head, dirty-patch hash, binary hash, profile, fixtures, command, result. | C13 validates the JSON shape | PARTIAL: smoke and first-boot receipts have no source head or binary hash | M4 |

---

## 11. Onboarding: first boot and the first 60 seconds (QB-ONB)

| ID | Requirement and target | Measured by | Status and evidence | Milestone |
| --- | --- | --- | --- | --- |
| QB-ONB-1 | **Keystrokes to the first written word** on first launch: ≤ 5 (Enter × 4, or Esc × 1). | `tools/first-boot.mjs` | PASS (cases a, b) | M3 |
| QB-ONB-2 | **Time to the first setup frame** on a release build: **≤ 1.5 s p95 (proposed: same budget as a blank draft; setup must not make first launch slower)**. | C5 `cold --first-boot` | NOT MEASURED. Dev build: 8,038 ms (case a `setupFirstFrameMs`). | M9 |
| QB-ONB-3 | **Landing.** After `Start writing`, the caret is in the page within 310 ms (FIRST-BOOT §7). A key pressed during the fade appears in the draft. | first-boot case e (C13) | PARTIAL: focus lands in the draft (`landing.focusInEditor: true`, all cases); timing and the typed-during-fade case are not tested | M3 |
| QB-ONB-4 | **Esc on every step** writes only choices already confirmed with Continue, then lands on a draft. | first-boot case f (C13): Esc on steps 1 to 4 | PARTIAL: Esc on step 1 (case b, 0 settings written) and on step 3 (case d) pass | M3 |
| QB-ONB-5 | **Import correctness.** 0 unexpected keys, 0 changes to source files, AI/removed/theme keys dropped, JSONC with comments and trailing commas parsed, real counts shown. | `tools/first-boot.mjs` case c + unit tests (QB-ENG-4) | PASS for the VS Code fixture: `Copied 2 shortcuts and 6 settings. 11 do not apply.`, `unexpectedKeys: []`, `fixtureUnchanged: true`. NOT TESTED: VSCodium, Cursor, Windsurf paths; malformed JSON; VS Code profile folders; 500-entry keybindings. | M3 |
| QB-ONB-6 | **A file launch skips setup** and opens the file (FIRST-BOOT §9). | first-boot case g (C13) | NOT TESTED | M3 |
| QB-ONB-7 | **Second launch** opens the last document or a new draft with the caret; setup never shows again. | C2 | **FAIL:** setup correctly stays hidden, but the window is empty (`m3-a-second-launch.png`) | M4 (after QB-DUR-4) |
| QB-ONB-8 | **Placeholder and hint.** An empty draft shows `Start writing.`; the one-time `Ctrl+O opens a file.` hint hides on the first key or after 20 s, and never shows again. | C8 + first-boot case e | NOT BUILT (FIRST-BOOT §12: M4) | M4 |
| QB-ONB-9 | **The first 60 seconds with people.** Five people who use Notepad, on a fresh install, with no help: write a line, save it, find it again, open a `.md` from Explorer. Pass: 5 of 5 complete; median time from double-click to the first typed word ≤ 10 s **(proposed: Notepad users expect to type at once)**. | Moderated sessions, `evidence/m9-usability.md` | NOT DONE | M9 |

---

## 12. New automated checks to add

All scripts live in `tacet/tools/`, follow the rules in `tools/smoke.mjs` (disposable profile and fixtures, CDP and Playwright only, no OS input on the owner's desktop, stop only the process tree they started), write `tacet/evidence/<tag>-<check>.json` in the 08 receipt shape, and exit 1 on any failure. Scripts marked **VM** need OS input or a power-off and run only in the VM or on CI.

### C1 `durability.mjs` — kill matrix and save failures

- **Input:** `--targets renderer,main,exthost --kills 50 --gap-ms 20 [--power]`.
- **Setup:** fixture folder with `note.md` (named file) plus one new draft. Both open in Write.
- **Typing stream:** send tokens `t0001 t0002 …` one character at a time with a fixed gap. Log a monotonic timestamp for each character sent.
- **Kill:** at a random time between 2 and 10 s, find the target PID and run `taskkill /F /PID`. PIDs: renderer and GPU from CDP `SystemInfo.getProcessInfo`; main is the `electron.exe` child of the launcher; extension host from the `Win32_Process` tree (command line contains `--type=utility` and the extension-host entry).
- **Relaunch** with the same profile and no `--new-window`. Read the recovered draft and the named file's recovered buffer through CDP, and the backup folder on disk.
- **Pass:** recovered text is an exact prefix of the sent stream (no garbage, no duplicate token); loss window (kill time minus the send time of the last recovered character) p95 ≤ 500 ms and max ≤ 1,000 ms; 0 missing drafts; 0 extra drafts.
- **Save-failure cases:** `attrib +R`; an exclusive handle held by a child PowerShell (`[IO.File]::Open(p,'Open','ReadWrite','None')`); a denied folder (ACL deny write on a scratch folder). Pass: text unchanged in the editor, state `Couldn't save`, document still dirty, `Save a Copy` writes the exact text.
- **External-change cases:** harness writes the file (a) with no local edits, expect reload; (b) with local edits, expect `Changed outside Tacet`, autosave paused, both versions recoverable; (c) during the save window, expect no silent overwrite.
- **`--power` (VM):** VirtualBox `controlvm poweroff` at a random time, 10 runs; same pass rules.
- **Output:** `<tag>-durability.json` with each kill: target, kill time, last recovered token, loss ms. Runtime budget about 30 min. Milestone M5.

### C2 `relaunch.mjs` — session continuity

- Cases: (a) draft with text, normal close through the File menu command `workbench.action.quit`, relaunch; (b) same with `Browser.close`; (c) a named dirty file; (d) three drafts; (e) relaunch with a file argument.
- **Pass:** every draft and dirty buffer is back with its text, caret line and view; 0 extra empty drafts; case e shows the file first (D-07).
- Also re-runs first-boot case a's exact steps and asserts that `Caret ready.` is visible after relaunch (the QB-DUR-4 repro).
- Milestone: now (diagnosis), M5 (gate).

### C3 `fidelity.mjs` — byte round-trip corpus

- **Corpus** in `margin/tests/corpus/` (redistributable only, with sources): every item in 08 §Corpus, plus `readonly.md` (attribute set by the harness), `eol-mixed.md`, UTF-16 LE/BE BOM, Windows-1252, Shift-JIS, GB18030, a 1/10/100 MiB set generated at run time, and a binary file with a `.md` name.
- **Per file:** snapshot the folder (names, sizes, mtimes, SHA-256). Actions: (1) open, close; (2) open, switch Write → Code → Read → Write, close; (3) open, type `x`, Backspace, save; (4) open, change one word, save.
- **Pass:** (1) to (3) leave the SHA-256 unchanged and create 0 new files; (4) the byte diff touches only the edited word's range. Encoded files save in their own encoding with 0 U+FFFD. The mixed-EOL file shows its notice before action (3). The binary file shows the non-editing notice. Size fixtures: no truncation.
- **Link fixtures (R4):** `command:`, `javascript:`, `file:///C:/Windows/System32/calc.exe`, `ms-settings:`, `search-ms:` links: activating each creates 0 processes (process-tree diff) and shows a notice.
- Milestone M6 (M5 for (1) and read-only).

### C4 `typing.mjs` — fuzz, undo and latency

- **Fuzz:** 200 seeded sequences (printable ASCII, Enter, Backspace, Tab, Home/End, Ctrl+Arrow, Unicode from a fixed list: Arabic, Hebrew, combining marks, ZWJ emoji, CJK) at random positions in a 50 KiB note, at 0 ms and 10 ms gaps. After each sequence compare three texts: disk after save, the model (Code view), and the view (`.md-editor` EditContext). **Pass:** all equal, and equal to a reference result computed by applying the same operations to a string in the harness. Save the seed of any failure.
- **Undo:** for 20 fixed sequences, count Ctrl+Z presses to return to the original bytes in Write and in Code. **Pass:** the counts are equal, and each stop is at a word or sentence boundary.
- **Latency:** inject `PerformanceObserver({type:'event', buffered:true, durationThreshold:16})` into the workbench and into the webview's `#active-frame`. Type 500 characters at 50 ms gaps into a 50 KiB note (Write, then Code). Record `duration` for `keydown` and `input` entries. Also record long tasks (`longtask` entries). **Pass:** QB-TYPE-8 budgets.
- Milestone M6 (latency baseline), M9 (gate).

### C5 `perf.mjs` — startup, memory, CPU, size

- **Needs** a release build path (`--app <path to Tacet.exe>`). Refuses to run on the dev build unless `--dev` is set, and then labels every number `dev`.
- **Competitors** in the same run when present: `notepad.exe`, Notepad++, VS Code stable (`--disable-extensions`, a fresh `--user-data-dir`), each opening the same 50 KiB file.
- **Cold:** 20 launches. t0 is the harness `process.hrtime` just before spawn. End point: the `margin/caretReady` mark (add it in `contrib/tacet` when the draft or file editor has focus and a probe key reached the model), read as `performance.timeOrigin + mark.startTime`. For competitors, the end point is the window becoming ready for input (`WaitForInputIdle` through PowerShell). Report p50, p95, max.
- **Warm:** 30 opens through the CLI into a running instance.
- **Memory:** walk the tree from the root PID with `Win32_Process.ParentProcessId`; sum `WorkingSetPrivate` from `Win32_PerfFormattedData_PerfProc_Process` after 60 s idle; list each process with its `--type`.
- **Idle:** sample `% Processor Time` and `IO Write Bytes/sec` for 10 minutes every 5 s.
- **Size:** installer bytes; installed tree bytes.
- **Output:** `<tag>-perf.json` with the machine facts (CPU, RAM, OS build, power mode, scale, binary SHA-256) and the delta against the previous perf receipt. **Pass:** §3 budgets. Milestone: M4 dev baseline, M9 gate, M10 on the signed installer.

### C6 `netaudit.mjs` — zero network

- Launch with `--log-net-log=<scratch>\net.json` (Chromium net log), `--proxy-server=http://127.0.0.1:<p>` pointing at an in-harness recording proxy that refuses every request and records the host, and `HTTP_PROXY`/`HTTPS_PROXY` set to the same proxy for Node processes.
- Every 250 ms, sample `Get-NetTCPConnection` and `Get-NetUDPEndpoint` for every PID in the tree.
- **Scenarios:** empty launch; first boot, all steps; open, edit and save a note with a remote image; Read view; Search; open and close Settings; 10 minutes idle; then again with the network adapter off (VM).
- **Pass:** 0 net-log requests with a scheme other than `file`, `vscode-file`, `vscode-webview`, `data`, `blob` or loopback; 0 proxy hits; 0 non-loopback sockets. Explicit denylist, reported by name if seen: `*.vscode-cdn.net`, `update.code.visualstudio.com`, `marketplace.visualstudio.com`, `*.gallerycdn.vsassets.io`, `default.exp-tas.com`, `mobile.events.data.microsoft.com`, `dc.services.visualstudio.com`, `vscode-sync*.trafficmanager.net`, `api.github.com`, `*.githubcopilot.com`, `api.anthropic.com`, `api.openai.com`.
- Terminal and user-clicked https links are separate labelled scenarios, never mixed into the default run.
- Milestone: M1 baseline (dev), M9 gate, M10 on the packaged app.

### C7 `noai-audit.mjs` — no AI reachable

- **Static:** scan the packaged `resources\app` (dev: `out\` and `extensions\`) with a denylist regex: `@anthropic-ai|claude-agent-sdk|@github/copilot|copilot-api|foundry-local|agentHost|languageModel|vscode\.lm\b|vscode\.chat\b|inlineChat|chatAgent|mcpGallery|mcpServer|localTranscription|aiEmbedding|aiRelatedInformation|aiSettingsSearch|editTelemetry|defaultChatAgent`. Each hit must match an entry in `tacet/tools/noai-allow.json` (path, pattern, reason: for example, the inert stable API shapes kept by `docs/10-REBUILD.md`). New or unexplained hits fail.
- **Dependencies:** production dependency tree (`npm ls --omit=dev --all --json`, and the packaged `node_modules` folder list) against a package denylist.
- **Runtime inventory:** a test-only command `tacet.test.dumpInventory` (registered only when `TACET_TEST_SEAMS=1`) writes the registered command IDs, menu items, view IDs, configuration keys, keybindings and status-bar entries to JSON. Denylist on IDs and titles: `/chat|copilot|\bagent\b|mcp|\bai\b|language ?model|inline ?chat|sparkle|speech|voice/i`, with the allowlist `tacet.agentFiles.*` and the "Agent files" label.
- **Processes:** after the C6 scenarios, list every process command line in the tree. Fail on `agentHost`, `copilot`, `mcp`, `transcription` or an unknown `--type=utility` service.
- **`--reenable`:** seed `chat.*`, `github.copilot.*`, `mcp.*` settings, `.github/copilot-instructions.md`, `.vscode/mcp.json`; re-run the inventory and C6. **Pass:** no new entries, processes or connections.
- Milestone: M1 (automate now), M9, M10.

### C8 `look.mjs` — VS Code tell detector and screenshot matrix

- **Matrix:** 1440 × 900 and 480 × 360; light, dark, Tacet HC Light; device scale 1 and 2 (CDP `Emulation.setDeviceMetricsOverride`); screens: empty draft, note in Write, Read, Code, shelf open, first boot step 1, status line on, terminal on.
- **Window title:** `page.title()` and the OS title (`(Get-Process -Id <pid>).MainWindowTitle`). **Pass:** matches `^(● )?.+ - Tacet$`; contains none of `Code`, `OSS`, `Dev` (release), `Visual Studio`.
- **Denylist of visible selectors** (visible = non-zero box, opacity > 0): `.part.activitybar`, `.part.statusbar` (unless the Extra is on), `.tabs-container .tab`, `.breadcrumbs-control`, `.minimap`, `.command-center`, `.editor-actions`, `.md-readonly-toggle`, `.codicon-split-horizontal`, `.codicon-layout-sidebar-left`, `.pane-header`, `.composite.title`, panel tabs named Problems or Output, status items `problems`, `notifications` and `status.editor.mode` in writing.
- **Uppercase:** any visible text with computed `text-transform: uppercase`, or all-caps words of 4+ letters outside an allowlist (`UTF-8`, `CRLF`, `LF`, `PDF`).
- **Column:** box of the first text line in Write: left edge = (content width − 680) / 2 ± 2 px, width ≤ 680, top inset 56 ± 2 px; caret x ≥ 32 (≥ 24 at 480).
- **No-move:** boxes of the first 20 text nodes in Write vs Read vs shelf open. **Pass:** Δ = 0 px (M3, A4).
- **Colors:** chrome-region pixel histogram against `design/tokens.json` roles (ΔE ≤ 2); count greys and blues (§13 items 2 and 3).
- **Theme wiring:** `.md-editor` has `md-theme-tacet`; computed H1 family starts with `Segoe UI Variable Display`, weight 600, no bottom border.
- **OS capture (T17):** `PrintWindow` through a small PowerShell `Add-Type` helper to capture the whole window with caption buttons; this is a capture, not input.
- **Output:** screenshots `<tag>-look-<screen>-<size>-<theme>-<scale>.png` for `/design-review`, plus `<tag>-look.json`. Milestone M2 (title, identity), M4 (full).

### C9 `motion-audit.mjs` — animation gate at runtime

- Install, in the workbench and every webview, a capturing listener for `transitionrun` and `animationstart` that records target selector, property, duration, easing and time; after each scripted action, also read `document.getAnimations({subtree: true})`.
- **Actions:** type, Ctrl+P, command palette, find, view switch, shelf toggle, open a menu, open a dialog, hover a tooltip, theme change, first boot, landing.
- **Pass:** QB-MOT-2 (0 animations within 500 ms after K-tier actions), QB-MOT-3 (property whitelist), QB-MOT-4 (tier durations), QB-MOT-5 under `Emulation.setEmulatedMedia({features:[{name:'prefers-reduced-motion', value:'reduce'}]})` and with `workbench.reduceMotion: "on"`.
- **Frame rate:** during each allowed animation, record `requestAnimationFrame` deltas; pass QB-MOT-6.
- Milestone M3b.

### C10 `a11y.mjs` — automated accessibility

- **axe-core** (bundled as a dev dependency, injected from disk; no network) in the workbench document and each webview frame, on every C8 screen. **Pass:** 0 serious or critical violations.
- **Focus traversal:** from each screen, press Tab up to 200 times; record the active element and its computed outline. **Pass:** focus always visible (outline ≥ 2 px, contrast ≥ 3:1 by pixel sample), never clipped (the ring box is inside the scroll container's visible box), no trap (Esc or Tab leaves every widget).
- **Forced colors:** emulate `forced-colors: active` with the Tacet HC Light theme; re-run axe and C8's no-color-only check.
- **Zoom:** device scale 2 plus `window.zoomLevel` for 200 %; **pass:** no element with `scrollWidth > clientWidth` on labels, every control inside the viewport at 480 × 360.
- Manual companion: `margin/tests/a11y-sr.md` (Narrator and NVDA script with expected announcements). Milestone M4 (automated), M9 (screen readers).

### C11 `copy-lint.mjs` — words

- **Sources:** `extensions/tacet*/package.nls.json`, strings in `extensions/tacet-welcome/webview/**`, `nls.localize` calls under `src/vs/workbench/contrib/tacet/**`, and a runtime crawl of visible text nodes plus `aria-label` and `title` attributes on every C8 screen.
- **Rules:** banned terms (§9 table); banned words and exclamation marks (QB-COPY-4); sentence length; sentence case for Tacet-owned strings (first word capitalized, then lowercase except the proper-noun allowlist: Tacet, VS Code, VSCodium, Cursor, Windsurf, Windows, OneDrive, Markdown, Settings, Explorer (only in `Show in File Explorer`), key names); no internal IDs (`/\b[a-z]+(\.[a-zA-Z]+){1,}\b/` outside code spans, `${`, `untitled:`, `undefined`, `[object`); lone backtick after `Ctrl+`.
- **Output:** each finding with its source file and line or its screen. Milestone M3 (first boot), M4 (all surfaces).

### C12 `windows.mjs` — Windows citizenship (VM)

- Install the build in the VM. Read the registry for Open With entries, ProgID, AppUserModelID and the URL scheme.
- Launch through the shell (`cmd /c start "" "<file>"`) for `.md`, `.txt` and Unicode, long, UNC and OneDrive paths; assert the right file opens (window title, CDP text).
- Single instance: second launch with two files; assert one tree and both open. `--wait`: the harness process blocks until the window closes.
- Native dialogs: after Ctrl+S on a draft, `EnumWindows` finds a `#32770` dialog owned by the Tacet PID; cancel it with `WM_CLOSE`; the draft is intact (VM only).
- Dark mode: set `AppsUseLightTheme` and broadcast `WM_SETTINGCHANGE`; assert the theme changes within 1 s.
- Print: print a fixture to "Microsoft Print to PDF" into scratch; `pdftotext` finds the headings, and the source SHA-256 is unchanged.
- Mark of the Web: write a `Zone.Identifier` stream on a fixture; assert it opens in Read.
- Milestone M8.

### C13 `gate.mjs` — one runner

- Runs the selected checks in order, stops the app between them, gathers every receipt into `<tag>-gate.json` with the source head (`git rev-parse HEAD`), dirty-patch hash (`git diff | sha256`), binary hash and a pass/fail line per check.
- Adds these first-boot cases to `tools/first-boot.mjs`: **e** type during the landing fade (the key must appear in the draft) and time the landing; **f** Esc on each of steps 1 to 4; **g** launch with a file argument (no setup, the file opens); **h** malformed `settings.json` in the import source (plain message, no crash); **i** VSCodium, Cursor and Windsurf source folders.
- Runs `npm run eslint`, `npm run hygiene` and `npm run valid-layers-check` when `--static` is set; runs the temp-file check (QB-ENG-10) and the patch-set report (QB-ENG-9) every time.
- `--repeat N` runs a check N times and fails on any failure (QB-ENG-3).
- Exit code 1 if anything fails. Milestone: now.

Build order **(proposed)**: C13 runner and first-boot cases e to g, C2 (the relaunch repro), C7 static and C6 baseline, C8 title and identity, C1, C3, C4, C11, C9, C10, C5, C12.

---

## 13. Scorecard (current state, 2026-09-27)

| # | Dimension | Score | Reason |
| --- | --- | --- | --- |
| 1 | Never lose text | 2 / 10 | Upstream hot exit exists, but there is no crash, kill or save-failure receipt; the backup delay is 1,000 ms against a 500 ms target; a typed draft is not visible after relaunch. |
| 2 | Typing feel and correctness | 4 / 10 | 6 of 7 typing cases and CDP composition pass; the view shows a character that is not on disk; no latency, native IME or undo data. |
| 3 | Performance | 1 / 10 | No release build and no measurement; the dev build takes about 7 s to the workbench. |
| 4 | Visual design and identity | 3 / 10 | First boot looks like Tacet; the editor window still reads as VS Code (title, editor actions, Explorer, panel, status bar, flush-left caret, document theme not wired). |
| 5 | Motion | 5 / 10 | The gate is written and first-boot reduced motion is proven; no frame-rate data; the workbench kit is not built. |
| 6 | Accessibility | 2 / 10 | First boot is keyboard-complete with visible focus; nothing else is tested. |
| 7 | Windows citizenship | 1 / 10 | Identity is still `code-oss`; no Open With, CLI, native-dialog or print evidence. |
| 8 | Privacy and trust | 3 / 10 | AI removal is inventoried and the updater is off; no network or no-AI audit; tests write outside their profile; the terminal is bound by default. |
| 9 | Copy and UX writing | 5 / 10 | First-boot copy is short and literal; the workbench leaks `Untitled-1`, `Plain Text`, `Code - OSS Dev` and uppercase labels; no lint. |
| 10 | Engineering quality | 4 / 10 | Compile 0 and a smoke that fails loudly exist; the branch is red; 0 unit tests; no lint, layering or review receipts; a temp tool is committed. |
| 11 | Onboarding | 6 / 10 | 4 of 4 first-boot cases pass, including import and OneDrive honesty; relaunch is empty; placeholder and hint are not built; setup takes 8 s on the dev build. |

## 14. Top 15 gaps, ranked by user impact

| Rank | Gap | Requirement IDs | Owner lane |
| --- | --- | --- | --- |
| 1 | Text typed into a draft is not visible after close and relaunch. Diagnose whether it is lost or only not restored. | QB-DUR-4, QB-ONB-7 | engineering (fix) + test tooling (C2) |
| 2 | No proof that text survives a crash, kill, power loss or failed save; the backup delay (1 s) is above the 500 ms target; the rich editor's backup path is unproven. | QB-DUR-1 to 3, 5, 6, 16 | engineering + test tooling (C1) |
| 3 | The rich editor can show text that is not on disk (`after-heading`). | QB-TYPE-1 | engineering |
| 4 | A new draft is a VS Code plain-text editor with the caret flush left: no page, no measure, no placeholder. | QB-VIS-11, T8, QB-ONB-8 | engineering + design |
| 5 | Tacet shares its identity and data folders with Code OSS (`code-oss`, `.vscode-oss`, `vscodeoss`), and tests write to `~\.vscode-oss-shared`. This is a profile-collision risk and a trust bug. | QB-WIN-4, QB-PRIV-10, T1 | engineering |
| 6 | Double-clicking a `.md` in Explorer (R1), Open With, single instance and the `margin` CLI do not exist. | QB-WIN-1 to 3 | engineering |
| 7 | The Tacet document theme is not wired into Write/Read: wide column, H1 rule, floating lock/pencil pill. | QB-VIS-1, 9, 13, T6, T7 | engineering + design |
| 8 | The title bar is VS Code's: centered `… - Code - OSS Dev`, split/close/`…` editor actions, codicon toggle, no mark, no title menu, no `Write ▾`. | T1 to T5 | engineering + design |
| 9 | No honest file state without a status bar: no dirty dot, no `Couldn't save`, no conflict, encoding or EOL notice (mixed EOL is converted silently by Monaco on first edit). | QB-DUR-6, 7, 13, 14, QB-VIS-5 | engineering + design |
| 10 | No byte-fidelity corpus: encodings, BOM, EOL, front matter and minimal diffs are untested. | QB-DUR-10 to 13, 17 | test tooling (C3) |
| 11 | No zero-network or zero-AI audit exists, so "private" and "no AI" cannot be claimed. | QB-PRIV-1 to 4 | test tooling (C6, C7) |
| 12 | Performance is unmeasured; there is no release build to measure. | QB-PERF-1 to 9 | test tooling (C5) + engineering (release build) |
| 13 | The shelf, panel and status line are VS Code's Explorer, panel and status bar (uppercase labels, Problems, Output, errors count, bell); text moves when the shelf opens; the terminal is bound by default. | T10, T11, T13, QB-VIS-12, QB-PRIV-8, QB-COPY-2 | design + engineering |
| 14 | Native IME, RTL, emoji and undo granularity are untested; typing latency is unknown. | QB-TYPE-4 to 8 | test tooling (C4) + manual |
| 15 | Accessibility is untested beyond first boot: screen readers, contrast themes, 200 %, keyboard-only flows. | QB-A11Y-1 to 6 | test tooling (C10) + design |

Also needed, below the cut: unit tests for Tacet-owned logic (QB-ENG-4), the upstream patch ledger (QB-ENG-9), review receipts (QB-ENG-8), and the copy lint (C11).

## 15. What "done" means for 1.0

Tacet 1.0 meets this bar when, on the signed release artifact: every QB row marked P0-equivalent in §1 (all QB-DUR rows), QB-TYPE-1 to 8, QB-PRIV-1 to 4, 6 to 8, QB-WIN-1 to 6, and QB-VIS-11 to 13 pass with receipts; every other row passes or has an owner decision written in this file; C1 to C13 are green 10 of 10 times; and the stranger test and the five-person usability session (QB-ONB-9) pass.

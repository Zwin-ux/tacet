# Tacet 1.0 ship plan

Status: coordinator plan of record, 2026-09-27. One page that ties every lane to the finish line. Where it disagrees with older docs, this file and `docs/10-REBUILD.md` win; the gate definitions in `docs/07-EXECUTION.md` and the cases in `docs/08-ACCEPTANCE.md` still apply unless changed here.

## The product in one sentence

**Notepad with a VS Code feel:** open Tacet, a white page with a caret, type, it is saved. Monaco-quality text, a command palette, a quiet file shelf, Markdown that reads well, a terminal when you turn it on. No AI, no git, no accounts, no marketplace. Calm like the ChatGPT desktop app, polished like Windsurf, and it must not look like VS Code.

## Owner decisions in force

| Date | Decision |
| --- | --- |
| 2026-09-24 | AI-free at the source level; rich Markdown kept; built-in extensions only; terminal kept. |
| 2026-09-27 | Must not look like VS Code. New first boot (overrides guide §4.28). |
| 2026-09-27 | North star: bare bones, high quality; ChatGPT desktop calm + VS Code power + Windsurf polish (`design/REFERENCES-V2.md`). |
| 2026-09-27 | "More like Notepad with a VS Code feel": git and source control removed. |
| 2026-09-27 | First boot is a React webview built with Animate UI + Motion (`extensions/tacet-welcome`). Workbench chrome keeps plain CSS motion. |
| 2026-09-27 | **As simple as possible: no status bar by default.** The window is the title bar and the page. Save state moves to the title (dirty dot next to the document name). Power features are opt-in during first boot, all off by default. |
| 2026-09-27 | Design uses Codex (concept art) and Higgsfield (motion, custom assets, hero) freely. |
| 2026-09-28 | **macOS is a first-class target next to Windows.** Open source ships as **one `main` branch** that builds both, with a Mac and a Windows quickstart in the README and a .dmg + Windows installer per release. No per-platform branches. |
| 2026-09-28 | Tacet is the flagship project on mazenzwin.com (replaces Atlas). |

## Open-source launch (owner, 2026-09-27)

When v1 passes M10, Tacet goes public as an open-source GitHub repo, **`Zwin-ux/margin`** (name is free as of 2026-09-27), with a repo page modeled on [paperclipai/paperclip](https://github.com/paperclipai/paperclip). Creating the public repo and pushing is owner-confirmed at the time (outward action).

README structure, taken from Paperclip and adapted:

1. Centered banner (light/dark `<picture>`), a link row (Download · Docs · Website), badges (MIT, stars, latest release).
2. A short demo video of the real app (screen capture of the shipped build, not AI video).
3. One bold line: *Tacet is Notepad with a VS Code feel.* A contrast line in the Paperclip style.
4. A 3-step table: Open a file → Write → It is saved.
5. **Tacet is right for you if** (checklist).
6. The pillars (one image, light/dark): Quiet page, Real files, Instant, Private (no AI, no account, no telemetry).
7. Features grid: Markdown that reads well, find anything, never lose a draft, terminal when you want it, keyboard first.
8. **What Tacet is not** (two-column table): not an IDE, not an AI editor, not a git client, not a cloud notes service, not an extension marketplace.
9. Quickstart: installer + SHA-256 check, winget if available; build from source.
10. FAQ, Roadmap, **Telemetry: none** (stated plainly), Contributing, Security, License (MIT; keeps the Microsoft Code OSS notice; "Visual Studio Code" is a Microsoft trademark and Tacet is not affiliated).

Repo files at launch: README.md, LICENSE (MIT, both copyright lines), ThirdPartyNotices, CONTRIBUTING.md, SECURITY.md, DESIGN.md (from tacet/design/DESIGN-GUIDE.md), ROADMAP.md, CHANGELOG, `.github/` issue templates, release with signed installer + SHA256SUMS, social preview image 1280×640. Assets (banner, pillars, social preview) from the design lane; demo video captured from the real app over CDP.

## Requirements from user criticism (`design/CRITICISM.md`, 2026-09-27)

Each is an acceptance check on the milestone named.

| # | Requirement | Milestone |
| --- | --- | --- |
| R1 | Double-click a `.md`: a rendered, editable page with the caret ready. No setup, no folder, no trust prompt. | M8 + M6 |
| R2 | Source view for `.md` is always one key away (Write ▾ → Code and its shortcut), never behind a switch. | M6 |
| R3 | Drafts are never lost, are findable by title, and are readable files on disk. | M5 |
| R4 | Links cannot execute anything: only http, https and mailto, destination shown before opening (lesson of Notepad CVE-2026-20841). | M6 |
| R5 | Relative images and links resolve from the file's own folder; remote images blocked until the user allows them. | M6 |
| R6 | One Ctrl+P over pinned notes, drafts, recent files and folders; `#` jumps to a heading. | M7 |
| R7 | Recent includes files saved from drafts, supports pinning, keeps missing files with Locate / Remove. Shelf gets a Pinned section. | M4 + M7 |
| R8 | Content search can cover "this file's folder" without creating a workspace or writing anything there. | M7 |
| R9 | Every extra is off by default and nothing turns itself back on after an update or relaunch. | M4 + M10 |
| R10 | File facts stay honest without a status bar: dirty dot, save failure, a notice only for non-UTF-8 or unusual line endings, full path in the title menu. | M4 |
| R11 | Windows-native opening: single instance, Open With, drag to open, a `margin` command line (`--wait`, `--read`, `--goto`), one offer to become the default app, shown once after a file is opened. | M8 |
| R12 | Measured Notepad-class launch time, typing latency and memory; budgets set at M9. | M9 |

Rulings on the research's contradictions: source view is not an Extra (C1); first boot warns when Documents is synced by OneDrive and offers a PC-only folder (C2); the terminal is opt-in, not "one keystroke away" by default (C3); local history must be good since git is gone (C4); first launch shows the first boot, and Esc lands on a draft with no account or network (C5); downloaded `.md` files (Mark of the Web) open in Read (C10); public positioning leads with reading and safety, with "no AI" as a supporting fact (C11). Spelling (C9): owner decided 2026-09-27 — an opt-in "Check spelling" on the first-boot Extras step, off by default, squiggles only, never autocorrect.

## Agent files (`design/AGENT-FILES.md`, owner direction 2026-09-27)

Tacet is **the plain editor for the files your agents read**: CLAUDE.md, AGENTS.md, copilot-instructions, rule files (.mdc, .instructions.md, Windsurf, Cline), Claude settings/hooks, MCP configs, commands/prompts, SKILL.md folders, subagents, GEMINI.md. AI-free: no model calls, nothing runs, no MCP discovery, no scanning of agent home folders.

| # | Feature | Milestone |
| --- | --- | --- |
| AF1 | Recognition by path (right mode, `.mdc` and `llms.txt` as Markdown), no new chrome | M6 |
| AF2 | Front matter as an editable property block in Write; raw YAML in Code; byte-exact round-trip over a 300-file corpus | M6 |
| AF3 | Spec checks as quiet notices with one-click fixes; never block save | M6 |
| AF4 | Safety: skill scripts never run; hidden Unicode shown and removable (Rules File Backdoor); HTML comments visible; secret-looking keys in MCP configs flagged | M6 |
| AF5 | Length counts in the title menu; notice at 90 % of a published limit | M6 |
| AF6 | New from template (skill, AGENTS.md, CLAUDE.md, rule per tool, prompt, subagent); static text | M7 |
| AF7 | Skill folder view + "Agent files" shelf section; link-aware skill rename; follow `@path`, `${CLAUDE_SKILL_DIR}`, `#file:`; broken-link notice | M7 |
| AF8 | Local JSON schemas for MCP and Claude settings; zero network; Ctrl+P finds a skill by `name` | M7 |

Coordinator rulings (owner may override): the "Agent files" shelf section appears automatically only when a folder the user opened contains such files, with a setting to hide it (contextual, not an always-on extra, so R9 holds); the section is called "Agent files"; bundle the SchemaStore Claude settings schema (Apache-2.0, keep its notice) and refresh it each release.

## Milestones and gates

| # | Milestone | What "done" means (gate) | State |
| --- | --- | --- | --- |
| M1 | **Teardown** (R1 + R1b) | Compile 0; launch; smoke: type/save/undo/terminal; no removed surface (AI, debug, tasks, testing, notebooks, remote, marketplace, sync, telemetry, walkthroughs, timeline, comments, git/SCM) reachable. | R1 green (1d18a30e); R1b git removal queued |
| M2 | **Identity** (R2a) | Tacet themes, white first paint, Segoe UI Variable 14/20, 48px title bar, no menu row / command center / activity rail / tabs / breadcrumbs / minimap / floating cards; product name, window title and icons are Tacet. A stranger shown the screenshot does not say "VS Code". | In progress |
| M3 | **First boot** | 3 steps (theme + text size; import VS Code settings and shortcuts; where notes live) plus one optional "Extras" step, all off by default: status line, line numbers, terminal shortcut, Markdown source view, Enter continues, Esc skips, keyboard-complete, reduced motion instant, lands on a blank page with the caret. Built with Animate UI in a webview; spec `design/FIRST-BOOT.md`. | Design + tech spike in progress |
| M3b | **Tacet UI kit** (`design/UI-KIT.md`) | Animate UI across the product: React components verbatim in Tacet webview surfaces; vanilla ports (WAAPI + Motion springs baked to CSS `linear()`) for workbench chrome. Kit core + popover, menu, tooltip, dialog, checkbox/switch/radio ported before M4 builds on them. Each port matches the Animate UI demo side by side, has a reduced-motion variant, a keyboard path and 60 fps. | Spec done (6585ab74) |
| M4 | **The Tacet shell** (R2b) | Left-aligned document title with title menu; quiet `Write ▾` mode picker; shelf = New note, Search, Drafts, Recent, Folders (no row icons); no footer by default (save state in the title; status line only if chosen in first boot or settings); Code mode = source view + terminal. Guide §13 checklist passes at 1440 and 480 px, light, dark, one Contrast Theme. | Waiting on M2 + design concepts |
| M5 | **Durable notes** (W2) | Gate G2: drafts survive cancel, save failure, external change, renderer kill and normal exit; no duplicate draft after save; user files untouched by tests. | Slice 1 done 2026-09-28: autosave + hot exit on every window close by default; `tools/g2.mjs` 9/9 on Windows, twice. Open: closing a draft's tab keeps it (D-06, needs the M4 Drafts shelf); Save As write failure after the dialog accepts; sanitized Save As names (D-03); run g2 on macOS. |
| M6 | **Writing surface** (W3) | Gate G3: Write/Read/Code on one document without text moving; Read cannot edit; source fallback for unsupported Markdown; `.txt` stays plain. | Not started |
| M7 | **Find and navigate** (W4) | Gate G4 (minus git): find a passage, jump to a heading, toggle a task, rename with link awareness, all without developer commands. | Not started |
| M8 | **Windows citizen** (W5, git removed) | Gate G5 minus git: Open With from Explorer, Unicode paths, multiple windows, native dialogs, print to PDF, snap layouts, accessibility basics. | Not started |
| M9 | **Trust** (W6) | Gate G6: all P0 cases in `docs/08-ACCEPTANCE.md` pass; fault injection; startup and memory budgets measured; 5 real people complete the core tasks. | Not started |
| M11 | **Open source** (after M10) | Public repo live with the Paperclip-style README, release v1.0.0 with installer + SHA256SUMS, demo video, social preview; a fresh clone builds from source by following the README. | Not started |
| M10 | **Release** (W7) | Gate G7: signed x64 installer, fresh install / upgrade / uninstall keeps notes, no-AI and no-network audit on the packaged artifact, notices/SBOM, release notes, landing page with hero and download. | Not started |

## How every tool is used

| Tool | Job | Guard rail |
| --- | --- | --- |
| Claude coordinator | Plan, decide inside owner direction, merge lanes, judge evidence. | Max 3 concurrent agents on this 16 GB machine. One writer per file area. |
| Claude engineering lanes | Build milestones in order; one commit per task; compile 0 + smoke green per commit. | Never OS-level input; CDP + Playwright only (`tools/smoke.mjs`). |
| Codex | Concept art for screens; independent code review of every milestone diff (`codex review --base <milestone start>`). | Concept art is reference; the guide's numbers win. |
| Higgsfield | Motion studies, custom assets (icons, installer art), hero and launch visuals, promo video at M10. | Every asset judged against the guide; rejections logged. |
| Animate UI + Motion | First boot and any other webview surface (About, release notes page). | Restyled to Tacet tokens; reduced motion = instant; license notice kept. |
| gstack `/design-review`, `/qa` | Visual and flow QA on real screenshots at each milestone. | Run against the dev build via CDP screenshots, not the desktop. |
| Adversarial review agent | At M5, M6, M9: try to lose text. | Findings need a repro. |

## Order of work from here

1. M1 R1b (remove git) and M2 identity: engineering lane.
2. M3 first boot: design spec + Animate UI spike now; build after M2 lands.
3. M4 shell: build from accepted concepts after M2.
4. M5 → M6 → M7 → M8 in order; each closes with Codex review + adversarial review + `/design-review`.
5. M9 trust pass, then M10 release.

## Owner-only decisions still ahead

- Code-signing certificate (buy/which vendor) and distribution channel (own site, winget, Microsoft Store).
- Final product name check (trademark) and domain for the landing page.
- Whether the terminal stays in 1.0.
- Update mechanism: none in 1.0 (manual download), or an updater.
- Telemetry: none (current plan) — confirm.

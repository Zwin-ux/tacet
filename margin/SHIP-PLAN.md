# Margin 1.0 ship plan

Status: coordinator plan of record, 2026-09-27. One page that ties every lane to the finish line. Where it disagrees with older docs, this file and `docs/10-REBUILD.md` win; the gate definitions in `docs/07-EXECUTION.md` and the cases in `docs/08-ACCEPTANCE.md` still apply unless changed here.

## The product in one sentence

**Notepad with a VS Code feel:** open Margin, a white page with a caret, type, it is saved. Monaco-quality text, a command palette, a quiet file shelf, Markdown that reads well, a terminal one keystroke away. No AI, no git, no accounts, no marketplace. Calm like the ChatGPT desktop app, polished like Windsurf, and it must not look like VS Code.

## Owner decisions in force

| Date | Decision |
| --- | --- |
| 2026-09-24 | AI-free at the source level; rich Markdown kept; built-in extensions only; terminal kept. |
| 2026-09-27 | Must not look like VS Code. New first boot (overrides guide §4.28). |
| 2026-09-27 | North star: bare bones, high quality; ChatGPT desktop calm + VS Code power + Windsurf polish (`design/REFERENCES-V2.md`). |
| 2026-09-27 | "More like Notepad with a VS Code feel": git and source control removed. |
| 2026-09-27 | First boot is a React webview built with Animate UI + Motion (`extensions/margin-welcome`). Workbench chrome keeps plain CSS motion. |
| 2026-09-27 | **As simple as possible: no status bar by default.** The window is the title bar and the page. Save state moves to the title (dirty dot next to the document name). Power features are opt-in during first boot, all off by default. |
| 2026-09-27 | Design uses Codex (concept art) and Higgsfield (motion, custom assets, hero) freely. |

## Milestones and gates

| # | Milestone | What "done" means (gate) | State |
| --- | --- | --- | --- |
| M1 | **Teardown** (R1 + R1b) | Compile 0; launch; smoke: type/save/undo/terminal; no removed surface (AI, debug, tasks, testing, notebooks, remote, marketplace, sync, telemetry, walkthroughs, timeline, comments, git/SCM) reachable. | R1 green (1d18a30e); R1b git removal queued |
| M2 | **Identity** (R2a) | Margin themes, white first paint, Segoe UI Variable 14/20, 48px title bar, no menu row / command center / activity rail / tabs / breadcrumbs / minimap / floating cards; product name, window title and icons are Margin. A stranger shown the screenshot does not say "VS Code". | In progress |
| M3 | **First boot** | 3 steps (theme + text size; import VS Code settings and shortcuts; where notes live) plus one optional "Extras" step, all off by default: status line, line numbers, terminal shortcut, Markdown source view, Enter continues, Esc skips, keyboard-complete, reduced motion instant, lands on a blank page with the caret. Built with Animate UI in a webview; spec `design/FIRST-BOOT.md`. | Design + tech spike in progress |
| M4 | **The Margin shell** (R2b) | Left-aligned document title with title menu; quiet `Write ▾` mode picker; shelf = New note, Search, Drafts, Recent, Folders (no row icons); no footer by default (save state in the title; status line only if chosen in first boot or settings); Code mode = source view + terminal. Guide §13 checklist passes at 1440 and 480 px, light, dark, one Contrast Theme. | Waiting on M2 + design concepts |
| M5 | **Durable notes** (W2) | Gate G2: drafts survive cancel, save failure, external change, renderer kill and normal exit; no duplicate draft after save; user files untouched by tests. | Not started |
| M6 | **Writing surface** (W3) | Gate G3: Write/Read/Code on one document without text moving; Read cannot edit; source fallback for unsupported Markdown; `.txt` stays plain. | Not started |
| M7 | **Find and navigate** (W4) | Gate G4 (minus git): find a passage, jump to a heading, toggle a task, rename with link awareness, all without developer commands. | Not started |
| M8 | **Windows citizen** (W5, git removed) | Gate G5 minus git: Open With from Explorer, Unicode paths, multiple windows, native dialogs, print to PDF, snap layouts, accessibility basics. | Not started |
| M9 | **Trust** (W6) | Gate G6: all P0 cases in `docs/08-ACCEPTANCE.md` pass; fault injection; startup and memory budgets measured; 5 real people complete the core tasks. | Not started |
| M10 | **Release** (W7) | Gate G7: signed x64 installer, fresh install / upgrade / uninstall keeps notes, no-AI and no-network audit on the packaged artifact, notices/SBOM, release notes, landing page with hero and download. | Not started |

## How every tool is used

| Tool | Job | Guard rail |
| --- | --- | --- |
| Claude coordinator | Plan, decide inside owner direction, merge lanes, judge evidence. | Max 3 concurrent agents on this 16 GB machine. One writer per file area. |
| Claude engineering lanes | Build milestones in order; one commit per task; compile 0 + smoke green per commit. | Never OS-level input; CDP + Playwright only (`tools/smoke.mjs`). |
| Codex | Concept art for screens; independent code review of every milestone diff (`codex review --base <milestone start>`). | Concept art is reference; the guide's numbers win. |
| Higgsfield | Motion studies, custom assets (icons, installer art), hero and launch visuals, promo video at M10. | Every asset judged against the guide; rejections logged. |
| Animate UI + Motion | First boot and any other webview surface (About, release notes page). | Restyled to Margin tokens; reduced motion = instant; license notice kept. |
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

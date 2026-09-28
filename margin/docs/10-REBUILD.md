# Rebuild scope (owner decision, 2026-09-24; revised 2026-09-27)

**Revision 2026-09-27 (owner):** "Think of this more like Notepad, but with a VS Code feel." Git and source control are removed. North star: bare bones and high quality, with the calm of the ChatGPT desktop app and the polish of Windsurf, AI-free (see `margin/design/REFERENCES-V2.md`). The first boot is a React webview built with Animate UI (`extensions/margin-welcome`).

The owner asked for "a total rehaul of VS Code, not just a small extension". This supersedes the "coding tools available when needed" breadth in 01-PRODUCT.md. Where this file and older specs disagree, this file wins.

## What survives

| Kept | Why |
| --- | --- |
| Monaco editor, text models, undo, hot exit/backup, file service, file watching | The document engine. Contract 02 depends on it. |
| Rich Markdown editor (`markdown-language-features`) and Markdown language server | Write/Read views. |
| Explorer (as the shelf's folder source), quick open, find, search in files | Finding and navigating notes. |
| Integrated terminal | Owner choice. |
| Extension host, **built-in extensions only** | Owner choice: curated set, no marketplace, no user installs. |
| Settings, keybindings, themes, profiles (local only) | Needed to configure the app. |

## What is deleted from source (not hidden)

Debugger and debug API; tasks and task API; testing and test API; notebooks, interactive window, REPL; remote (SSH/WSL/containers/tunnels/codespaces, remote explorer, remote server build); extension gallery/marketplace, extension recommendations, extension install/update UI; settings sync and edit sessions; telemetry, experiments/assignment, surveys, NPS; issue reporter's online flow; welcome walkthroughs and getting started; timeline and comments (unless Markdown needs comments later); **git and source control** (SCM views, quick-diff gutter, merge editor, the `git`, `git-base`, `github`, `github-authentication` and `merge-conflict` extensions; owner revision 2026-09-27); built-in extensions that only serve removed features (debug-auto-launch, debug-server-ready, js-debug, ipynb, notebook renderers, remote extensions, microsoft-authentication if unused).

Extension API surfaces for deleted features keep their **stable** shape as inert implementations (same pattern as `vscode.chat`/`vscode.lm` in W1) so built-in extensions still activate; proposed APIs for deleted features are deleted.

## New Margin shell

The VS Code workbench layout (activity bar, side bar, panel, auxiliary bar, status bar, command center, menu bar) is replaced by the Margin window defined in `margin/design/DESIGN-GUIDE.md`: one 48px title bar (mark, shelf toggle, document title, Write/Read/Code, overflow, caption buttons), the shelf (drafts, recent, folders), the page, and a slim status line. The terminal opens as a deliberate Code-mode surface, not permanent chrome. Implementation order is in `margin/design/IMPLEMENTATION-MAP.md`, re-sequenced after the teardown.

## Packages

- **R1 Teardown:** delete the features above, keep the tree compiling, launching and passing the smoke test. Gate: typecheck 0, compile 0, launch with no removed surface visible, type/save/undo/terminal smoke.
- **R2 Shell:** Margin window replaces workbench parts; theme, fonts and icons from `margin/design/`. Gate: screenshots match the design guide at 1440px and 480px, keyboard-only flows work, high contrast readable.
- **R3 Document behaviour:** W2–W4 from 07-EXECUTION.md (durable drafts, Write/Read/Code on one document, shelf and search) on the new shell.

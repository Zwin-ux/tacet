# Tacet — current state

Updated September 24, 2026. Execution ledger, not a release announcement.

## Source

| Item | Observed value |
| --- | --- |
| Workspace | `%USERPROFILE%\Documents\Tacet` |
| Origin | `https://github.com/microsoft/vscode.git` |
| Branch | `margin/notes-first` |
| Upstream tag | `1.139.0` |
| Upstream commit | `2242ebbb54efeeb0129e08e919e7e8d43033cd83` |
| Commit date | `2026-09-22T15:13:34Z` |
| Required/observed Node | `24.18.0` |
| Observed npm | `12.0.1` |
| Electron target | `43.6.0` |
| Host qualification target | Windows x64, 16 GB RAM |

This is a newly cloned local workspace. No remote fork was created and no changes were pushed. The original README is preserved at `README.upstream.md`.

## Delivered

- Product and document contracts, 20 screen/state specifications, visual tokens and original icon direction.
- Twelve module boundaries, eight ordered work packages, 44 numbered acceptance scenarios and seven no-AI audits.
- Primary-source desk research and exact inspected source seams.
- Three generated concept boards, original prompts, and explicit corrections.
- A dependency-free interactive design study with sample notes; see its [scope and verification](prototype/README.md).
- A model-independent implementation prompt in [OPUS-HANDOFF](OPUS-HANDOFF.md).

## Native status

**G0 passed 2026-09-24 (see receipt below): the unmodified pinned Code OSS dev build installs, compiles, launches in an isolated profile, and passes the edit/save/undo/terminal smoke. G1–G7 open. AI removal is not implemented yet.**

An early exploratory source patch was saved to `evidence/implementation-spike.patch`. Tracked executable upstream code, `product.json`, package manifests, and locks were restored to the pinned commit. The extension and scripts were moved to `experiments/`. They are not shipped, registered, or production-qualified. Active source changes for the handoff are documentation and the self-contained study.

An initial root dependency installation produced partial ignored `node_modules` and downloaded headers, then failed building `kerberos`. The selected Visual Studio 2022 Community toolchain lacks required Spectre-mitigated libraries; log: [install.log](install.log), error `MSB8040`. The install was attempted during the exploratory patch, so it is not a verified clean baseline. Do not treat partial node_modules as a successful install.

No native crash test, accessibility session, startup/memory benchmark, code-signing, package qualification, updater, or public distribution was completed. Browser study verification is separate evidence.

## G0 receipt — PASSED

```text
Date / owner:        2026-09-24 / Claude (Opus 5.5), taking over from Codex session 01a0d625
Package and gate:    W0 / G0
Source head:         2242ebbb54efeeb0129e08e919e7e8d43033cd83 (1.139.0)
Dirty patch:         build/npm/postinstall.ts only (diff sha256 prefix 7809809dcec4a25c):
                     JS-only postinstall concurrency min(cpus,8) -> min(cpus,3), override VSCODE_INSTALL_CONCURRENCY
MSB8040 resolution:  Selected toolchain = VS 2022 Community 17.14.37027.9, MSVC 14.44.35207, x64.
                     lib/spectre was missing. Added component
                     Microsoft.VisualStudio.Component.VC.Runtimes.x86.x64.Spectre via
                     setup.exe modify --passive (must be elevated: unelevated run exits 5007).
                     Mitigations NOT disabled. BuildTools 2022 instance has no MSVC; not used.
Commands/results:    npm ci (VSCODE_INSTALL_CONCURRENCY=3)  -> EXIT 0, 1582 pkgs, 8m, kerberos.node built  [evidence/w0-install.log]
                     npm run compile-client                -> EXIT 0, 2.47 min                            [evidence/w0-compile.log]
                     node build/lib/preLaunch.ts           -> EXIT 0, Electron + built-in exts             [evidence/w0-prelaunch.log]
                     VSCODE_SKIP_PRELAUNCH=1 scripts\code.bat --user-data-dir <scratch>\profile
                       --extensions-dir <scratch>\ext --disable-workspace-trust <fixtures> <fixtures>\note.md
                     -> window "note.md - fixtures - Code - OSS Dev" (pid 19020)     [evidence/w0-launch*.log]
                     compile-copilot deliberately NOT run (AI extension; slated for removal in W1).
Smoke (disposable fixture, SendKeys-driven):
                     type + Ctrl+S -> text on disk ............................ PASS
                     undo x3 + Ctrl+S -> bytes identical to original fixture .. PASS
                     Ctrl+Shift+` terminal, echo > term.txt -> file created ... PASS
                     window close -> all processes exit, ext host exit code 0 . PASS
Evidence:            evidence/w0-baseline-launch.png (first screen = "Sign in to use GitHub Copilot" onboarding)
                     evidence/w0-baseline-smoke.png
Explained log noise: "Extension host did not start in 10 seconds" + 4 unresponsive/responsive cycles
                     on cold dev launch (unminified out/, first run); host started pid 14216, exited 0.
                     "Most NODE_OPTIONs are not supported in packaged apps" — Electron dev-mode warning.
Limitations:         Dev build (out/), not a packaged artifact. Smoke is keystroke-driven, not the
                     upstream smoke-test suite. Not yet measured: startup time, memory.
```

## macOS lane — dev build PASSED

```text
Date / owner:        2026-09-28 / Claude (Opus 5.5), Mac lane for the owner
Package and gate:    macOS dev build + smoke gate (tacet/tools/smoke.mjs, now cross-platform)
Host:                MacBook, Apple silicon arm64, 8 GB RAM, macOS 26.4, Node 24.18.0 (nvm), npm 11.16.0
Source head:         branch margin/mac (off margin/notes-first 1237bfc8)
Changed paths:       product.json darwinBundleIdentifier = com.mazenzwin.margin;
                     resources/darwin/code.icns = Tacet sheet icon (from design/assets/icon/tacet-app-icon-1024.png);
                     smoke.mjs launches scripts/code.sh, Cmd/Option chords, stops its own processes;
                     markdownEditorProvider.ts ignores change events with no content changes (see below)
Commands/results:    VSCODE_INSTALL_CONCURRENCY=3 npm ci  -> EXIT 0, no native build errors
                     npm run compile                     -> EXIT 0, 1.5 min
                     node build/lib/preLaunch.ts          -> EXIT 0 (Electron darwin-arm64 = Tacet.app)
                     node tacet/tools/smoke.mjs mac1     -> typingCases FAIL 5/7 (after-heading, middle)
                     node tacet/tools/smoke.mjs mac3/mac4 -> every check PASS, typing cases 7/7, exit 0
Bug found and fixed: the first edit after open/save (and undo back to saved) fires
                     onDidChangeTextDocument with no content changes (dirty-state flip). The Markdown
                     editor host treated it as an external edit, posted an authoritative update and
                     advanced the edit epoch, so keystrokes already in flight were dropped as stale
                     (typing " title" after a heading saved " tle"). Platform-independent; the slower
                     Mac exposed it. Fix: ignore events with contentChanges.length === 0.
Evidence:            tacet/evidence/mac1-smoke.json (before), mac3-*.png + mac3-smoke.json (after)
Limitations:         dev build (out/); packaged, signed, notarized .app/.dmg not yet qualified.
```

## Next action

W1: Tacet identity + AI removal. The removal inventory is being compiled into `evidence/w1-ai-inventory.md`. Order: (1) strip Copilot/chat onboarding and chat/agent contributions from workbench mains, (2) services/processes, (3) extension API surfaces, (4) built-in AI extensions + product.json keys, (5) packaging; then product identity (app id, data dir, URI scheme, white theme, icon). Gate G1 per the plan.

## Handoff update template

```text
Date / owner:
Package and gate:
Source head + included dirty patch hash:
Artifact/profile/fixture identities:
Changed paths and user behavior:
Exact commands and results:
Evidence paths:
Remaining limitations/blocker:
Next bounded action:
```

Current information outranks this snapshot if another developer has changed the tree. Always inspect status before acting.

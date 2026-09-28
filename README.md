# Margin

**A quiet place for your files.**

An AI-free, notes-first desktop editor built from Code OSS. Paper-white, precise, and useful with a single file open. Markdown, plain text, and code share one dependable document system.

This repository currently contains the **requirements, design system, generated concepts, interactive design study, implementation plan, and pinned upstream source**. It is **not a built or release-qualified desktop app**.

## Build and run

One branch builds both platforms. Node must match `.nvmrc` (24.18.0).

**macOS** (Apple silicon or Intel; Xcode command line tools):

```sh
nvm use                                   # 24.18.0
VSCODE_INSTALL_CONCURRENCY=3 npm ci
npm run compile
./scripts/code.sh                         # dev build
node margin/tools/smoke.mjs mac --skip-prelaunch   # smoke gate
```

**Windows** (x64; Visual Studio 2022 with C++ and Spectre-mitigated libraries, see [STATE](margin/STATE.md)):

```powershell
nvm use 24.18.0
$env:VSCODE_INSTALL_CONCURRENCY=3; npm ci
npm run compile
.\scripts\code.bat
node margin\tools\smoke.mjs win --skip-prelaunch
```

Package: `npm run gulp vscode-darwin-arm64-min` (macOS) or `npm run gulp vscode-win32-x64-min` (Windows).

## Start here

1. [Opus build handoff](margin/OPUS-HANDOFF.md): the execution prompt and first assignment.
2. [Product requirements](margin/docs/01-PRODUCT.md): audience, differentiation, scope, workflows, and decision rules.
3. [Document and file contract](margin/docs/02-DOCUMENT-CONTRACT.md): persistence, fidelity, recovery, concurrency, and Markdown.
4. [Screen specification](margin/docs/03-SCREENS.md): 20 screens and states, including failures and compact windows.
5. [Design system](margin/docs/04-DESIGN-SYSTEM.md): tokens, typography, icon, components, motion, and accessibility.
6. [Architecture and modules](margin/docs/05-ARCHITECTURE.md): source integration, ownership, interfaces, and dependencies.
7. [AI removal specification](margin/docs/06-NO-AI.md): what removal means and how to prove it.
8. [Execution plan](margin/docs/07-EXECUTION.md): sequenced work packages and completion gates.
9. [Acceptance matrix](margin/docs/08-ACCEPTANCE.md): behavior, recovery, performance, security, and release checks.
10. [Research and source audit](margin/docs/09-RESEARCH.md): sources, observations, hypotheses, and limits.
11. [Current state](margin/STATE.md): exact starting point and native build prerequisite.

## See the direction

Open [the interactive design study](margin/prototype/index.html) in a browser. It uses sample notes and browser storage. It is not the native app or a persistence qualification harness. The sample terminal runs nothing.

![Margin writing concept](margin/concepts/01-writing.png)

- [Capture, find, read, and recover](margin/concepts/02-everyday-states.png)
- [Code and compact windows](margin/concepts/03-code-and-compact.png)
- [Art prompts and corrections](margin/concepts/README.md)

Images are generated concept art. Written specifications govern behavior and measurements.

## Decisions already made

- Windows and macOS from one branch. Apple-level care adapted to each platform's conventions.
- White is the default identity. Accessibility and system high contrast still work.
- No sign-in, mandatory vault, cloud service, or AI features.
- Real files; original paths, text, encodings, and Markdown remain under the user's control.
- Write, Read, and Code are views of the same document.
- Coding tools are available deliberately; the first note opens into a quiet writing surface.
- Recovery and file fidelity are release gates.

## Source identity

Code OSS `1.139.0`, commit `2242ebbb54efeeb0129e08e919e7e8d43033cd83`, dated September 22, 2026. Local branch: `margin/notes-first`. Upstream source retains its [MIT license](LICENSE.txt); its original README is [preserved](README.upstream.md).

Early implementation experiments are [quarantined](margin/experiments/README.md). They are sketches, not approved production architecture. Begin by obtaining a working baseline build.

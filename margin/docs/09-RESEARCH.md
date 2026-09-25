# Research and source audit

Research date: September 24, 2026. This is desk research and inspected source, followed by product hypotheses. No customer interviews, native usability sessions, or native benchmarks were performed in this run. Public issue reports are individual reports, not prevalence estimates or locally reproduced bugs.

## What is actually supported by evidence

| Source | Observation | Implication for Margin | Limit |
| --- | --- | --- | --- |
| [VS Code Markdown documentation](https://code.visualstudio.com/docs/languages/markdown) | Documents headings, links, navigation, search, preview, and link validation/update tools | Reuse mature document navigation and file services; make useful actions discoverable to a file user | Feature documentation does not prove usability for non-programmers |
| [VS Code AI troubleshooting FAQ](https://code.visualstudio.com/docs/agents/agent-troubleshooting/faq) | Describes a setting to disable/hide AI features | A setting can inform a temporary development baseline; it cannot prove source/package removal | Shipping audit must inspect the exact fork and artifact |
| [Typora](https://typora.io/) | Presents editing with live rendering, file browsing, outline, focus, and counts | These establish a relevant competitive baseline for Markdown writing | Vendor claims; no hands-on competitor benchmark was run |
| [Bear: where notes are located](https://bear.app/faq/where-are-bears-notes-located/) | Describes notes stored in a database | Margin's direct-file contract is a deliberate product distinction; folder access must not become an import | Database-backed apps can have valuable features; this is an architectural comparison |
| [VS Code issue 336324](https://github.com/microsoft/vscode/issues/336324) | A user reports broken search after following a Markdown file link with a line fragment | Include combined link → open → search → edit flows, not isolated widget tests | Reported against 1.137 on macOS ARM64; not reproduced here |
| [VS Code issue 321623](https://github.com/microsoft/vscode/issues/321623) | Reports rich Markdown editor accessibility problems in high-contrast themes | White styling cannot bypass the rich view's contrast and system-color behavior | Report observed open during research; not a claim about all builds |
| [VS Code issue 332889](https://github.com/microsoft/vscode/issues/332889) | Requests Ctrl+wheel text zoom in the rich editor and explains difficulty using settings/global zoom for this task | Provide document text zoom with parity across rich and source views; keep UI scale separate | One accessibility-related request, not a population survey |

Apple's HIG writing page was opened but its dynamic content did not render in the research browser. It is not used as evidence. Obsidian help/search attempts also did not produce dependable readable content; do not invent findings from those attempts. The visual direction comes from the user's explicit brief and the local Apple-design skill, adapted to Windows.

## Existing project context

Notion was searched for VS Code, Markdown, notepad, and editor. No existing Margin/editor product brief was found. The AI search route was plan-gated; ordinary page search/fetch was available.

The adjacent [05 Decisions page in BOARD](https://app.notion.com/p/33f9316183be815d8a86f88b7abd3381?pvs=204), last edited April 11, 2026, records the practice of keeping project decisions in repository Markdown so they survive chat handoffs. That supports the format of this packet. It does **not** authorize a Margin product feature or establish customer demand. The current user's Windows/notes/white/no-AI decisions govern this new project. No Notion pages were modified.

## How people may be using these files

These are hypotheses derived from the brief, existing product surfaces, and issue reports. Validate them with the task sessions in the product spec.

1. **Capture:** a thought needs somewhere to land before it has a filename. The design implication is a durable blank draft, with organization deferred.
2. **Receive:** a README, instructions, or generated report arrives as a loose `.md`. The design implication is Open With, readable rendering, an obvious path, and no workspace ceremony.
3. **Revise:** the reader changes a line, checks a task, or repairs a link. The design implication is low-friction Write and Read views over the same source, with reversible edits.
4. **Return:** a user remembers a phrase more readily than the filename. The design implication is scoped content search with snippets and disambiguating paths.
5. **Develop:** a note becomes a specification or contains a script. The design implication is precise source editing and conventional development tools in the same window.
6. **Recover:** a file changes elsewhere, a window closes, or storage fails. The design implication is a persistent, understandable recovery path rather than an optimistic saved badge.

These jobs explain the selected features. They do not justify adding a graph, cloud account, project board, or another database. Margin's main bet is that a calm writing surface plus the reach of Code OSS is useful to people who already exchange real files.

## Inspected upstream identity

Repository: `https://github.com/microsoft/vscode.git`.

- Tag: `1.139.0`.
- Commit: `2242ebbb54efeeb0129e08e919e7e8d43033cd83`.
- Commit timestamp: `2026-09-22T15:13:34Z`.
- Local branch: `margin/notes-first`.
- `.nvmrc`: Node `24.18.0`; `.npmrc`: Electron `43.6.0`.

Source observations apply to that commit, not an arbitrary future release. Re-check symbols before editing a newer source head.

## Findings that change implementation

### Existing rich editor

`extensions/markdown-language-features/markdown-editor-src/editor.ts` uses `@vscode/markdown-editor`'s model, view, and controller. The host/provider includes ordered edits, edit epochs, expected document changes, native undo forwarding, source positions, and view state. The package manifest references `@vscode/markdown-editor` at `^0.0.2-99`.

This changes the starting decision: qualify the existing engine before adopting a second rich editor. Its existence is not proof that Margin's lossless-editing or accessibility gates pass. A targeted spike must measure actual fidelity and focus/IME behavior.

### Read state and external resources

`src/preview/markdownEditorProvider.ts` inside the Markdown extension reads a global rich-editor read-only preference, with a true fallback. Margin needs per-document mode and a writable new draft. Changing a single default is insufficient if another document can change the shared state.

The inspected rich webview CSP permits HTTPS image/media sources. Margin's passive-open contract requires preventing unsolicited external loads. Link opening and permitted image loading must be explicit, separately mediated actions.

### The removal boundary is broad

Workbench entry points, extension API participants, desktop/main processes, shared process channels, product configuration, package installation, and packaging all contain AI-related integration. A renderer import edit and a Copilot setting cannot remove all of that. The architecture and no-AI specifications list the initial source seams; W1 must turn them into a complete reachable dependency manifest.

Ordinary VS Code uses “agent” in some non-AI remote infrastructure names. A word-based global delete would break valid functionality. Classify behavior and dependencies before removing modules.

### Build cost is a real product constraint

The host has 16 GB RAM. Upstream install scripts include up to eight concurrent package installs. Native prerequisite validation and bounded concurrency come before iterative full builds. A Code OSS fork also inherits a larger runtime than Notepad; the product's memory/startup goals are unmeasured targets until the actual release build is profiled.

## Experiment and native build evidence

An early source/extension spike explored branding, defaults, draft navigation, task/heading inspection, and AI suppression. It is preserved as [a patch](../evidence/implementation-spike.patch) and [quarantined experiments](../experiments/README.md). It is not an accepted architecture or a qualified app. Tracked upstream executable source and package files were restored to the pinned commit before this handoff.

The initial dependency installation failed in `node_modules/kerberos`. The [installation log](../install.log) records MSBuild error `MSB8040`: the selected Visual Studio toolchain lacked required Spectre-mitigated libraries. Selected instance: Visual Studio 2022 Community, with MSBuild under `VC/v170`. Electron header download succeeded; this did not produce a working desktop build.

The attempt occurred while the exploratory patch was present, so it is not a clean-baseline qualification. W0 must first resolve and verify the selected compiler components, then obtain a repeatable upstream launch. No security mitigations should be disabled to make the prerequisite error disappear.

## Confidence and next evidence

| Decision | Current confidence | Next proof |
| --- | --- | --- |
| Notes-first, Windows, white, no AI | Confirmed user direction | Preserve through implementation |
| Loose files and durable drafts | Strong product hypothesis | Observed capture/save/reopen tasks |
| Reuse native document services | Strong architectural starting point | Save/crash/race tests on actual build |
| Reuse rich Markdown engine | Source-backed candidate | Fidelity/IME/contrast qualification |
| No unrestricted extension marketplace in v1 | Deliberate scope to keep shipped-feature promise enforceable | Reviewed built-in capability inventory |
| Startup/memory budgets | Unmeasured targets | Controlled release benchmarks |
| Consumer adoption or willingness to pay | Unknown | User sessions and subsequent adoption research |

There is no validated market-size, monetization, crash-recovery, performance, accessibility, or native-release claim in this packet.

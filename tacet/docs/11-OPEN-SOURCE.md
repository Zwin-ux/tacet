# 11 — Open-source readiness

Status: requirements, 2026-09-27. Audit of `margin/notes-first` at `f00699ee` plus the working tree seen during the audit. Owner of this file: coordinator. It extends milestone M11 in [SHIP-PLAN.md](../SHIP-PLAN.md) and the release gate G7 in [07-EXECUTION.md](07-EXECUTION.md). Where this file is more specific than SHIP-PLAN about the public repo, this file wins. Owner decisions in SHIP-PLAN still win over this file.

## The bar

Tacet is the owner's flagship public project. The target is a repo that a senior engineer is proud to link on a résumé:

1. **Clean.** Nothing in the repo or its history that the owner would not show a stranger.
2. **Honest.** Every claim in the README has a check behind it. Every badge is green because a real job passed.
3. **Easy to build.** A stranger with a Windows PC follows the README and gets a running Tacet. CI proves this on every push.
4. **Legally correct.** Microsoft's MIT notice is kept. Microsoft's trademarks are gone. Every third-party license is honored and listed.

## How to read this file

Each requirement has:

- **ID** (OS-n) and a one-line requirement.
- **Why.** The risk it removes.
- **Check.** A pass/fail test someone can run. Commands are Git Bash from the repo root unless marked PowerShell.
- **Now.** What the audit found, with file paths and line numbers.
- **When.** `P` = blocker before the first public push. `M2` / `M10` / `M11` = milestone in SHIP-PLAN. `v1.x` = after 1.0.

A requirement that says "owner decision" cannot be closed by an agent.

## Audit summary (what the repo looks like today)

| Area | Finding | Evidence |
| --- | --- | --- |
| Git | **Shallow clone.** History starts at the upstream commit. A push to a new GitHub repo from a shallow clone is rejected ("shallow update not allowed"). | `.git/shallow` = `2242ebbb54ef…`; `git rev-parse --is-shallow-repository` = `true` |
| Git | Remote `origin` is `https://github.com/microsoft/vscode.git`. The brief said "no remote"; there is one. | `git remote -v`; `margin/STATE.md:10` |
| Git | 36 Tacet commits, all authored `Zwin-ux <the owner's personal address>`. A public push exposes this address. | `git log --format='%an <%ae>' 2242ebbb..HEAD` |
| Git | Pack is 121 MiB. Tacet-authored tracked content is about 63 MB in 613 files under `margin/`. | `git count-objects -vH`; `git ls-tree -r -l HEAD margin` |
| Size | `margin/design` 52.9 MB / 345 files (mockups 2–2.7 MB PNG each, three AI video studies `.mp4`, fonts). `margin/evidence` 6.0 MB / 230 files (150 PNG, 42 logs, 31 JSON, one `.patch`). `margin/concepts` 3.5 MB. | `margin/design/assets/animated/studies/mk-b-caret-wink.kling3.mp4` (1.45 MB), `…/mk-a-pen-stroke.kling3.mp4` (1.23 MB) |
| Privacy | 490 occurrences of the absolute user path `%USERPROFILE%\…` in 43 tracked files. | `margin/install.log` (70), `margin/evidence/w0-compile.log` (60), `margin/evidence/w1-compile.log` (60), every `margin/evidence/*-smoke.json`, `margin/STATE.md:9`, `margin/BUNDLE.md:5`, `margin/OPUS-HANDOFF.md:41`, `margin/evidence/VERIFICATION.md:28` |
| Secrets | No token shapes found (`ghp_`, `github_pat_`, `sk-`, `AKIA`, `xox`, private keys, `hf_`). The only hit is the pattern list in `margin/design/AGENT-FILES.md:270`. | Grep over `margin/` |
| Legal | `LICENSE.txt` has only the Microsoft line. Tacet-authored files carry **"Copyright (c) Microsoft Corporation"** headers, because the lint and hygiene rules force that exact header. | `LICENSE.txt:3`; `eslint.config.js:141-150`; `build/hygiene.ts:19-24`; `src/vs/workbench/contrib/margin/browser/margin.contribution.ts:2`; `extensions/margin-welcome/src/*.ts:2`; `margin/tools/smoke.mjs:2` |
| Legal | Microsoft identity still in build and installer. | `build/lib/electron.ts:146` `companyName: 'Microsoft Corporation'`, `:147` `copyright: 'Copyright (C) 2026 Microsoft…'`; `build/win32/code.iss:11` `AppPublisher=Microsoft Corporation`; `package.json:2-7` (`code-oss-dev`, author Microsoft, `distro`), `:261-267` (repository and bugs → microsoft/vscode) |
| Legal | `product.json` is mostly upstream Code OSS. `nameShort`/`nameLong` changed to "Tacet" in the working tree during the audit (identity lane in flight). Everything else is upstream. | `product.json` lines 4-38 (see OS-L4) |
| Legal | Animate UI files are under "MIT + Commons Clause", with the license file kept next to them. Not listed in `ThirdPartyNotices.txt`. | `extensions/margin-welcome/webview/src/components/animate-ui/LICENSE.md` |
| Legal | `ThirdPartyNotices.txt` (3,439 lines, about 60 components) and `cglicenses.json` are upstream. They list nothing Tacet added (React, Motion, Radix, Animate UI, fonts). The generator is Microsoft Component Governance, which Tacet cannot run. | `ThirdPartyNotices.txt`; `.github/instructions/oss-third-party-notices.instructions.md:7-21`; `build/azure-pipelines/oss/*` |
| Build | Committed build output: `extensions/margin-welcome/media/welcome.js` (358 KB bundle). An untracked `extensions/margin-welcome/tsconfig.tsbuildinfo` sits in the tree. | `git ls-tree -r -l HEAD extensions/margin-welcome` |
| CI | `.github/workflows/pr.yml` runs on Microsoft self-hosted 1ES pools (line 23 and every job). Jobs at lines 236-460 build `extensions/copilot`, which no longer exists. 15 upstream workflows in total. `.github/CODEOWNERS` names Microsoft staff. | `.github/workflows/*.yml`, `.github/CODEOWNERS:2-15` |
| CI | 115 Azure Pipelines files: ESRP signing, CredScan, TSA, CDN upload, Microsoft telemetry extraction. | `build/azure-pipelines/**`, e.g. `config/CredScanSuppressions.json`, `win32/import-esrp-auth-cert.ps1`, `upload-cdn.ts` |
| Community | `CONTRIBUTING.md` = "Contributing to VS Code". `SECURITY.md` = Microsoft block pointing to aka.ms. No `CODE_OF_CONDUCT.md`, no `SUPPORT.md`, no `CHANGELOG`. Issue templates include `copilot_bug_report.md`; `config.yml` sends questions to the `visual-studio-code` Stack Overflow tag. | root files; `.github/ISSUE_TEMPLATE/*` |
| AI tooling | Upstream AI contributor tooling is still in the tree of an AI-free product: `.github/copilot-instructions.md`, `.github/instructions/*.instructions.md` (29 files incl. `chat`, `language-model-tool-descriptions`, `kusto`, `telemetry`), `.github/agents/`, `.github/skills/`, `.agents/skills/`, `.claude/CLAUDE.md` (a copy of the VS Code Copilot instructions), `AGENTS.md`. | Glob of those paths |
| README | Current `README.md` says the repo "is not a built or release-qualified desktop app" and sends readers to an agent handoff prompt (`margin/OPUS-HANDOFF.md`). | `README.md:7`, `:11` |
| Name | A shipping product already uses the name: "Tacet — local-first markdown notes for Mac" at gomargin.app. Same category, near-identical pitch. Also MarginNote (reading app). | Web search, 2026-09-27 |

---

## 1. Legal

### OS-L1 — Keep the Microsoft MIT notice, add Tacet's

- **Requirement.** `LICENSE.txt` keeps the Microsoft copyright line and the full MIT text unchanged. It adds a second line: `Copyright (c) 2026 - present Tacet contributors`. The installer and the About dialog show both lines.
- **Why.** MIT's only condition is that the copyright notice and permission notice ship "in all copies or substantial portions". Removing Microsoft's line breaks the license. Not adding Tacet's leaves Tacet's own work without a clear owner.
- **Check.** `grep -c "Microsoft Corporation" LICENSE.txt` = 1 and `grep -c "Tacet contributors" LICENSE.txt` = 1. Install the release build; `resources\app\LICENSE.txt` has both lines.
- **Now.** Only the Microsoft line (`LICENSE.txt:3`). Fail.
- **When.** P.

### OS-L2 — Correct copyright headers on Tacet-authored files

- **Requirement.** Files that Tacet writes from scratch carry a Tacet header. Upstream files that Tacet edits keep the Microsoft header unchanged. The lint rule and the hygiene task accept exactly these two headers and nothing else. Proposed Tacet header:
  ```
  /*---------------------------------------------------------------------------------------------
   *  Copyright (c) Tacet contributors. All rights reserved.
   *  Licensed under the MIT License. See License.txt in the project root for license information.
   *--------------------------------------------------------------------------------------------*/
  ```
- **Why.** A Microsoft copyright line on code Microsoft did not write is a false statement. Removing Microsoft's header from upstream files is a license and courtesy problem. Both are the first thing a careful reviewer checks in a fork.
- **Check.**
  ```bash
  git ls-files 'src/vs/workbench/contrib/margin/**' 'extensions/margin*/**' 'extensions/theme-margin/**' 'margin/tools/**' \
    | grep -E '\.(ts|tsx|mts|js|mjs|css)$' | xargs grep -l "Copyright (c) Microsoft" ; echo "exit=$?"
  ```
  prints no files. `git diff 2242ebbb HEAD | grep '^-.*Copyright (c) Microsoft'` prints nothing (no Microsoft header removed from an upstream file). `npm run eslint` and `npm run hygiene` pass.
- **Now.** Fail. The rule at `eslint.config.js:141-150` and `build/hygiene.ts:19-24` allows only the Microsoft header, so new files copied it: `margin.contribution.ts:2`, `extensions/margin-welcome/src/{extension,importer,jsonc,notes}.ts:2`, `margin/tools/smoke.mjs:2`.
- **When.** P. One commit: widen both rules, then re-header Tacet-authored files.

### OS-L3 — No Microsoft trademarks or branding in the product

- **Requirement.** The shipped app, installer, icons, window titles, About, file properties, Start menu entries and default URLs never use "Visual Studio Code", "VS Code", "Code - OSS", "Microsoft" (as the maker), or any Microsoft logo. Nominative use is allowed only where it describes a fact: "Import settings from VS Code", "Built from Code OSS", "Visual Studio Code is a trademark of Microsoft; Tacet is not affiliated with Microsoft."
- **Why.** Code OSS source is MIT. The VS Code name and logos are not. Microsoft's trademark guidance does not allow a fork to look like VS Code. The owner's M2 gate also says a stranger must not say "VS Code" when shown a screenshot.
- **Check.**
  1. Static: `git grep -n -I -E 'Microsoft Corporation|Microsoft Code OSS|Microsoft\.CodeOSS|Code - OSS|vscode-cdn\.net|github\.com/microsoft/vscode' -- product.json package.json build/lib/electron.ts build/win32/code.iss resources/win32` prints nothing except the kept MIT notice.
  2. User-visible strings: every `localize(...)` containing "VS Code" or "Visual Studio Code" in `src/vs` is either removed, rewritten to "Tacet", or on a reviewed allowlist `margin/tools/brand-allowlist.txt` (nominative uses only).
  3. Artifact: PowerShell `(Get-Item .\Tacet.exe).VersionInfo | Format-List CompanyName,LegalCopyright,ProductName,FileDescription` shows Tacet values.
- **Now.** Fail. `build/lib/electron.ts:146-147`; `build/win32/code.iss:11`; `package.json:5-7, 261-267`; `resources/win32/code.ico` and `code_70x70.png` / `code_150x150.png` are upstream Code OSS art. 42 `localize` calls in 21 files under `src/vs` mention "VS Code" or "Visual Studio Code" (for example `src/vs/workbench/electron-browser/desktop.contribution.ts`, `src/vs/platform/update/common/update.config.contribution.ts`). Many sit in removed or dormant features; each needs a verdict.
- **When.** M2 (identity), verified again at M10 on the packaged artifact.

### OS-L4 — `product.json` is Tacet's, field by field

- **Requirement.** Every identity field in `product.json` is Tacet's own, and every URL points at `github.com/Zwin-ux/margin` or is removed. New installer GUIDs are generated once and never change.

| Line (upstream) | Field | Now | Required |
| --- | --- | --- | --- |
| 2-3 | `nameShort`, `nameLong` | "Tacet" in working tree (uncommitted) | `Tacet` |
| 4 | `applicationName` | `code-oss` | `margin` |
| 5-6 | `dataFolderName`, `sharedDataFolderName` | `.vscode-oss`, `.vscode-oss-shared` | `.margin`, `.margin-shared`. Today Tacet shares a profile folder with any Code OSS build on the PC (breaks A35). |
| 7 | `win32MutexName` | `vscodeoss` | `margin` |
| 9-10 | `licenseUrl`, `serverLicenseUrl` | microsoft/vscode | `https://github.com/Zwin-ux/margin/blob/main/LICENSE.txt`; server field removed (remote is removed) |
| 14-16 | `serverApplicationName`, `serverDataFolderName`, `tunnelApplicationName` | Code OSS server/tunnel | Remove (remote and tunnels deleted per `docs/10-REBUILD.md`) |
| 17-19 | `win32DirName`, `win32NameVersion`, `win32RegValueName` | "Microsoft Code OSS", `CodeOSS` | `Tacet`, `Tacet`, `Tacet` |
| 20-23 | `win32x64AppId`, `win32arm64AppId`, `win32x64UserAppId`, `win32arm64UserAppId` | Code OSS GUIDs | New GUIDs. Same GUID = the Tacet installer upgrades or uninstalls a Code OSS install. |
| 24 | `win32AppUserModelId` | `Microsoft.CodeOSS` | `Tacet.Tacet` (or `Zwin-ux.Tacet`); taskbar grouping and toasts use it |
| 25 | `win32ShellNameShort` | `C&ode - OSS` | `&Tacet` ("Open with Tacet") |
| 26-27 | `win32TunnelServiceMutex`, `win32TunnelMutex` | tunnel mutexes | Remove |
| 28-32 | `darwinBundleIdentifier`, profile UUIDs, `linuxDesktopName`, `linuxIconName` | `com.visualstudio.*` | `app.margin.Tacet` etc., or removed while Windows-only |
| 34 | `reportIssueUrl` | microsoft/vscode issues | `https://github.com/Zwin-ux/margin/issues/new/choose` |
| 37 | `urlProtocol` | `code-oss` | `margin` (R11 CLI and links) |
| 38 | `webviewContentExternalBaseUrlTemplate` | `https://{{uuid}}.vscode-cdn.net/…` (Microsoft CDN) | Remove, or prove unused on desktop (N-04 network audit) |
| 40-44 | `trustedExtensionAuthAccess` | `vscode.github-authentication` (extension deleted) | Remove |
| 45-81 | `onboardingKeymaps` | Marketplace extension IDs (`vscodevim.vim` …) | Remove (no marketplace; Tacet has its own first boot) |
| 82-119 | `onboardingThemes` | VS Code themes | Remove or list Tacet themes only |

- **Why.** These fields decide install paths, registry keys, profile folders, protocol handlers and where bug reports go. Wrong values cause real harm: a shared profile folder, an installer that removes someone's Code OSS, bug reports filed at Microsoft.
- **Check.** `node -e "const p=require('./product.json');const bad=JSON.stringify(p).match(/code-oss|CodeOSS|vscodeoss|visualstudio|microsoft|vscode-cdn/gi);if(bad){console.error(bad);process.exit(1)}"` exits 0. The four AppIds differ from upstream `2242ebbb:product.json`.
- **Now.** Fail except `nameShort`/`nameLong` (in progress).
- **When.** M2. The GUIDs and `applicationName` must be final before the first public release, because they cannot change after users install.

### OS-L5 — Animate UI and the Commons Clause (owner decision)

- **Requirement.** Tacet states in `LICENSE.txt` (a short "Exceptions" section) and in `ThirdPartyNotices.txt` that the files in `extensions/margin-welcome/webview/src/components/animate-ui/` are under "MIT + Commons Clause" (Copyright (c) 2025 Elliot Sutton), not plain MIT. The same applies to any vanilla port of an Animate UI component in `src/vs/workbench/contrib/margin/browser/kit/` (planned in `margin/design/UI-KIT.md`), because a port is a derivative work.
- **Why.** The Animate UI license lets Tacet use and distribute the components "as part of an application". So shipping them inside Tacet, and publishing Tacet's source, is allowed. It forbids selling or redistributing "the components themselves in their original form, alone or in a bundle". Two consequences:
  1. Tacet is not 100 % OSI open source while these files are in it. The README must not say "100 % MIT".
  2. A downstream fork that lifts the components out as a kit breaks the clause. People who reuse Tacet's code must be told.
- **Options for the owner.**
  - **A. Keep and disclose** (lowest effort). Carve-out in LICENSE, NOTICE and README License section. Badge says "MIT (with exceptions)".
  - **B. Replace before 1.0.** Write Tacet's own MIT components with Radix primitives (MIT) and Motion (MIT). Animate UI stays a visual reference only. The whole repo is then plain MIT. Cost: the first-boot controls (3 components today) and every kit port.
  - Recommendation: **A for the first push, decide B before v1.0.** Do not port more Animate UI components into `kit/` until this is decided; each port adds to the carve-out.
- **Check.** `grep -n "Commons Clause" LICENSE.txt ThirdPartyNotices.txt README.md` finds all three. `find extensions/margin-welcome/webview/src/components/animate-ui -name LICENSE.md` exists. The packaged `margin-welcome` extension contains the license text (check `resources\app\extensions\margin-welcome\` in the install).
- **Now.** License file present in the component folder. Not in LICENSE, NOTICE or README. Nothing is ported to `kit/` yet. Partial.
- **When.** P (disclosure). Owner decision A/B before M10.

### OS-L6 — Fonts

- **Requirement.** Ship only fonts that may be redistributed, each with its license next to it and in `ThirdPartyNotices.txt`.
  - **Cascadia Code** (Microsoft, SIL OFL 1.1, Reserved Font Name "Cascadia Code"): ship unmodified, keep the name. If Tacet subsets or changes it, the modified font must be renamed.
  - **Source Serif 4** (Adobe, SIL OFL 1.1, RFN "Source"): same rule.
  - **Segoe UI Variable**: a Windows system font. **Never commit or ship the font file.** Reference it by name in CSS only, with a fallback stack (`"Segoe UI Variable Text", "Segoe UI", system-ui, sans-serif`). Screenshots that show it are fine.
- **Why.** OFL allows bundling with software but requires the license to travel with the font and forbids selling the font alone. Segoe UI Variable is licensed with Windows only.
- **Check.** `git ls-files | grep -i -E 'segoe.*\.(ttf|otf|woff2?)$'` prints nothing. For each bundled `.ttf` there is a `LICENSE*` in the same folder and an entry in `ThirdPartyNotices.txt`. In the install, the fonts and license files are side by side.
- **Now.** Fonts committed under `margin/design/fonts/` with licenses (`margin/design/fonts/README.md:5-12`). Not yet wired into the product (no reference in `src/` or `extensions/`). Not in `ThirdPartyNotices.txt`. The fonts README already lists the release steps (line 12). Partial.
- **When.** M10.

### OS-L7 — Third-party notices and SBOM regenerated for what Tacet actually ships

- **Requirement.** `ThirdPartyNotices.txt` lists every third-party component in the packaged Windows artifact, and nothing that was removed. An SBOM in CycloneDX JSON is attached to every release. Both are generated by a script in the repo, not by hand, and not by Microsoft Component Governance (Tacet has no access to it).
- **Why.** Upstream notices cover components Tacet deleted (Copilot, telemetry, remote, git) and miss what Tacet added (React 19, react-dom, scheduler, Motion 13, framer-motion, motion-utils, `@radix-ui/*`, Animate UI, Tailwind output in the bundle, tslib, the fonts, the SchemaStore schema planned for AF8). A wrong notice file is a license breach in both directions.
- **Check.**
  1. `node margin/tools/notices.mjs --check` (to be written) regenerates notices from `package-lock.json`, `remote/package-lock.json`, every shipped `extensions/*/package-lock.json`, `extensions/margin-welcome/webview/package-lock.json`, all `cgmanifest.json` files of shipped extensions, and `cglicenses.json`; it exits 1 if the committed file differs. The upstream scanner `build/azure-pipelines/oss/scan-licenses.ts` and `merge-notices.ts` can be reused without the CG step.
  2. `npx @cyclonedx/cyclonedx-npm --omit dev --output-file sbom.cdx.json` (or equivalent) runs in the packaging job; the file is a release asset.
  3. A diff test: every package under `resources\app\node_modules` of the install appears in the notices.
- **Now.** Fail. Upstream file unchanged; no React, Motion, Radix or Animate UI entry.
- **When.** M10.

### OS-L8 — Name and trademark check for "Tacet" (owner decision)

- **Requirement.** Before the repo goes public, the owner records a name decision in SHIP-PLAN: search USPTO (TESS/Trademark Center), EUIPO, the Microsoft Store, winget, GitHub and the web for "Tacet" in class 9 (software). Record results and the decision.
- **Why.** A rename after launch loses stars, links and search rank, and changes `applicationName`, data folders and AppIds (OS-L4), which breaks upgrades.
- **Now.** SHIP-PLAN says the GitHub name `Zwin-ux/margin` is free (line 23) and lists "Final product name check (trademark)" as owner-only (line 118). The audit found **"Tacet — local-first markdown notes for Mac" (gomargin.app)**: same category, same pitch (local-first Markdown, plain files, no account). High confusion risk. Also MarginNote (reading and annotation, Beijing Yunsi). Open.
- **Check.** SHIP-PLAN "Owner decisions" table has a dated row: name kept or changed, with the search record.
- **When.** P. **Owner decision.**

### OS-L9 — Contribution licensing

- **Requirement.** Inbound = outbound. Contributions are accepted under the repo license with a **DCO sign-off** (`Signed-off-by:`), enforced by a free DCO check. No CLA.
- **Why.** A DCO is light and standard. It gives the owner a record that each contributor had the right to submit the code, which matters because the repo mixes MIT and Commons Clause files.
- **Check.** CONTRIBUTING.md explains DCO; a PR without sign-off fails the DCO status check.
- **Now.** None. Upstream CONTRIBUTING references Microsoft's CLA flow.
- **When.** M11.

---

## 2. Repo hygiene (what must not be pushed)

The repo has never been pushed. **Rewriting local history now is free. After the first push it is expensive and visible.** So all hygiene work happens before the first push, as one planned history rewrite.

### OS-H1 — Push a complete history, not a shallow clone (owner decision)

- **Requirement.** The public repo has a valid, complete history. Pick one:
  - **A. Full upstream history** (recommended). `git fetch --unshallow` from microsoft/vscode, then push. Anyone can run `git log`, `git blame` and `git merge-base` against upstream. Upstream sync (OS-U*) is a normal merge. Cost: a larger first clone.
  - **B. Squashed import.** One root commit "Import Code OSS 1.139.0 (2242ebbb)" plus the Tacet commits. Small clone. Upstream sync then needs `git replace --graft` or a patch workflow. Blame of upstream code is lost.
  - Do **not** use the GitHub "Fork" button: forks of microsoft/vscode are hidden from code search, show "forked from microsoft/vscode", and inherit Actions defaults for forks.
- **Why.** GitHub rejects pushes from a shallow clone to a new repo. Choosing late means redoing the history rewrite.
- **Check.** `git rev-parse --is-shallow-repository` = `false` before push (A), or the root commit message names the upstream tag and commit (B). `git merge-base HEAD 1.139.0` = `2242ebbb…` (A).
- **Now.** Shallow at `2242ebbb` (`.git/shallow`). Fail.
- **When.** P. **Owner decision** (recommend A).

### OS-H2 — Rename the upstream remote

- **Requirement.** `origin` = `https://github.com/Zwin-ux/margin.git`. `upstream` = `https://github.com/microsoft/vscode.git`, with push disabled (`git remote set-url --push upstream DISABLED`).
- **Why.** Today `origin` is Microsoft's repo. A habitual `git push` targets Microsoft. It would fail, but it should be impossible.
- **Check.** `git remote -v` shows `upstream … (push) DISABLED`.
- **Now.** `origin` = microsoft/vscode (`margin/STATE.md:10`). Fail.
- **When.** P.

### OS-H3 — Commit identity (owner decision)

- **Requirement.** All public commits use the identity the owner chooses. Recommended: `Zwin-ux <ID+Zwin-ux@users.noreply.github.com>`, applied to the 36 existing commits with `git filter-repo --mailmap` during the OS-H4 rewrite, and set in the repo's `user.email`.
- **Why.** Commit metadata is public and permanent once pushed. The personal Gmail address is in every Tacet commit today.
- **Check.** `git log --format='%ae %ce' 2242ebbb..HEAD | sort -u` shows only the chosen address(es).
- **Now.** `the owner's personal address` on all 36 commits. Open.
- **When.** P. **Owner decision.**

### OS-H4 — One history rewrite removes everything that must not be public

- **Requirement.** Before the first push, run `git filter-repo` once on the Tacet commits to remove these paths **from all history** (not just from HEAD):

| Path | Why | Where it goes instead |
| --- | --- | --- |
| `margin/install.log` | Failed install log, 70 absolute user paths, superseded by the G0 receipt. | Nowhere. |
| `margin/evidence/**` (230 files, 6 MB) | Machine-local logs and screenshots with absolute paths. Evidence belongs to CI runs. | CI artifacts (OS-C*). Keep a short `docs/evidence.md` with the receipt format from `08-ACCEPTANCE.md`. |
| `margin/evidence/implementation-spike.patch` | Abandoned spike. | Nowhere. |
| `margin/experiments/**` | Quarantined sketches, "not approved production architecture" (`README.md` last line). | Nowhere. |
| `margin/OPUS-HANDOFF.md`, `margin/BUNDLE.md`, `margin/verify-packet.mjs`, `margin/evidence/handoff-files.sha256` | Internal agent handoff material with machine paths. | Nowhere (private notes). |
| `margin/design/assets/mockups/*.png`, `concept-v2/**`, `first-boot/*.codex.*`, `icon/candidates/**`, `animated/studies/*.mp4` (about 50 MB) | Large, and they are AI-generated concept art (Codex, Higgsfield, Kling, MiniMax) in the repo of an AI-free product. That invites a bad-faith headline. | A private design archive, or a separate `margin-design` repo. Keep only final, shipped assets (icon, banner, pillars, social preview) and label their provenance. |
| `margin/prototype/**` | Browser study, "not the native app" (`margin/prototype/README.md`). | Optional: keep if linked as "design study"; otherwise remove. |
| Any `node_modules/`, `out/`, `.build/`, `*.tsbuildinfo` | Build output. | `.gitignore`. |

  Also decide for `extensions/margin-welcome/media/welcome.js` (358 KB committed bundle): build it in `compile` from `webview/` and stop committing it (see OS-B4).
- **Why.** Clean history is part of "clean". Absolute paths leak the owner's machine layout. 60 MB of mockups make every clone slower forever.
- **Check.**
  ```bash
  # no absolute user paths anywhere in history (Tacet commits)
  git log -p 2242ebbb..HEAD | grep -c -E 'C:\\\\?Users\\\\?mzwin|~|%USERPROFILE%'   # expect 0
  # no large blobs added by Tacet
  git rev-list --objects 2242ebbb..HEAD | git cat-file --batch-check='%(objecttype) %(objectsize) %(rest)' \
    | awk '$1=="blob" && $2>1048576' | wc -l                                                     # expect 0 (fonts excepted: list them)
  # Tacet-authored tracked content small
  git ls-tree -r -l HEAD margin extensions/margin* extensions/theme-margin | awk '{s+=$4} END {print s/1048576 " MB"}'   # expect <= 10 MB
  ```
  The `.gitignore` block at lines 59-64 stays, and gains `margin/evidence/`, `*.tsbuildinfo`.
- **Now.** Fail on every row. `.gitignore:59-64` already ignores some design media, but three `.mp4` files and all mockups were committed before that and are in history.
- **When.** P.

### OS-H5 — Secret and path scanning on every push

- **Requirement.** CI runs a secret scanner (gitleaks, free) over the full history on every push and PR. GitHub secret scanning and push protection are on (free for public repos).
- **Why.** Tacet's own feature AF4 flags secrets in agent files. The repo must hold itself to the same rule.
- **Check.** `gitleaks detect --source . --log-opts="2242ebbb..HEAD"` exits 0. Repo Settings → Code security shows secret scanning and push protection enabled.
- **Now.** Manual grep found no token shapes. No scanner in CI. Partial.
- **When.** P (one local run before push), M11 (CI).

### OS-H6 — Remove upstream AI and Microsoft contributor tooling

- **Requirement.** Delete or replace upstream files that describe VS Code's team, AI assistants or Microsoft processes:
  `.github/copilot-instructions.md`, `.github/instructions/` (29 files), `.github/agents/`, `.github/skills/`, `.github/learnings/`, `.github/prompts/` if present, `.github/commands/`, `.github/commands.json`, `.github/classifier.json`, `.github/similarity.yml`, `.github/endgame/`, `.github/insiders.yml`, `.github/CODENOTIFY`, `.github/CODEOWNERS` (Microsoft staff, lines 2-15), `.agents/`, `.claude/CLAUDE.md` (a copy of the VS Code Copilot guide), `.devcontainer/` (installs VS Code), `.vscode/` launch configs that name removed features.
  Keep one short `AGENTS.md` written for Tacet (build commands, layering, header rule), because Tacet is "the plain editor for the files your agents read" and contributors will use agents. That is an **owner decision**; the default is one Tacet-written `AGENTS.md` and nothing else.
- **Why.** An AI-free product whose repo is full of Copilot instructions reads as careless. Stale instructions also mislead contributors (they describe chat, sessions and telemetry code that no longer exists).
- **Check.** `git ls-files .github | grep -v -E '^\.github/(workflows|ISSUE_TEMPLATE|actions|PULL_REQUEST_TEMPLATE|pull_request_template\.md|dependabot\.yml|codeql|FUNDING\.yml|labels\.yml)'` prints nothing. `grep -ril copilot .github AGENTS.md` prints nothing.
- **Now.** All present. Fail.
- **When.** P.

---

## 3. Community files

### OS-C1 — README in the Paperclip shape, honest at every line

- **Requirement.** Replace `README.md` with the structure in SHIP-PLAN lines 25-36, plus the items below. Keep `README.upstream.md`? No: delete it; link upstream instead.
  1. Centered banner (`<picture>` light/dark), link row (Download · Build from source · Roadmap), badges (OS-Q1 only).
  2. One bold line: *Tacet is Notepad with a VS Code feel.* One contrast line.
  3. **A real screen capture** (GIF ≤ 8 MB or MP4 in a release asset / GitHub user-attachments), from the shipped build over CDP. Not AI video.
  4. Three-step table: Open a file → Write → It is saved.
  5. "Tacet is right for you if" checklist.
  6. Pillars image: Quiet page, Real files, Instant, Private.
  7. Features grid (only shipped features).
  8. **What Tacet is not** table, and **What we removed and why**: AI and chat, git/SCM, debug, tasks, testing, notebooks, remote, marketplace, settings sync, telemetry. One line each, linking `docs/06-NO-AI.md`. Say "removed from the source", and link the CI audit that proves it.
  9. Install: installer + SHA-256 check command, winget later.
  10. Build from source: the exact OS-B1 recipe, or a link to `docs/BUILDING.md` with the time and disk budget in the README.
  11. Roadmap (link `ROADMAP.md`), FAQ, **Telemetry: none**, Contributing, Security, License.
  12. FAQ must answer: *Why fork VS Code instead of building on Zed, Tauri, CodeMirror or Electron from scratch?* (Monaco's text engine, IME and accessibility, hot exit and file service, the terminal, years of Windows edge cases; cost: size and startup, measured in R12). *Why is it so big?* (Electron; numbers from M9). *Will you add AI?* (No; plain statement.) *Mac or Linux?* (Not in 1.0; no claim without evidence.) *Is it affiliated with Microsoft?* (No; trademark line.) *How do you keep up with VS Code security fixes?* (OS-U3.)
- **Why.** The README is the product page for visitors from mazenzwin.com. Every overclaim will be found.
- **Check.** Every link resolves (`npx lychee README.md docs/*.md` exits 0). Every feature in the grid maps to a passed acceptance case ID in `08-ACCEPTANCE.md`. The demo file's metadata or release notes state the build it was captured from.
- **Now.** Current README is the internal handoff index (`README.md:7` "not a built or release-qualified desktop app"; `:11` links `OPUS-HANDOFF.md`). Fail.
- **When.** M11. A short honest README ("pre-release, builds from source, no installer yet") is enough for an earlier push.

### OS-C2 — CONTRIBUTING.md

- **Requirement.** Tacet's own guide: scope (what will be rejected: AI features, marketplace, sync, telemetry; the "What Tacet is not" list), the build recipe (link), where Tacet code lives (OS-U2), header rule (OS-L2), commit style (one task per commit, message `area: change`), DCO (OS-L9), how to run `margin/tools/smoke.mjs`, and how upstream changes are handled (never fix upstream code in place if a contrib-level change works).
- **Check.** File exists, under 250 lines, contains "Signed-off-by", "smoke.mjs", "src/vs/workbench/contrib/margin". No "VS Code team", "Stack Overflow" or "CLA".
- **Now.** Upstream "Contributing to VS Code" (`CONTRIBUTING.md:1`). Fail.
- **When.** P.

### OS-C3 — CODE_OF_CONDUCT.md

- **Requirement.** Contributor Covenant 2.1 verbatim, with a real contact address the owner reads.
- **Check.** File exists; contact is not a placeholder.
- **Now.** Missing.
- **When.** P. Owner provides the contact address.

### OS-C4 — SECURITY.md

- **Requirement.** Tacet's policy: supported versions (latest release only), private reporting via GitHub Security Advisories ("Report a vulnerability" enabled), response target (acknowledge in 7 days), scope (Markdown rendering, link handling R4/R5, webviews, agent-file safety AF4, installer), and a note that Chromium/Electron issues are fixed by upstream sync (OS-U3).
- **Why.** Tacet renders untrusted Markdown and HTML and has a terminal. The Notepad CVE-2026-20841 lesson (SHIP-PLAN R4) shows editors are real targets.
- **Check.** File exists; no "Microsoft" or "aka.ms"; private vulnerability reporting is on in repo settings.
- **Now.** Microsoft block (`SECURITY.md:1-14`). Fail.
- **When.** P.

### OS-C5 — SUPPORT.md, issue forms, PR template, labels

- **Requirement.**
  - `SUPPORT.md`: questions go to GitHub Discussions (Q&A), bugs to issues.
  - `.github/ISSUE_TEMPLATE/`: YAML issue forms `bug.yml` (Tacet version from About, Windows build, steps, expected/actual, "does it happen with a new profile"), `feature.yml` (with a required "Is this in 'What Tacet is not'?" checkbox), `config.yml` with `blank_issues_enabled: false` and links to Discussions and SECURITY.
  - Delete `copilot_bug_report.md`, `bug_report.md`, `feature_request.md` and the Stack Overflow link in `config.yml:3-8`.
  - `.github/pull_request_template.md`: what changed, which acceptance case, screenshots for UI, smoke result, DCO.
  - Labels (as `.github/labels.yml`, synced by a workflow or set once): `bug`, `feature`, `design`, `docs`, `good first issue`, `help wanted`, `upstream` (belongs to Code OSS), `wontfix: out of scope`, `security`, `P0`/`P1`/`P2`, `area: shell`, `area: markdown`, `area: first-boot`, `area: build`, `area: installer`.
- **Check.** `ls .github/ISSUE_TEMPLATE` = `bug.yml config.yml feature.yml`. Opening "New issue" on GitHub shows exactly those choices.
- **Now.** Upstream templates. Fail.
- **When.** M11 (P for deleting the Copilot template).

### OS-C6 — CHANGELOG convention

- **Requirement.** `CHANGELOG.md` in Keep a Changelog 1.1 format, SemVer headings (`## [1.0.0] - 2026-MM-DD`), sections Added / Changed / Removed / Fixed / Security, and a line per release naming the Code OSS base (`Based on Code OSS 1.139.0 (2242ebbb)`). GitHub release notes are copied from it.
- **Check.** `grep -E '^## \[[0-9]+\.[0-9]+\.[0-9]+\] - [0-9]{4}-' CHANGELOG.md` matches each tag in `git tag -l 'v*'`.
- **Now.** Missing.
- **When.** M10.

### OS-C7 — Governance and upstream statement

- **Requirement.** `GOVERNANCE.md` (half a page): Tacet is maintained by its owner (single maintainer, final say); decisions follow the product rules in `docs/10-REBUILD.md` and SHIP-PLAN; how someone becomes a maintainer; the upstream policy (OS-U1…U4) in plain words: "Tacet tracks Code OSS releases. We do not send Tacet-specific changes upstream. Fixes that apply to Code OSS go to microsoft/vscode first."
- **Check.** File exists and is linked from README and CONTRIBUTING.
- **Now.** Missing.
- **When.** M11.

### OS-C8 — Design and docs in the repo

- **Requirement.** `DESIGN.md` at the root (from `margin/design/DESIGN-GUIDE.md`, per SHIP-PLAN line 38), `ROADMAP.md`, and `docs/` with the public specs (`01-PRODUCT`, `02-DOCUMENT-CONTRACT`, `06-NO-AI`, `08-ACCEPTANCE`, `BUILDING`). Internal planning (agent lanes, tool budgets, "Claude coordinator" tables in SHIP-PLAN lines 95-105) is removed or rewritten for humans.
- **Why.** Visitors should see the product thinking, not the agent orchestration.
- **Check.** `grep -ril -E 'Opus|Codex|coordinator|subagent|Higgsfield' README.md DESIGN.md ROADMAP.md docs/` prints nothing, or only a deliberate "How this was built" note the owner approves.
- **Now.** All docs live in `margin/` and mix product specs with agent operations. Fail.
- **When.** M11. **Owner decision** whether to disclose AI-assisted development in a short "How Tacet was built" section (recommended: yes, one honest paragraph; it pre-empts the obvious question for an AI-free product).

---

## 4. Build from source

### OS-B1 — One exact recipe for a clean clone on Windows x64

- **Requirement.** `docs/BUILDING.md` (and the README summary) gives this recipe, and it works on a clean Windows 11 x64 machine:

  | Step | Command / action | Notes |
  | --- | --- | --- |
  | 1 | Install Git for Windows, Python 3.12, **Node 24.18.0** exactly (`.nvmrc`). | `node -v` = `v24.18.0` |
  | 2 | Visual Studio 2022 (Community or Build Tools) with workload "Desktop development with C++" **and** component `Microsoft.VisualStudio.Component.VC.Runtimes.x86.x64.Spectre`. | Without Spectre libs, `kerberos` fails with `MSB8040` (`margin/STATE.md`, G0 receipt). The modify command must run elevated (unelevated exits 5007). Give the exact `vs_installer.exe modify --add …` command. |
  | 3 | `git clone https://github.com/Zwin-ux/margin && cd margin` | Clone size stated (depends on OS-H1). |
  | 4 | `set VSCODE_INSTALL_CONCURRENCY=3` then `npm ci` | Tacet patch in `build/npm/postinstall.ts:289-290` bounds parallel installs for 16 GB machines. |
  | 5 | Build the first-boot webview: `npm --prefix extensions/margin-welcome/webview ci && npm --prefix extensions/margin-welcome/webview run build` | Until OS-B4 folds it into the main build. |
  | 6 | `npm run compile-client` | 2.5 min on the reference laptop (`evidence/w0-compile.log`). |
  | 7 | `node build/lib/preLaunch.ts` | Downloads Electron 43.6.0 and prepares built-ins. |
  | 8 | `scripts\code.bat` | Launches Tacet (dev build) with a dev profile. |
  | 9 | Optional: `node margin/tools/smoke.mjs local` | Proves the build works. |

  **Budget** (to be measured and printed in the doc): time ≤ 30 min on a 16 GB / 8-core laptop with a warm npm cache excluded (reference: `npm ci` 8 min, compile 2.5 min, pre-launch about 2 min); free disk ≥ 25 GB (source + `node_modules` + `out/` + Electron + VS toolchain not counted); RAM 16 GB.
- **Why.** "Easy to build" is the explicit bar. The MSB8040 trap cost a full session once; it must be the first thing the doc warns about.
- **Check.** OS-B2 CI job, plus one human run on a clean VM or a fresh Windows user, recorded in `docs/BUILDING.md` with date, times and disk used.
- **Now.** The recipe exists only as an internal receipt in `margin/STATE.md` (G0). Steps 5 and the budget are not documented anywhere public. Fail.
- **When.** M11.

### OS-B2 — CI proves the README recipe

- **Requirement.** A workflow `build-from-readme.yml` on `windows-2025` (GitHub-hosted) runs the OS-B1 commands **as written in `docs/BUILDING.md`** on a fresh checkout, then launches the dev build and runs the smoke. It runs on every push to `main` and weekly (to catch dependency rot).
- **Why.** Build docs rot silently. This is the only honest way to say "builds from source".
- **Check.** The job is green on `main`; its steps are extracted from, or checked against, the fenced commands in `docs/BUILDING.md` (a small script fails the job if they differ).
- **Now.** No workflow. Fail.
- **When.** M11.

### OS-B3 — Pinned, offline-safe inputs

- **Requirement.** Every build input is pinned: `.nvmrc` (24.18.0), `.npmrc` Electron target (43.6.0), lockfiles for the root, `remote/`, `build/`, every shipped extension, and `extensions/margin-welcome/webview/package-lock.json`. No `^` ranges resolve at build time (`npm ci` everywhere, never `npm install`). `package.json:4` `"distro"` (a Microsoft private mixin commit) is removed.
- **Check.** `git ls-files '**/package-lock.json' | wc -l` ≥ the number of `package.json` files with dependencies; CI uses only `npm ci`; `grep -n '"distro"' package.json` prints nothing.
- **Now.** Webview has a lockfile. `distro` present at `package.json:4`. Partial.
- **When.** M10.

### OS-B4 — No committed build output

- **Requirement.** `extensions/margin-welcome/media/welcome.js` and `welcome.css` are produced by the build (a gulp step or the extension's `esbuild.mts` calling the webview's Vite build), not committed.
- **Why.** A 358 KB minified bundle in git cannot be reviewed, can drift from its source, and is where supply-chain problems hide.
- **Check.** `git ls-files extensions/margin-welcome/media` prints nothing; a clean clone that follows OS-B1 still shows the first boot.
- **Now.** Committed (358,694 bytes). Fail.
- **When.** M10 (P if cheap).

---

## 5. Continuous integration

Public repos get free minutes on GitHub-hosted standard runners (Linux, Windows). Tacet must not depend on self-hosted or paid runners.

### OS-CI1 — Delete or replace every upstream workflow

| Upstream file | Verdict | Reason |
| --- | --- | --- |
| `pr.yml` | **Replace** with `ci.yml` | Uses Microsoft 1ES self-hosted pools (line 23 and all jobs); jobs at lines 236-460 build the deleted `extensions/copilot`. Jobs would queue forever. |
| `pr-win32-test.yml`, `pr-linux-test.yml`, `pr-darwin-test.yml`, `pr-linux-cli-test.yml`, `pr-node-modules.yml` | Delete (reuse steps in `ci.yml`) | 1ES pools; macOS and remote and CLI are out of scope. |
| `chat-lib-package.yml`, `chat-perf.yml`, `copilot-setup-steps.yml`, `sessions-e2e.yml`, `telemetry.yml` | Delete | AI, agent sessions and telemetry are removed. |
| `monaco-editor.yml`, `component-fixtures.yml`, `css-order-scan.yml` | Delete for 1.0 | Upstream team tooling; add back only if Tacet uses them. |
| `codeql.yml` (+ `.github/codeql/`) | **Keep**, retarget to `ubuntu-latest` | Free for public repos; a real security signal. |
| `check-clean-git-state.sh`, `node_modules_cache/`, `.github/actions/` | Keep what `ci.yml` uses | |
| `.github/dependabot.yml` | Keep, limit to `github-actions` and the webview's npm deps | Root npm updates come with upstream sync, not Dependabot. |
| `build/azure-pipelines/**/*.yml` (Azure DevOps, ESRP, CredScan, TSA, CDN) | Delete YAML; keep only `.ts` modules that the build imports (for example `common/computeBuiltInDepsCacheKey.ts`), found with `npm run compile` after deletion | Microsoft infrastructure; never runs for Tacet. |

- **Check.** `ls .github/workflows` = `ci.yml build-from-readme.yml release.yml codeql.yml` (plus optional `labels.yml`). `git grep -n -E '1ES\.Pool|self-hosted|ESRP|CredScan' -- .github build` prints nothing.
- **Now.** 15 upstream workflows, 115 Azure Pipelines files. Fail.
- **When.** P (a public repo with broken or hanging CI is worse than none).

### OS-CI2 — `ci.yml`: the gates on every push and PR

| Job | Runner | What | Pass |
| --- | --- | --- | --- |
| `compile` | `ubuntu-latest` | `npm ci`, `npm run compile-client`, `npm run hygiene`, `npm run eslint`, `npm run valid-layers-check`, `npm run gulp compile-extensions` | Exit 0. Cache `node_modules` by lockfile hash. |
| `unit` | `ubuntu-latest` (xvfb) | `scripts/test.sh` for `src/vs/base`, `src/vs/editor`, `src/vs/workbench/contrib/margin` and any suite touching kept features; `npm run test-node` | Exit 0; failures are never skipped silently (a skip list lives in the repo with reasons). |
| `smoke` | `windows-2025` | OS-B1 steps, then `node margin/tools/smoke.mjs ci` (CDP + Playwright, no OS input). The script must take an output folder (today it writes to `margin/evidence`, `smoke.mjs:29`) and upload screenshots and JSON as artifacts. | All `REQUIRED_CHECKS` (`smoke.mjs:40`) pass. |
| `no-ai` | `ubuntu-latest` | Static audit: a denylist (`copilot`, `languageModel`, `chatAgent`, `mcp` discovery, `inlineCompletion` providers from AI, `@github/copilot`, `openai`, `anthropic`, telemetry endpoints) over `src/`, `extensions/`, `product.json` and the compiled `out/`, with a reviewed allowlist (for example Tacet's AF agent-file features that *mention* agents). Covers N-01/N-02 statically. | 0 unreviewed hits. |
| `no-network` | `windows-2025` | Launch the dev build (and in `release.yml`, the installed build) with a local recording proxy (`--proxy-server=127.0.0.1:<port>`, plus a DNS log), run the smoke workflow and 60 s idle, then list every outbound request. Covers N-04. | Zero requests, or only an allowlist the owner approved (none planned). |
| `secrets` | `ubuntu-latest` | gitleaks over the pushed range | Exit 0. |
| `package` | `windows-2025`, on `main` and tags | `npm run gulp vscode-win32-x64-min-ci`, then `vscode-win32-x64-inno-updater` is **not** run (no updater), then `vscode-win32-x64-user-setup`; SHA256SUMS; SBOM; upload artifacts | Installer builds; artifact size recorded. |

- **Why.** Each job backs one README claim: builds, tested, works, no AI, no network, no leaked secrets, installable.
- **Check.** Branch protection on `main` requires `compile`, `unit`, `smoke`, `no-ai`, `no-network`, `secrets`. A PR that adds `fetch('https://example.com')` to a webview fails `no-network`; a PR that adds `vscode.lm` usage fails `no-ai` (keep both as test fixtures).
- **Now.** None exist. `smoke.mjs` exists and exits non-zero on failure (fixed in `196ab613`). Fail.
- **When.** `compile` + `secrets` = P. The rest = M11. `no-network` on the packaged artifact = M10 (G7).

### OS-CI3 — CI time and cost budget

- **Requirement.** A PR run finishes in ≤ 45 min wall time on free runners, with caching of `node_modules` and Electron. `ci.yml` sets `concurrency` to cancel superseded runs and `permissions: contents: read`. Third-party actions are pinned by commit SHA (upstream already does this, e.g. `pr.yml:26`).
- **Check.** Median of the last 10 PR runs ≤ 45 min (Actions insights).
- **When.** M11.

---

## 6. Releases

### OS-R1 — Versioning (owner decision)

- **Requirement.**
  - Tacet's own version is SemVer: `1.0.0`, `1.0.1`, `1.1.0`. Tags are `v1.0.0`.
  - The upstream base is recorded, never hidden: About shows "Tacet 1.0.0 · Code OSS 1.139.0 · Electron 43.6.0"; the CHANGELOG and release notes repeat it.
  - Keep `package.json` `version` = the upstream version (`1.139.0`). Built-in extensions declare `engines.vscode` ranges that are checked against it; changing it to `1.0.0` breaks them. Put Tacet's version in `product.json` (for example `"marginVersion": "1.0.0"`) and use it for the installer, file properties, About and the window.
- **Why.** Users need a simple version; contributors and security reviewers need the upstream base.
- **Check.** About dialog and `Tacet.exe` file properties show `1.0.0`; `node -p "require('./package.json').version"` = upstream tag; `git describe --tags` = `v1.0.0` on the release commit.
- **Now.** `package.json:3` = `1.139.0`; no Tacet version anywhere. Open.
- **When.** M10. **Owner decision** (recommend this scheme).

### OS-R2 — Signed installer (owner decision) and honest warnings

- **Requirement.** The Windows x64 user installer is Authenticode-signed with a timestamp. Options for the owner: Azure Trusted Signing (low monthly cost, individual validation), **SignPath Foundation** (free code signing for qualifying OSS projects), or an OV certificate. If 1.0 ships unsigned, the README and release notes say so and show the SmartScreen screen and how to verify the SHA-256 instead.
- **Why.** Unsigned Electron installers trigger SmartScreen "Windows protected your PC". Hiding that erodes trust; explaining it keeps it.
- **Check.** PowerShell `Get-AuthenticodeSignature .\MarginSetup-1.0.0-x64.exe` → `Status: Valid`, signer = the owner's identity. Or: README has the "Unsigned build" section.
- **Now.** No signing. SHIP-PLAN line 117 lists it as owner-only. Open.
- **When.** M10. **Owner decision.**

### OS-R3 — Release assets and checksums

- **Requirement.** Each GitHub release has: `MarginSetup-<ver>-x64.exe`, `Tacet-<ver>-win32-x64.zip` (portable, optional), `SHA256SUMS` (`sha256sum` format), `sbom.cdx.json`, and release notes from the CHANGELOG. Assets are built by `release.yml` from the tagged commit, never uploaded from a laptop. GitHub artifact attestations (`actions/attest-build-provenance`, free for public repos) are attached.
- **Check.** PowerShell: `(Get-FileHash .\MarginSetup-1.0.0-x64.exe -Algorithm SHA256).Hash` equals the line in `SHA256SUMS`. `gh attestation verify MarginSetup-1.0.0-x64.exe --repo Zwin-ux/margin` passes.
- **Now.** Nothing. Open.
- **When.** M10 / M11.

### OS-R4 — Rebuildable, not "reproducible" (claim precisely)

- **Requirement.** A release is rebuildable: same tag + lockfiles + Node/Electron pins + documented toolchain → a functionally identical build (same file list, same versions, same notices). Do **not** claim byte-for-byte reproducibility unless it is tested (Electron, native modules and signing timestamps make that hard). Record the build environment in the release notes (runner image, Node, VS toolchain version, commit).
- **Check.** Re-run `release.yml` on the same tag in a dry-run mode; compare the sorted file list and `resources\app\package.json` versions of both outputs; they match.
- **When.** M10.

### OS-R5 — Update policy: none in 1.0 (confirm)

- **Requirement.** 1.0 has no auto-updater and makes no update check. The About dialog links to the releases page. `product.json` has no `updateUrl` and no `quality`. The README states: "Tacet does not check for updates. Watch the repo's releases."
- **Why.** An update check is a network call, and the no-network claim must stay true. SHIP-PLAN lists the updater as an owner decision (line 120).
- **Check.** `grep -c -E '"updateUrl"|"quality"' product.json` = 0; the `no-network` job shows no update request.
- **Now.** No `updateUrl` or `quality` in `product.json`. Pass (pending the owner's confirmation).
- **When.** M10. **Owner decision** to confirm.

---

## 7. Upstream sync

### OS-U1 — Documented sync strategy

- **Requirement.** `docs/UPSTREAM.md` states:
  1. **Base.** The current Code OSS tag and commit (today `1.139.0` / `2242ebbb`).
  2. **Method after going public: merge, not rebase.** `main` is never rewritten. For a new upstream tag, create `sync/1.140.0`, `git merge 1.140.0`, resolve, re-run the removal step (OS-U4), make CI green, open a PR. Rebasing is fine only before the first push.
  3. **Who and when.** See OS-U3.
- **Why.** Rebasing a public `main` breaks every clone and fork. Merging keeps a clear record of which upstream release each Tacet release is based on.
- **Check.** `docs/UPSTREAM.md` exists; `git log --merges --first-parent main --grep 'Merge tag'` lists each sync.
- **When.** M11.

### OS-U2 — Tacet code lives in Tacet folders

- **Requirement.** New Tacet code goes in `src/vs/workbench/contrib/margin/**`, `extensions/margin*/**`, `extensions/theme-margin/**`, `margin/tools/**`, and `build/margin/**` (new, for Tacet build steps). Edits to upstream files are allowed only when a contribution point cannot do the job, and each such edit carries a `// Tacet:` comment (as `build/npm/postinstall.ts:289` already does).
- **Why.** Every line changed in an upstream file is a future merge conflict. Keeping changes in owned folders keeps syncs cheap.
- **Check.** A script `margin/tools/patchset.mjs` lists upstream files that differ from the base tag (`git diff --name-status <base> HEAD -- . ':!src/vs/workbench/contrib/margin' ':!extensions/margin*' ':!extensions/theme-margin' ':!margin' ':!docs'`), split into Deleted / Modified. It fails CI if a Modified upstream file has no `Tacet:` marker in its diff.
- **Now.** Mostly followed: `src/vs/workbench/contrib/margin/` and `extensions/margin`, `extensions/margin-welcome`, `extensions/theme-margin` exist. But the R1/R1b teardown and R2 shell work edit many upstream files (for example `src/vs/workbench/browser/layout.ts` and `src/vs/base/browser/ui/centered/centeredViewLayout.ts` are modified in the working tree during the audit). No inventory exists. Partial.
- **When.** M11 (script), ongoing.

### OS-U3 — Security-driven sync cadence (owner decision)

- **Requirement.** Tacet merges each upstream **minor** release that updates Electron/Chromium within 30 days of its tag, and any upstream security fix that affects kept code within 14 days. Releases that only touch removed features can be skipped, with a line in `docs/UPSTREAM.md` saying so.
- **Why.** Tacet ships a Chromium. A fork that stops syncing becomes a security liability, and reviewers know it. This is the question a senior engineer asks first.
- **Check.** `docs/UPSTREAM.md` has a table: upstream tag, date, Electron version, merged (yes/skipped/why), Tacet release.
- **When.** v1.x. **Owner decision** on the cadence (recommended above).

### OS-U4 — Documented, repeatable patch set

- **Requirement.** `docs/UPSTREAM-PATCHES.md` is generated by `margin/tools/patchset.mjs` and committed on every sync. It lists:
  - **Deleted upstream paths**, grouped by feature (AI/chat, git/SCM, debug, tasks, testing, notebooks, remote, marketplace, sync, telemetry, walkthroughs, timeline, comments), with the reason.
  - **Modified upstream files**, with one line each on why.
  - **Added Tacet paths.**
  - A removal script or checklist (`margin/tools/strip.mjs`) that re-applies the deletions, so new AI files that upstream adds in 1.140+ (for example new `chat*` contributions or a new `extensions/copilot*`) are detected and removed at sync time. The `no-ai` CI job (OS-CI2) is the safety net.
- **Why.** Upstream adds AI surface every month. Without a repeatable removal, each sync quietly re-adds it.
- **Check.** `node margin/tools/patchset.mjs --check` exits 0 (committed file matches the tree). After a sync, `no-ai` is green.
- **Now.** No inventory. The teardown is recorded only in commit messages (`1f27c0b7`, `a59e384d`, `811e72cf`, `1d18a30e`, `18a1399f`, `f00699ee`) and in `margin/evidence/w1-ai-inventory.md` if present. Fail.
- **When.** M11.

---

## 8. Quality signals visitors see

### OS-Q1 — Only honest badges

- **Requirement.** Badges allowed at launch: **CI** (the `ci.yml` status on `main`), **Latest release**, **License** (text "MIT" plus "see LICENSE for exceptions" if OS-L5 option A), **Platform: Windows x64**, **Telemetry: none** — only while the `no-network` job is required and green. Not allowed: coverage (not measured), downloads (until real), "stars", "PRs welcome" without triaged issues, any "AI-free certified" style badge.
- **Why.** A fake or stale badge is the fastest way to lose a senior reader.
- **Check.** Every badge URL points at a GitHub workflow or release endpoint of `Zwin-ux/margin` (shields.io is fine as a renderer). No badge is static text except License and Platform.
- **When.** M11.

### OS-Q2 — Docs: README first, docs folder second, no site at 1.0

- **Requirement.** The README is the landing page. Deep material lives in `docs/` rendered by GitHub. A docs site (GitHub Pages) is not built for 1.0. The owner's landing page (SHIP-PLAN M10, mazenzwin.com) links to the repo and release; it does not duplicate the docs.
- **Why.** One source of truth. A docs site with three pages looks empty.
- **When.** M11. Revisit in v1.x.

### OS-Q3 — Demo video and images from the real app

- **Requirement.** One 20–40 s screen capture of the shipped build: open a `.md` from Explorer → write → it is saved → Ctrl+P → Read. Captured over CDP (`margin/tools/`) or a screen recorder, with a disposable profile and fixture notes. Plus 3 screenshots (light, dark, compact 480 px) and the 1280×640 social preview. Each asset's caption or alt text names the build version. No AI-generated imagery presented as the product.
- **Check.** Assets are ≤ 10 MB each; alt text present; build version stated; the demo matches features that pass their acceptance cases.
- **Now.** Only concept art and dev-build evidence screenshots exist (`margin/concepts/`, `margin/evidence/*.png`). Fail.
- **When.** M11.

### OS-Q4 — A "good first issue" backlog at launch

- **Requirement.** At least 10 open issues labeled `good first issue`, each with context, the file(s) to touch, and an acceptance check. Candidates:
  1. Brand allowlist review: rewrite remaining "VS Code" strings in kept features (OS-L3).
  2. Add a Tacet-authored header check test (OS-L2).
  3. `smoke.mjs`: take an `--out` folder instead of `margin/evidence`.
  4. Link checker in CI for `docs/`.
  5. Add missing `aria-label`s found by an axe run on the first-boot webview.
  6. Keyboard shortcut cheat sheet in `docs/`.
  7. Add a corpus fixture from `08-ACCEPTANCE.md` (one per issue: CRLF, BOM, UTF-16, RTL…).
  8. Reduced-motion variant for one kit port.
  9. Localize one hard-coded English string in `extensions/margin-welcome`.
  10. `docs/BUILDING.md`: troubleshooting entry for a common failure seen in CI.
  Plus 5 `help wanted` issues of medium size.
- **Check.** `gh issue list -R Zwin-ux/margin -l "good first issue" --state open --json number | jq length` ≥ 10 on launch day.
- **When.** M11.

### OS-Q5 — Repo settings

- **Requirement.** Description (one line, the pitch), website (landing page), topics (`text-editor`, `markdown`, `notepad`, `windows`, `electron`, `code-oss`, `notes`, `offline`), social preview image, Discussions on (Q&A, Ideas), Wiki off, private vulnerability reporting on, branch protection on `main` (required checks from OS-CI2, linear history off because of merges, no force push), release immutability on if available.
- **Check.** `gh repo view Zwin-ux/margin --json description,homepageUrl,repositoryTopics,hasDiscussionsEnabled,hasWikiEnabled` matches.
- **When.** M11 (owner performs; outward action).

---

## Prioritized launch checklist

### A. Blockers before the first public push (any push, even pre-1.0)

Order matters. Items 1–4 are one history-rewrite session; do them together.

| # | Item | Req | Owner decision? |
| --- | --- | --- | --- |
| 1 | Decide history shape (full upstream history recommended) and unshallow | OS-H1 | **Yes** |
| 2 | Decide public commit email; rewrite the 36 commits | OS-H3 | **Yes** |
| 3 | `git filter-repo`: drop `install.log`, `margin/evidence/`, experiments, handoff files, AI concept art and video, committed bundle; verify 0 absolute paths and 0 blobs > 1 MB in Tacet history | OS-H4, OS-B4 | No |
| 4 | Rename `origin` → `upstream` (push disabled), add `origin` = Zwin-ux/margin | OS-H2 | No |
| 5 | Name decision: "Tacet" vs gomargin.app and MarginNote | OS-L8 | **Yes** |
| 6 | `LICENSE.txt`: add "Tacet contributors" line; add Animate UI Commons Clause exception | OS-L1, OS-L5 | Yes (A vs B) |
| 7 | Fix headers: widen lint + hygiene rule, re-header Tacet-authored files | OS-L2 | No |
| 8 | Delete upstream workflows, Azure Pipelines YAML, CODEOWNERS, Copilot/agent tooling; add minimal `ci.yml` (compile + secrets) that is green | OS-CI1, OS-H6, OS-CI2 | Yes (keep one AGENTS.md?) |
| 9 | Replace CONTRIBUTING, SECURITY; add CODE_OF_CONDUCT (with a real contact); delete the Copilot issue template | OS-C2–C5 | Contact address |
| 10 | Honest interim README: what Tacet is, "pre-release, build from source", what's removed, license and trademark line | OS-C1 | No |
| 11 | One local gitleaks run over the rewritten history | OS-H5 | No |

### B. Before v1.0.0 (M10 + M11)

| # | Item | Req | Owner decision? |
| --- | --- | --- | --- |
| 1 | `product.json` identity complete, new AppIds/mutex/data folder/protocol; `electron.ts` company and copyright; `code.iss` publisher; Tacet icons | OS-L3, OS-L4 | No (IDs are final once shipped) |
| 2 | Versioning scheme (Tacet SemVer + upstream base) | OS-R1 | **Yes** |
| 3 | Notices + SBOM generator; fonts and Animate UI listed | OS-L6, OS-L7 | No |
| 4 | Animate UI: keep with exception, or replace with own MIT components | OS-L5 | **Yes** |
| 5 | Full `ci.yml`: unit, smoke, no-AI, no-network, package; branch protection | OS-CI2, OS-CI3 | No |
| 6 | `docs/BUILDING.md` with time/disk budget; `build-from-readme.yml` green | OS-B1–B3 | No |
| 7 | Signed installer or documented unsigned release; SHA256SUMS; attestations; release from CI only | OS-R2–R4 | **Yes** (certificate) |
| 8 | Confirm no updater and no update check | OS-R5 | **Yes** (confirm) |
| 9 | `docs/UPSTREAM.md`, `UPSTREAM-PATCHES.md`, `patchset.mjs`, `strip.mjs`; sync cadence | OS-U1–U4 | **Yes** (cadence) |
| 10 | Paperclip-style README, demo capture, screenshots, social preview, honest badges | OS-C1, OS-Q1, OS-Q3 | No |
| 11 | CHANGELOG, GOVERNANCE, SUPPORT, issue forms, labels, DCO | OS-C5–C7, OS-L9 | No |
| 12 | Public docs moved to `docs/` and `DESIGN.md`; agent-operations text removed or turned into one "How it was built" note | OS-C8 | **Yes** (disclosure note) |
| 13 | 10 good first issues filed; repo settings | OS-Q4, OS-Q5 | Owner performs |

### Owner decisions collected

1. History shape for the public repo (OS-H1). Recommend full upstream history, not a GitHub fork.
2. Public commit email (OS-H3). Recommend GitHub noreply.
3. Product name, given gomargin.app (OS-L8).
4. Animate UI: disclose the Commons Clause exception, or replace before 1.0 (OS-L5).
5. Code-signing route: Trusted Signing, SignPath Foundation, OV cert, or unsigned with a clear note (OS-R2).
6. Versioning scheme (OS-R1), updater = none (OS-R5), upstream sync cadence (OS-U3).
7. Keep one Tacet-written `AGENTS.md`, and whether to add a short "How Tacet was built" note (OS-H6, OS-C8).
8. Code of Conduct and security contact address (OS-C3, OS-C4).

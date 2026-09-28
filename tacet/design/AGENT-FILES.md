# Agent files support

Status: spec, 2026-09-27. Owner direction (2026-09-27): "make it native/friendly towards agent skills and the most common of these." Scope: Tacet 1.0. Companions: [../SHIP-PLAN.md](../SHIP-PLAN.md) (R1–R12, milestones), [DESIGN-GUIDE.md](DESIGN-GUIDE.md) v2 amendments, [UI-KIT.md](UI-KIT.md), [CRITICISM.md](CRITICISM.md), [../docs/06-NO-AI.md](../docs/06-NO-AI.md). Where this file disagrees with those, they win; raise the conflict instead of building around it.

## 0. The idea in one line

**Tacet is the plain editor for the files your agents read.**

Tacet has no AI and calls no model. It does not run agents. But in 2026 many of the Markdown and JSON files people hand-edit are *for* agents: `CLAUDE.md`, `AGENTS.md`, `SKILL.md`, rules, prompts, MCP configs. These files have strict, easy-to-break formats (YAML front matter, name patterns, globs, length limits) and they are a known attack surface (hidden Unicode, scripts). A calm editor that knows these formats, shows mistakes quietly, never rewrites your bytes and never runs anything is a real gap.

README positioning (for the M11 README, "Tacet is right for you if"):

> **The plain editor for the files your agents read.** Skills, `AGENTS.md`, `CLAUDE.md`, rules and MCP configs open as clean pages with their settings laid out, checked against each tool's published format, and shown with nothing hidden. Tacet itself has no AI, runs nothing, and sends nothing.

Public positioning still leads with reading and safety (ruling C11); this is one checklist line plus one features-grid cell ("Files for your agents"), not the headline.

## 1. Rules that bind every feature here

1. **AI-free.** No model calls, no generation, no "improve this description", no token counting against a model tokenizer. Estimates are arithmetic and labeled as estimates.
2. **No new chrome by default.** No status bar, no new title-bar control, no badges, no new icons (guide §10.4 keeps five file glyphs). Everything lives in surfaces that already exist: the page, the title menu, the `Write ▾` menu, the shelf, Ctrl+P, the command palette, notices, Monaco markers in Code view.
3. **Bytes round-trip.** Opening, viewing, switching Write / Read / Code and saving without an edit writes the identical bytes (SHA-256 equal). Editing one property changes only that property's source range. Tacet never re-serializes, re-quotes, re-orders, re-indents or re-wraps YAML it did not touch. Line endings, BOM and trailing newline stay as found (document contract).
4. **Never block save.** Every check is a quiet notice. A file that breaks a spec still saves, without a dialog.
5. **No network.** All schemas and rules are bundled. `json.schemaDownload.enable` stays `false`. A `$schema` URL Tacet does not bundle is not fetched.
6. **No scanning outside what the user opened** ([06-NO-AI](../docs/06-NO-AI.md): no MCP discovery, no automatic scan). Tacet reads a file when the user opens it, and reads names and front matter inside a folder only after the user opens that folder. It never looks in `~/.claude`, `~/.codex`, `%APPDATA%\Claude` or any other agent home on its own.
7. **Nothing executes.** Files in a skill's `scripts/`, shell lines in skills, `command` entries in MCP configs and hook commands are text. See §6.
8. **Words** follow guide §2.10 and ASD-STE100: short, literal, present tense. Tool names are written as their owners write them (Claude Code, Codex, GitHub Copilot, Cursor, Gemini CLI, Windsurf). No sparkles, no "AI" glyph, no marketing.

## 2. Research: which agent files are common (evidence, 2026)

### 2.1 Ranked by prevalence

| # | File | Evidence |
| --- | --- | --- |
| 1 | `CLAUDE.md` (+ `.claude/CLAUDE.md`, `CLAUDE.local.md`, nested) | In 45.4% of 2,926 GitHub repos that use agentic tools (Feb 2026) [S1]; 922 of 2,303 context files (≈40%), the largest group [S2]. |
| 2 | `AGENTS.md` (nested; `AGENTS.override.md` for Codex) | 40.6% of repos [S1]; "used by over 60k open-source projects", 25+ tools, stewarded by the Agentic AI Foundation (Linux Foundation) [S3]; read by Codex, Copilot, Cursor, Claude Code (v2.1.277+), Windsurf/Devin, Cline, Junie, Gemini CLI (by setting) [S4–S10]. |
| 3 | `.github/copilot-instructions.md` | 35.1% of repos [S1]; 687 of 2,303 files [S2]. |
| 4 | Rules folders: `.cursor/rules/*.mdc`, `.github/instructions/*.instructions.md`, `.claude/rules/*.md`, `.windsurf/rules` / `.devin/rules`, `.clinerules/` | "Rules" in under 20% of repos (exact split not published) [S1]; each tool documents its own front matter [S6–S9]. |
| 5 | Claude Code `settings.json` (permissions, hooks) | "Settings" and "Hooks" each under 20% [S1]; published JSON Schema on SchemaStore [S11]. |
| 6 | MCP configs: `.mcp.json`, `.vscode/mcp.json`, `claude_desktop_config.json` | "MCP" under 20% [S1]; shapes in [S12–S14]. |
| 7 | Commands and prompts: `.claude/commands/*.md`, `.github/prompts/*.prompt.md` | "Commands" under 20% [S1]; `.claude/commands` is now the legacy form of skills [S15]. |
| 8 | **`SKILL.md` skill folders** | 5.4% of repos (158 repos, 601 skills) in Feb 2026 [S1], but the most portable format: open spec [S16] listing ~45 clients incl. Claude, Claude Code, Codex, GitHub Copilot, VS Code, Cursor, Gemini CLI, Junie, Kiro, OpenCode, Goose, Roo Code, Amp [S17]. Personal skills (`~/.claude/skills`, `~/.agents/skills`) are invisible to repo studies, so real use is higher. Owner priority. |
| 9 | Subagents: `.claude/agents/*.md` (and `.github/agents/*.agent.md`) | 4.5% of repos (131 repos, 452 subagents) [S1]. |
| 10 | `GEMINI.md` | 3.3% of repos [S1]; also read by Copilot's cloud agent [S7]. |

Also recognized (lower prevalence or outside repos): `.cursorrules` (legacy, 1.5% [S1]), `.windsurfrules` (legacy), `CONVENTIONS.md` (aider, loaded by `--read` [S18]), `.junie/AGENTS.md` / `.junie/guidelines.md` [S19], `llms.txt` / `llms-full.txt` (web; "thousands of sites", checked by Lighthouse [S20]), Codex `agents/openai.yaml` inside a skill [S5].

Consequence for Tacet: context files (1–3) are the volume, so they get recognition, structure and length help. Skills (8) are the strictest format and the owner's priority, so they get the deepest support (property block, name/folder checks, folder view, templates). Rules (4) have the most dangerous front matter mistakes (a wrong `globs` or `applyTo` silently turns a rule off).

### 2.2 Format reference (what Tacet checks)

**Agent Skills (`SKILL.md`)**, open spec [S16]:

| Field | Required | Rule |
| --- | --- | --- |
| `name` | yes | 1–64 chars; `a-z`, `0-9`, `-` only; not starting or ending with `-`; no `--`; **must match the parent folder name**. |
| `description` | yes | 1–1024 chars, non-empty; says what it does and when to use it. |
| `license` | no | Short: a license name or a bundled file name. |
| `compatibility` | no | 1–500 chars. |
| `metadata` | no | Map of string keys to string values. |
| `allowed-tools` | no | Space-separated string (experimental). |

Body: no format rules; keep `SKILL.md` under 500 lines, instructions under ~5,000 tokens; file references relative to the skill root, one level deep. Folders: `scripts/`, `references/`, `assets/` (optional, any other files allowed). Validator: `skills-ref validate` [S16].

Tool extensions to the spec:
- Claude Code [S15]: all fields optional in Claude Code; adds `when_to_use`, `argument-hint`, `arguments`, `disable-model-invocation`, `user-invocable`, `allowed-tools` (list or string), `disallowed-tools`, `model`, `effort` (`low|medium|high|xhigh|max`), `context` (`fork`), `agent`, `background`, `paths`, `shell` (`bash|powershell`). `description` + `when_to_use` ≤ 1,536 chars. Uploading to claude.ai or the Skills API allows only the six spec fields and fails with "Unexpected key(s)" otherwise. Reserved names: `synced`, `anthropic-skills*`. Body syntax: `$ARGUMENTS`, `$0`, `${CLAUDE_SKILL_DIR}`, and `` !`command` `` / ```` ```! ```` shell injection.
- VS Code / Copilot [S21]: `argument-hint`, `user-invocable`, `disable-model-invocation`, `context`.
- Cursor [S22]: `paths`, `disable-model-invocation`, `icon`, `color`, `metadata`.
- Codex [S5]: optional `agents/openai.yaml` (display name, icon, `allow_implicit_invocation`, dependencies).

Skill locations: Claude Code `~/.claude/skills`, `.claude/skills`, nested `<dir>/.claude/skills`, plugin `skills/` [S15]; Codex `.agents/skills` (cwd up to repo root), `$HOME/.agents/skills`, `/etc/codex/skills` [S5]; VS Code/Copilot `.github/skills`, `.claude/skills`, `.agents/skills`, `~/.copilot/skills`, `~/.claude/skills`, `~/.agents/skills` [S21]; Cursor `.agents/skills`, `.cursor/skills`, `~/.agents/skills`, `~/.cursor/skills`, plus legacy `.claude/skills`, `.codex/skills` [S22]; Gemini CLI `.gemini/skills`, `.agents/skills`, `~/.gemini/skills`, `~/.agents/skills` [S23]. The shared path is `.agents/skills`.

**Instruction files:**

| File | Format and rules |
| --- | --- |
| `AGENTS.md` | Plain Markdown, no required fields; nearest file wins [S3]. Codex: `~/.codex/AGENTS.md`, `AGENTS.override.md`, combined size stops at `project_doc_max_bytes` = 32 KiB [S4]. |
| `CLAUDE.md` | Plain Markdown. Locations: `./CLAUDE.md`, `./.claude/CLAUDE.md`, `./CLAUDE.local.md`, `~/.claude/CLAUDE.md`, managed `C:\Program Files\ClaudeCode\CLAUDE.md`. **Imports**: `@path` (relative to the importing file, absolute, or `~/`), recursive, max 4 hops, **not parsed inside code spans or fenced blocks**. Target under 200 lines [S24]. |
| `.claude/rules/**/*.md` | Optional front matter `paths:` (globs) [S24]. |
| `GEMINI.md` | Plain Markdown; `@file.md` imports; `~/.gemini/GEMINI.md` and workspace tree [S10]. |
| `.github/copilot-instructions.md` | Plain Markdown [S7]. |
| `.github/instructions/**/*.instructions.md` | Front matter `applyTo` (glob; several separated by commas, e.g. `"**/*.ts,**/*.tsx"`), optional `excludeAgent` (`code-review` or `cloud-agent`), VS Code also `name`, `description` [S7, S25]. |
| `.cursor/rules/**/*.mdc` | Front matter `description`, `globs` (comma-separated string), `alwaysApply` (boolean). Plain `.md` in `.cursor/rules` is ignored. Keep under 500 lines [S6]. |
| `.windsurf/rules/*.md`, `.devin/rules/*.md` | Front matter `trigger`: `always_on` / `model_decision` / `glob` / `manual`; `globs` needed for `glob`; `description` for `model_decision`. 12,000 chars per workspace rule; global `global_rules.md` 6,000 chars [S8]. |
| `.clinerules/*.md` or `.clinerules` file, `.cline/rules/` | Markdown; optional front matter `paths:` (list of globs) [S9]. |
| `.cursorrules`, `.windsurfrules` | Legacy single-file plain text/Markdown [S6, S9]. |
| `CONVENTIONS.md` | Plain Markdown for aider [S18]. |
| `.junie/AGENTS.md`, `.junie/guidelines.md` (legacy) | Plain Markdown [S19]. |

**Commands, prompts, subagents:**

| File | Front matter |
| --- | --- |
| `.claude/commands/**/*.md` | Same fields as Claude Code skills (legacy form) [S15]. |
| `.github/prompts/*.prompt.md` | `description`, `name`, `argument-hint`, `agent` (`ask` / `agent` / `plan` / custom), `model`, `tools`; body variables `${input:name}`, `${input:name:placeholder}`, `${selection}`, `#file:`, `#tool:` [S26]. |
| `.claude/agents/**/*.md` | Required `name`, `description`; optional `tools`, `disallowedTools`, `model`, `permissionMode` (`default`, `acceptEdits`, `auto`, `plan`, `dontAsk`), `skills`, `mcpServers`, `memory` (`user`/`project`/`local`), `maxTurns`, `hooks`, `isolation` (`worktree`), `omitClaudeMd` [S27]. |

**JSON configs:**

| File | Shape |
| --- | --- |
| `.mcp.json`, `claude_desktop_config.json` | `{ "mcpServers": { "<name>": { "type": "stdio" \| "http" \| "sse" \| "ws", "command", "args", "env" } \| { "type", "url", "headers", "timeout" } } }`; `${VAR}` and `${VAR:-default}` expansion [S12, S13]. |
| `.vscode/mcp.json` | `{ "servers": { … "type", "command", "args", "env", "envFile", "url", "headers" }, "inputs": [ … ] }`; `${input:id}` [S14]. |
| `.claude/settings.json`, `.claude/settings.local.json`, `~/.claude/settings.json` | SchemaStore `claude-code-settings.json` (permissions, hooks with 25+ event types, env, sandbox) [S11]. |

**`llms.txt`:** Markdown in a `.txt` file: one required H1, optional blockquote summary, H2 sections of `- [name](url): notes` lists, an `Optional` section by convention [S20].

## 3. Recognition

### 3.1 How a file is classified

A pure path match, run on open and on rename. No content sniffing beyond parsing the open file's own front matter. Matching is case-insensitive (Windows), but a case mismatch where a tool is case-sensitive raises rule `AF-CASE` (§4.4).

| Kind id | Match (path, `/` separators) | Language mode | Opens in |
| --- | --- | --- | --- |
| `skill` | `**/SKILL.md` | markdown | Write |
| `skill-resource` | any file under a folder that has `SKILL.md`, in `references/`, `assets/`, `scripts/` | by extension | Write for `.md`; Code for others |
| `instructions` | `AGENTS.md`, `AGENTS.override.md`, `CLAUDE.md`, `CLAUDE.local.md`, `.claude/CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`, `CONVENTIONS.md`, `.junie/AGENTS.md`, `.junie/guidelines.md`, `global_rules.md` under a `memories` folder | markdown | Write |
| `rule-claude` | `**/.claude/rules/**/*.md` | markdown | Write |
| `rule-copilot` | `**/*.instructions.md` | markdown | Write |
| `rule-cursor` | `**/.cursor/rules/**/*.mdc` (and any `*.mdc`) | markdown (`files.associations` `*.mdc` → markdown) | Write |
| `rule-windsurf` | `**/.windsurf/rules/*.md`, `**/.devin/rules/*.md` | markdown | Write |
| `rule-cline` | `**/.clinerules/**/*.md`, `**/.cline/rules/**/*.md`, a file named `.clinerules` | markdown | Write |
| `rule-legacy` | `.cursorrules`, `.windsurfrules` | markdown | Write |
| `command-claude` | `**/.claude/commands/**/*.md` | markdown | Write |
| `prompt-copilot` | `**/*.prompt.md` | markdown | Write |
| `agent-claude` | `**/.claude/agents/**/*.md` | markdown | Write |
| `agent-copilot` | `**/*.agent.md` | markdown | Write |
| `mcp-claude` | `.mcp.json`, `claude_desktop_config.json` | json | Code |
| `mcp-vscode` | `**/.vscode/mcp.json` | jsonc | Code |
| `settings-claude` | `**/.claude/settings.json`, `**/.claude/settings.local.json` | json | Code |
| `skill-openai` | `<skill>/agents/openai.yaml` | yaml | Code |
| `llms-txt` | `llms.txt`, `llms-full.txt` | markdown (**exception to A11**: this `.txt` is Markdown by spec) | Write |

Kinds are an internal classifier (`margin.agentFileKind`), exposed only as a `when` context key and to the features below. The user never sees a kind id. The language mode stays Markdown so M6 Write / Read / Code, R2 (source one key away), outline and `#` jumps all work unchanged.

### 3.2 What the user sees

- **Icon:** none new. Agent Markdown files use the guide's `note` glyph like any `.md`; JSON uses `code file`; folders use `folder`. (Guide §10.4: five glyphs only.)
- **Title:** the document title stays the file name. For `SKILL.md`, the title menu (`base/popover`) adds one line under the path: the skill's `name` and the tools that read that location, e.g. `Skill pdf-processing · read by Claude Code`. Location → tool mapping comes from §2.2; a path read by many tools (`.agents/skills`) says `read by Codex, Cursor, Gemini CLI, GitHub Copilot`.
- **Tooltip on the title** (`base/tooltip`, 600 ms): for `SKILL.md`, `CLAUDE.md`, `AGENTS.md` inside nested folders, the parent folder name, so ten `SKILL.md` windows are not ten identical titles. Taskbar/window title: `pdf-processing — SKILL.md — Tacet`.

Milestone M6. Acceptance: a fixture tree with one of every row above opens each file in the stated mode and language; `*.mdc` and `llms.txt` open in Write; `notes.txt` still opens plain; no new icon appears anywhere (screenshot diff of shelf and title bar against a plain `.md`).

## 4. Front matter as properties

### 4.1 Behavior

In **Write**, a YAML front matter block at line 1 (`---` … `---`, no blank line before it) renders as a **property block** at the top of the page, above the first heading, inside the 680 text column. It is document content, not chrome: it scrolls with the page and uses page type.

- Each row: key (Label 12/16, ink2) on the left in a fixed 132 px column; value (Body 14/20 ink) on the right. Row height 28, 4 grid. No boxes, no chips, no pills: values are plain text fields that show a hover fill (`hover canvas`) and a focus ring only on intent (M7).
- Value editors by schema type, all UI-KIT ports:
  - string / long string: inline text field; `description` wraps and grows (no scroll box).
  - enum (`context`, `effort`, `trigger`, `permissionMode`, `agent`, `shell`, `excludeAgent`): `base/menu` dropdown from the value, with a free-text last row ("Other value…"), because tools add values faster than Tacet ships.
  - boolean (`alwaysApply`, `disable-model-invocation`, `user-invocable`, `background`): `base/switch`. The stored spelling (`true`, `yes`, `on`) is kept when toggled back and forth; a new value is written as `true`/`false`.
  - glob list (`globs`, `applyTo`, `paths`): one text field per pattern; stored shape is preserved (comma-separated string for Cursor `globs` and Copilot `applyTo`, YAML list or string for `paths`).
  - map (`metadata`, `hooks`, `mcpServers`): shown read-only as `3 keys` with a text button `Edit in Code` that opens Code view at that line. Nested YAML is not edited in the block.
- **Field hints:** focus or hover a key → `base/tooltip` with the schema's one-line description and limit, e.g. `name — Lowercase letters, numbers and hyphens. Up to 64 characters. Must match the folder name.` Hints come from bundled per-kind schemas (§4.3).
- **Add a field:** the last row is a quiet text button `Add property` (visible on hover/focus of the block, M7). It opens `base/menu` listing the known fields for this kind that are not present, each with its hint as secondary text, then free text. Adding inserts one new line before the closing `---`, using the block's existing indentation and quote style.
- **Collapse:** `base/collapsible`. The block can collapse to one line showing `name` and the first 80 chars of `description` (or the first two keys for other kinds). State is remembered per file kind, not per file. Default: expanded for `skill`, `agent-*`, `rule-*`, `prompt-*`; there is no block when there is no front matter.
- **Raw YAML is one key away:** `Write ▾ → Code` (and its shortcut, R2) shows the file source with the YAML highlighted by the existing Markdown grammar. There is no separate "edit as YAML" mode.
- **Read** renders the same block as static text (no editors), matching `markdown.preview.frontMatter` = table style restyled to guide type. Read cannot edit (G3).
- Files whose front matter does not parse (invalid YAML): no property block; a quiet notice (rule `AF-YAML`) and the raw lines shown as a code block in Write, editable. Never "fix" it.

### 4.2 Byte-exact editing (engineering contract)

- Parse with the `yaml` package already bundled by `markdown-language-features` (`yaml@^2.8.3`), `keepSourceTokens: true`, CST mode. The model is the Monaco text model; the property block is a view of it.
- An edit to one value becomes **one text edit on the source range of that scalar** (or one inserted line for a new key, or one deleted line range for a removed key), applied through the normal model edit path so undo, dirty dot and drafts (M5) behave exactly as typing.
- Quoting: keep the scalar's existing style (plain, single, double, block `|`/`>`). If the new text cannot be written in that style (e.g. `: ` in a plain scalar), switch that scalar only to double quotes.
- Never touch: comments, key order, blank lines, anchors, indentation, other keys, line endings, BOM.
- Unknown keys are shown as rows (string values editable, others `Edit in Code`) and are never dropped.

### 4.3 Bundled schemas

`extensions/margin/agent-files/schemas/<kind>.json` (JSON Schema draft-07 describing the front matter), one per kind in §3.1, hand-written from §2.2 with a `x-margin-source` URL and `x-margin-checked` date per field. Tool-specific fields carry `x-margin-tools: ["claude-code"]` so hints can say `Claude Code only`. Updated by a person at each Tacet release; there is no runtime update.

### 4.4 Checks (quiet notices, never blocking)

Where a check shows:
- **Write:** a one-line field note under the affected property row: warning dot (fill = state, guide §10.2) + 12/16 ink2 sentence + at most one or two text-button fixes. For body-level checks (links, length, hidden characters), the existing inline document notice (guide §4 notice, warning surface) at the top of the page, one at a time, dismissible per file session.
- **Code:** Monaco markers with `Warning` or `Info` severity (squiggle), hover shows the same sentence and fix as a code action. No Problems panel, no counts.
- A check never changes the file by itself. Fixes are deterministic text edits the user clicks.

| Id | Kind | Check | Notice text | Fix |
| --- | --- | --- | --- | --- |
| AF-YAML | all with front matter | YAML parses | `The settings at the top are not valid YAML. Agents may ignore this file.` | `Show in Code` |
| AF-FM-START | all | front matter starts on line 1 (no blank line, no BOM issue) | `Settings must start on the first line.` | `Move to top` (removes leading blank lines only) |
| SK-NAME-REQ | skill | `name` present (spec) | `A skill needs a name.` | `Use folder name` |
| SK-NAME-CHARS | skill | `^[a-z0-9]+(-[a-z0-9]+)*$` | `Use lowercase letters, numbers and single hyphens.` | `Fix name` (lowercase, spaces/underscores → `-`, collapse `--`, trim `-`) |
| SK-NAME-LEN | skill | 1–64 chars | `Names can have up to 64 characters. This one has {0}.` | — |
| SK-NAME-DIR | skill | `name` = parent folder name | `The name is "{0}" but the folder is "{1}". They must match.` | `Use folder name` · `Rename folder` (M7 rename, link-aware) |
| SK-NAME-RESERVED | skill in `.claude/skills` | not `synced`, not `anthropic-skills*` | `Claude Code keeps this name for synced skills.` | — |
| SK-DESC-REQ | skill | `description` non-empty | `A skill needs a description. Agents use it to decide when to load the skill.` | — |
| SK-DESC-LEN | skill | ≤ 1024 chars; Claude Code: `description`+`when_to_use` ≤ 1536 | `Descriptions can have up to 1,024 characters. This one has {0}.` | — |
| SK-COMPAT-LEN | skill | `compatibility` 1–500 | `Compatibility can have up to 500 characters.` | — |
| SK-META-STR | skill | `metadata` values are strings | `Metadata values must be text. Put quotes around {0}.` | `Add quotes` |
| SK-TOOLS-FMT | skill | `allowed-tools` is a space-separated string (spec); list is valid only in Claude Code | Info: `Only Claude Code reads a list here. Other agents need one line separated by spaces.` | `Convert to one line` |
| SK-KEY-UNKNOWN | skill | key not in spec or any tool extension | Info: `"{0}" is not a known skill setting. Agents may ignore it.` | — |
| SK-KEY-PORTABLE | skill | key is a tool extension (e.g. `context`) | Info, only on hover of the key: `Claude Code only. claude.ai and the Skills API reject this key.` | — |
| SK-LINES | skill | body ≤ 500 lines, est. ≤ 5,000 tokens | shown by §7 rules | — |
| SK-REF-DEPTH | skill | links from `SKILL.md` stay one level deep | Info: `The spec suggests links only one folder deep from SKILL.md.` | — |
| AF-CASE | skill, instructions | exact spelling `SKILL.md`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` | `Name this file {0}. Some agents look for this exact spelling.` | `Rename` |
| CR-GLOBS | rule-cursor | `globs` is a comma-separated string, each part a valid glob | `Write globs as one line separated by commas.` | `Convert to one line` |
| CR-EMPTY | rule-cursor | not (`alwaysApply` false/absent and no `globs` and no `description`) | `This rule has no description, globs or alwaysApply. It applies only when you mention it.` | — |
| CR-EXT | `.md` inside `.cursor/rules` | extension `.mdc` | `Cursor ignores .md files in this folder. Use .mdc.` | `Rename to .mdc` |
| CP-APPLYTO | rule-copilot | `applyTo` present and each comma-separated part a valid glob | `Add applyTo so Copilot knows which files this is for.` / `"{0}" is not a valid glob.` | — |
| CP-EXCLUDE | rule-copilot | `excludeAgent` ∈ {`code-review`, `cloud-agent`} | `excludeAgent can be code-review or cloud-agent.` | menu |
| WS-TRIGGER | rule-windsurf | `trigger` ∈ {`always_on`, `model_decision`, `glob`, `manual`}; `glob` needs `globs`; `model_decision` needs `description` | `Trigger "glob" needs globs.` etc. | menu |
| WS-LEN | rule-windsurf | ≤ 12,000 chars (global rules ≤ 6,000) | §7 | — |
| CL-PATHS | rule-claude, rule-cline | `paths` is a glob or list of globs | `"{0}" is not a valid glob.` | — |
| AG-REQ | agent-claude | `name` and `description` present | `A subagent needs a name and a description.` | `Use file name` |
| AG-ENUM | agent-claude | `permissionMode`, `memory`, `isolation` values | `permissionMode can be default, acceptEdits, auto, plan or dontAsk.` | menu |
| PR-AGENT | prompt-copilot | `agent` is `ask`, `agent`, `plan` or text | none (free text allowed) | menu |
| CM-IMPORT | instructions (`CLAUDE.md`, `GEMINI.md`) | each `@path` outside code spans resolves; depth ≤ 4 | `This file imports @{0}, but it does not exist.` / `Imports go more than 4 levels deep. Claude Code stops at 4.` | `Locate…` |
| CM-LINES | `CLAUDE.md` | ≤ 200 lines | §7 | — |
| AM-SIZE | `AGENTS.md` | ≤ 32 KiB | §7 (`Codex reads up to 32 KiB of AGENTS.md files by default.`) | — |
| MD-LINK | all Markdown kinds | relative links and `${CLAUDE_SKILL_DIR}/…` resolve | `This link goes to {0}, which does not exist.` | `Locate…` · `Remove link` |
| LT-SHAPE | llms-txt | first content line is an H1 | Info: `llms.txt starts with a # title.` | — |

Glob validity uses the same `glob` parser the workbench uses for `files.exclude` (`vs/base/common/glob`); a pattern is invalid only if it fails to parse or contains `\` separators.

Milestone M6 (property block, checks), M7 for `Rename folder` fix (uses R-rename link awareness). Components: page-typography rows (no kit component), `base/menu`, `base/switch`, `base/tooltip`, `base/collapsible`, inline notice, Monaco markers.

Acceptance:
- **Round-trip:** corpus of ≥ 300 real files (public skills from `anthropics/skills`, `github/awesome-copilot`, `openai/skills`, agentskills examples; Cursor/Copilot/Windsurf rule samples) plus hostile YAML (comments, anchors, block scalars, CRLF, BOM, tabs, trailing spaces, no final newline). Open → Write → Read → Code → Write → save: SHA-256 identical for 100%.
- **Minimal edit:** change `description` via the block → `git diff --no-index` shows only the lines of that scalar; toggle a boolean twice → identical bytes.
- **Checks:** a fixture per rule id triggers exactly that notice, in Write and in Code, and saving still succeeds with no dialog.
- **Undo:** one property edit = one undo step; Ctrl+Z restores the exact bytes.
- Screenshot at 1440 and 480 px, light, dark, one Contrast Theme: no pills, no boxes, no color other than the warning dot and focus ring.

## 5. Structure and navigation

### 5.1 Skill folder view (shelf)

In the shelf's **Folders** tree, a folder containing `SKILL.md` is a normal folder row. When expanded, `SKILL.md` sorts first, then `references/`, `scripts/`, `assets/`, then other files. No badge, no extra icon. Selecting the folder row with Enter opens its `SKILL.md` (the skill *is* the folder; Space still expands). Tree rows follow `base/files` (UI-KIT) with no row motion.

### 5.2 "Agent files" shelf section

When a folder opened in the shelf contains recognized files (§3.1), the shelf shows a section **Agent files** below Folders (`base/accordion`, collapsed by default, rows 32, no row icons, per A4). Groups appear as sub-labels only when more than one group has files:

- **Skills** — one row per skill, labeled by front matter `name` (folder name if missing), secondary line the location root (`.claude/skills`, `.agents/skills`, …) only when two skills share a name.
- **Instructions** — `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `copilot-instructions.md`, … labeled with their folder path when nested (`packages/api/AGENTS.md`).
- **Rules** — rule files by file name.
- **Prompts and commands** — commands, prompts, subagents.
- **Settings** — MCP configs, Claude settings.

The index is built from file names and, for skills, the `name` line of front matter, only inside folders the user opened, capped at 5,000 files walked and 200 results, using `files.exclude` and skipping `node_modules`. It refreshes through a correlated file watcher on those folders (CLAUDE.md coding rule). No count badges. The section's hover `…` menu has `New skill`, `New AGENTS.md`, `New rule`, `Hide this section`.

Owner decision D1 (§14): the section shows automatically when files are found (it is a view of the user's files, like Recent) vs. an Extra that is off by default (R9).

### 5.3 Headings, links and imports

- **Headings:** unchanged R6/M7: outline and `#` in Ctrl+P jump to headings in any agent Markdown file. Front matter is not a heading.
- **Relative links** open in Tacet (R5 resolution from the file's own folder). For skills, `${CLAUDE_SKILL_DIR}/x` resolves to the skill folder.
- **`@path` imports** in `CLAUDE.md`, `CLAUDE.local.md`, `.claude/rules/*`, `GEMINI.md`: rendered as links in Write/Read (link color, no underline change) when outside code spans and fences, exactly the Claude Code rule [S24]. Ctrl+click or Enter on the link opens the file; relative to the importing file; `~/` expands to the user profile. An import outside the opened folder opens only on the click (no pre-read), after showing the full path (R4 pattern).
- `#file:path` in `.prompt.md` is treated the same way.
- **Broken links:** rule MD-LINK and CM-IMPORT. Built on the Markdown language service's existing link validation (`markdown.validate.fileLinks` / `fragmentLinks`), turned on for agent kinds only; imports add a small resolver in the Tacet extension.

Milestone M7 (section, index, imports, broken links), M6 (link opening). Components: `base/files`, `base/accordion`, `base/menu`, inline notice, Monaco markers.

Acceptance: open a folder with 3 skills, nested AGENTS.md files and one `.mdc` rule → the section lists them grouped; Enter on a skill row opens its `SKILL.md` with the caret ready; a `CLAUDE.md` with `@docs/a.md` (exists), `` `@not-an-import` `` (in a code span) and `@missing.md` → first is a link, second is text, third raises CM-IMPORT; process monitor shows no file reads outside the opened folder until a link is clicked.

## 6. Safety

1. **Nothing in a skill runs.** Files in `scripts/` open as text in Code view. Links to `.py .sh .ps1 .bat .cmd .js .mjs .exe .msi .lnk` open as text in Tacet or not at all (binaries: `Show in Explorer` only). No "Run", no "Open with default app" for these types. The terminal (if the user turned it on) is never pre-filled with a script path.
2. **Show what the agent will run.** In skills and commands, Claude Code's shell injection lines (`` !`cmd` `` at line start or after whitespace, and ```` ```! ```` fences) are highlighted in Write as code with a quiet left note `Runs when an agent loads this skill` (Label 12/16 ink2). A skill that has any such line shows one inline notice on open: `This skill runs commands when an agent loads it. Check them before you use it.` with `Show commands` (jumps through them). Hook `command` values in `settings.json` and `command`/`args` in MCP configs get an Info marker `An agent runs this command.` Tacet states a fact; it does not judge the command.
3. **Nothing hidden.** In every agent kind, invisible and bidirectional characters (zero-width, bidi overrides, Unicode tag characters U+E0000–E007F, soft hyphen) are shown as visible marks in Write, Read and Code (Monaco `editor.unicodeHighlight.invisibleCharacters` and `ambiguousCharacters` forced on for these kinds; the Write/Read renderer draws the same marks). On open, if any are present: notice `This file has {0} hidden characters. Agents read them; people do not see them.` with `Show` and `Remove all` (a deterministic edit, undoable). This is the "Rules File Backdoor" attack on `.cursor/rules` and `copilot-instructions.md` [S28, S29].
4. **HTML comments are visible.** In agent kinds, `<!-- … -->` renders in Write and Read as a dim (ink3) comment block, not hidden, because agents read comments.
5. **Links:** R4 unchanged: only `http`, `https`, `mailto` open outside Tacet, destination shown first.
6. **Downloaded skills:** a `SKILL.md` or any agent file with Mark of the Web opens in Read (A13); the skill folder view marks nothing, but the §6.2 and §6.3 notices still run.
7. **Secrets in configs:** in MCP and settings JSON, a string value in `env` or `headers` that matches common secret shapes (`sk-`, `ghp_`, `github_pat_`, `xox`, `AKIA`, `Bearer` + ≥ 20 chars) gets a Warning marker: `This looks like a secret. Agents and git can copy this file. Use ${VAR} instead.` Local regex only.

Milestone M6 (1, 2, 3, 4, 7), M9 trust pass verifies all. Components: inline notice, Monaco markers, `base/tooltip`.

Acceptance: fixture skill with `scripts/run.ps1` linked from `SKILL.md` → clicking opens the text; no process is created (process inventory N-03). Fixture rule with a zero-width joiner and a bidi override → notice with count 2, marks visible in all three views, `Remove all` produces a file whose only diff is those characters. MCP fixture with `"API_KEY": "sk-…"` shows the marker.

## 7. Length guidance

No counter on screen by default (A2).

- **On request:** the title menu (`base/popover`) shows one line for every file: `212 lines · 1,840 words · 11,204 characters`. For agent kinds it adds the relevant limit and an estimate: `SKILL.md: 212 of 500 lines · about 2,800 tokens (estimate: characters ÷ 4)`. The word is "about"; no tokenizer is bundled.
- **Near the limit:** at 90% of a published limit, one inline notice (dismissible for the session): `This SKILL.md has 470 lines. The spec suggests under 500. Move detail to references/.` Over the limit, the same notice with the numbers. Limits: SKILL.md 500 lines / ~5,000 tokens [S16]; CLAUDE.md 200 lines [S24]; Cursor rule 500 lines [S6]; Windsurf rule 12,000 chars, global rules 6,000 chars [S8]; AGENTS.md 32 KiB [S4]; skill `description` 1,024 chars (field note, §4.4).
- If the Extras status line is on, it shows `Ln, Col` and words as usual; agent limits never go in the status line.

Milestone M6. Components: `base/popover` (title menu), inline notice. Acceptance: a 460-line SKILL.md shows the notice once; a 300-line one shows nothing until the title menu is opened; numbers match `wc -l` / `wc -w` / `wc -m` on the fixture.

## 8. New from template

Commands (palette, the Agent files section `…` menu, and Folders context menu `New ▸`); no toolbar button. Every template is static text in the build. No generation.

| Command | Asks | Creates |
| --- | --- | --- |
| `New skill` | name (quick input, validated live against SK-NAME-*), then location: the opened folder, or `.agents/skills`, `.claude/skills`, `.github/skills` under it (only folders the user opened) | `<name>/SKILL.md` with `name: <name>`, `description: ` (caret here), a body `# <Title from name>` + `## Instructions` + `## Examples`; empty `references/` is **not** created (no empty folders) |
| `New AGENTS.md` | folder | `AGENTS.md` with headings `# AGENTS.md`, `## Setup`, `## Build and test`, `## Code style`, `## Rules` (each empty) |
| `New CLAUDE.md` | folder | `CLAUDE.md`, same headings; a comment line `<!-- Import shared rules: @AGENTS.md -->` only if an `AGENTS.md` sits in that folder |
| `New rule` | tool (Cursor, GitHub Copilot, Claude Code, Windsurf, Cline) then name | `.cursor/rules/<name>.mdc` (`description`, `globs`, `alwaysApply: false`) · `.github/instructions/<name>.instructions.md` (`applyTo: "**"`) · `.claude/rules/<name>.md` (`paths:`) · `.windsurf/rules/<name>.md` (`trigger: manual`) · `.clinerules/<name>.md` (no front matter) |
| `New prompt` | tool (Claude Code command, GitHub Copilot prompt) then name | `.claude/commands/<name>.md` (`description`, `argument-hint`) · `.github/prompts/<name>.prompt.md` (`description`, `agent: agent`) |
| `New subagent` | name | `.claude/agents/<name>.md` (`name`, `description`, `tools`) |

After creation the file opens in Write with the caret in the first empty required value (usually `description`). Nothing is written until the user confirms the name and folder (quick input Enter). Line endings follow `files.eol`; UTF-8 without BOM.

Milestone M6 (templates), M7 (location choice lists only opened folders). Components: quick input (instant, K tier), `base/menu`. Acceptance: each template passes every §4.4 check except "description empty" on creation; `skills-ref validate` passes on a `New skill` output after a description is typed.

## 9. Finding: Ctrl+P and search

- **Ctrl+P understands these names (R6):** quick open results for `SKILL.md` are labeled by the skill `name` with the folder path as description (`pdf-processing  .claude/skills/pdf-processing`); nested `AGENTS.md` / `CLAUDE.md` show the folder first (`api/ AGENTS.md`). Typing a skill name finds its `SKILL.md` (from the §5.2 index). Typing `skill`, `rule`, `agents`, `claude`, `mcp` matches file names as today; no new prefix, no new mode. Instant (K tier).
- **Content search (R8):** unchanged; "this file's folder" works from a `SKILL.md` to search the whole skill.
- **Rename (M7 link-aware rename):** renaming a skill folder offers to update the `name` field (one edit) and links in the folder's Markdown; renaming `name` offers `Rename folder` (SK-NAME-DIR).

Milestone M7. Acceptance: with 40 skills open in a folder, Ctrl+P `pdf` shows `pdf-processing` first with its path; opening is < 50 ms after the index is warm; renaming the folder `pdf-processing` → `pdf-tools` updates `name` only after the user accepts.

## 10. JSON configs (MCP, settings)

- Schemas bundled in `extensions/margin/agent-files/json/`:
  - `claude-code-settings.schema.json` — copy of SchemaStore `claude-code-settings.json` [S11] (check its license at copy time; record in ThirdPartyNotices).
  - `mcp-claude.schema.json` — Tacet-written from [S12, S13]: `mcpServers` map; `type` enum `stdio|http|sse|ws`; stdio requires `command`; remote requires `url`; `env`/`headers` string maps.
  - `mcp-vscode.schema.json` — Tacet-written from [S14]: `servers`, `inputs`.
- Wired with `contributes.jsonValidation` (`fileMatch` from §3.1) in `extensions/margin/package.json`, so the existing JSON language service gives validation, hover and completion with no new code path.
- `$schema` remap: a small allowlist in the JSON client maps `https://json.schemastore.org/claude-code-settings.json` to the bundled file. Any other remote `$schema` is not downloaded; the service's "download disabled" message is replaced by an Info marker `Tacet does not download schemas.`
- Completion of `${VAR}` / `${input:id}` is plain snippet completion inside strings; no environment is read.
- No discovery: Tacet does not look for or list MCP servers anywhere, never starts one, and has no "test connection" (06-NO-AI §1).

Milestone M6 for wiring (JSON is Code view), M8 for Open With on `.json` unchanged. Components: Monaco suggest (guide §4 suggest styling), markers. Acceptance: fixture `.mcp.json` with a stdio server missing `command` shows one marker; completion inside a server offers `type`, `command`, `args`, `env`; network trace (N-04) shows zero requests while editing all JSON fixtures.

## 11. Windows (M8)

- `*.mdc`, `.cursorrules`, `.windsurfrules`, `.clinerules` added to the Open With list (no default-app claim for them).
- `margin <folder>` where the folder contains `SKILL.md` opens the folder in the shelf and `SKILL.md` on the page. `margin --goto SKILL.md:12` works as for any file.
- Dropping a skill folder on the window does the same.
- Unicode and long paths: skill folder names are ASCII by spec, but the parents may not be; covered by the M8 Unicode path suite.

Acceptance: from Explorer, Open With → Tacet on a `.mdc` opens it in Write with its property block; drag of a skill folder opens `SKILL.md`.

## 12. Feature → milestone → component summary

| # | Feature | Milestone | UI-KIT / surface | Acceptance (short) |
| --- | --- | --- | --- | --- |
| F1 | Recognition + language mode (`.mdc`, `llms.txt` as Markdown) | M6 | none (classifier) | fixture tree opens each kind in the stated mode |
| F2 | Front matter property block | M6 | `base/menu`, `base/switch`, `base/tooltip`, `base/collapsible` | 300-file corpus byte-identical; single-scalar diffs |
| F3 | Spec checks as quiet notices + one-click fixes | M6 | inline notice, field note, Monaco markers | one fixture per rule id; save never blocked |
| F4 | Safety: no execution, shell lines shown, hidden characters, HTML comments, secrets | M6 / M9 | inline notice, markers | no process created; hidden chars counted and removable |
| F5 | Length on request / near limit | M6 | `base/popover` (title menu), inline notice | numbers match `wc`; notice at 90% |
| F6 | New from template | M6 / M7 | quick input, `base/menu` | templates pass checks; `skills-ref validate` passes |
| F7 | Skill folder view + Agent files section | M7 | `base/files`, `base/accordion` | grouped list; no reads outside opened folders |
| F8 | Imports and links (`@path`, `${CLAUDE_SKILL_DIR}`, `#file:`), broken-link notice | M7 | markers, notice | code-span rule respected; missing import flagged |
| F9 | Ctrl+P by skill name; link-aware skill rename | M7 | quick open (instant) | `pdf` finds `pdf-processing`; rename updates `name` on accept |
| F10 | JSON schemas for MCP and Claude settings (local) | M6 | Monaco suggest, markers | zero network requests |
| F11 | Windows opening of rule files and skill folders | M8 | none | Open With `.mdc`; folder drop opens `SKILL.md` |

Build order inside M6: F1 → F2 (with the round-trip corpus test first) → F3 → F4 → F5 → F10 → F6. M7: F7 → F8 → F9. Every feature closes with the milestone's Codex review and `/design-review`.

## 13. Not doing

- No AI: no generating or rewriting skills, descriptions or rules; no "suggest a description"; no summaries; no model-based token counts.
- No running agents, skills, scripts, hooks, commands or MCP servers; no "test this skill", no terminal pre-fill, no connection test.
- No MCP discovery, no reading agent home folders (`~/.claude`, `~/.codex`, `~/.agents`, `%APPDATA%\Claude`) unless the user opens them.
- No skill marketplace, gallery, install, sync or update; no `gh skill`, no registry calls.
- No telemetry about which agent files people use.
- No per-tool branding, logos or colored icons; no new file icons.
- No automatic reformatting of YAML or JSON; no "normalize front matter".
- No converting between tools' formats (e.g. `.cursorrules` → `.mdc`) in 1.0 beyond the single-field fixes in §4.4. (Candidate for later: `Copy as AGENTS.md`.)
- No TOML support for `.codex/config.toml` in 1.0 (no TOML language in the built-ins; opens as plain text).
- No blocking validation, no Problems panel, no error counts.

## 14. Owner decisions

- **D1** Agent files shelf section: automatic when found (recommended; it only lists the user's files) or an Extra, off by default (strict R9).
- **D2** Section and command wording: "Agent files" (recommended, literal) vs. "Instructions".
- **D3** Bundle the SchemaStore Claude settings schema (license check, refresh per release) or ship only the Tacet-written MCP schemas.

## 15. Sources (accessed 2026-09-27)

- [S1] Configuring Agentic AI Coding Tools: An Exploratory Study (arXiv 2602.14690), 2,926 repos, Feb 2026: https://arxiv.org/html/2602.14690v1
- [S2] Agent READMEs: An Empirical Study of Context Files for Agentic Coding (arXiv 2511.12884; ACM TOSEM): https://arxiv.org/html/2511.12884v1
- [S3] AGENTS.md: https://agents.md/
- [S4] Codex, Custom instructions with AGENTS.md: https://learn.chatgpt.com/docs/agent-configuration/agents-md
- [S5] Codex, Build skills: https://learn.chatgpt.com/docs/build-skills
- [S6] Cursor, Rules: https://cursor.com/docs/context/rules
- [S7] GitHub Docs, Add repository custom instructions: https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions
- [S8] Devin Desktop (Windsurf), Rules and memories: https://docs.devin.ai/desktop/cascade/memories
- [S9] Cline, Rules: https://docs.cline.bot/features/cline-rules
- [S10] Gemini CLI, GEMINI.md: https://geminicli.com/docs/cli/gemini-md/
- [S11] SchemaStore Claude Code settings schema: https://json.schemastore.org/claude-code-settings.json ; Claude Code settings: https://code.claude.com/docs/en/settings
- [S12] Claude Code, MCP: https://code.claude.com/docs/en/mcp
- [S13] MCP, Connect to local servers (claude_desktop_config.json): https://modelcontextprotocol.io/docs/develop/connect-local-servers
- [S14] VS Code, MCP servers: https://code.visualstudio.com/docs/copilot/customization/mcp-servers
- [S15] Claude Code, Skills: https://code.claude.com/docs/en/skills
- [S16] Agent Skills specification: https://agentskills.io/specification
- [S17] Agent Skills overview and clients: https://agentskills.io/
- [S18] aider, Conventions: https://aider.chat/docs/usage/conventions.html
- [S19] Junie, Guidelines and memory: https://junie.jetbrains.com/docs/guidelines-and-memory.html (page returned 403 to the fetcher; locations confirmed via search summary, verify before build)
- [S20] llms.txt: https://llmstxt.org/
- [S21] VS Code, Agent skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
- [S22] Cursor, Skills: https://cursor.com/docs/context/skills
- [S23] Gemini CLI, Skills: https://geminicli.com/docs/cli/skills/
- [S24] Claude Code, How Claude remembers your project (CLAUDE.md, imports, rules): https://code.claude.com/docs/en/memory
- [S25] VS Code, Custom instructions: https://code.visualstudio.com/docs/copilot/customization/custom-instructions
- [S26] VS Code, Prompt files: https://code.visualstudio.com/docs/copilot/customization/prompt-files
- [S27] Claude Code, Subagents: https://code.claude.com/docs/en/sub-agents
- [S28] Pillar Security, Rules File Backdoor: https://www.pillar.security/blog/new-vulnerability-in-github-copilot-and-cursor-how-hackers-can-weaponize-code-agents
- [S29] Security Affairs, Rules File Backdoor: https://securityaffairs.com/175593/hacking/rules-file-backdoor-ai-code-editors-silent-supply-chain-attacks.html

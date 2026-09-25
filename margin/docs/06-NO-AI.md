# AI removal contract

## 1. Exact promise

The **distributed Margin app** includes no built-in AI assistant, inference provider, AI agent runtime, generative completion/rewriting, chat, model selection, voice assistant, MCP server discovery/execution, embeddings, semantic AI search, AI settings search, automatic model download, or associated login/upsell/setup flow.

The promise covers source entry points, packaged code and dependencies, processes, commands, menus, settings, extension activation, and network behavior. It is not fulfilled by setting `chat.disableAIFeatures`, hiding a panel, renaming buttons, or blocking a few URLs.

Conventional completion from language servers, snippets, syntax coloring, deterministic formatting, find/replace, spelling from a reviewed local dictionary, and Git remain allowed. Statistical language detection models also leave the distribution under this strict interpretation; extension/manual language selection provides the fallback. Do not mistake terminal processes or the generic remote extension host for AI merely because upstream names include “agent.”

## 2. In scope for removal

| Layer | Examples observed or to audit | Required outcome |
| --- | --- | --- |
| Bundled providers | `extensions/copilot`, Copilot/Codex/Claude SDKs, local inference SDK | Absent from packaged files and installed runtime dependency graph |
| Main/native | Agent host starter/manager, agent process/channel registration | No launch route or worker executable included |
| Shared process | Agent/MCP channels, background discovery/management | Removed or replaced with explicit unsupported capability only where non-AI consumers require it |
| Workbench | Chat/inline chat/agent sessions/voice/MCP contributions | No UI/action/command surface, initialization, or automatic scan |
| Editor | Generative inline suggestions, edit predictors, AI code actions | Removed; conventional language features remain |
| Extension API | Chat, LM providers/tools, embeddings, MCP contributions | Not advertised/activated; callers get documented unsupported behavior |
| Product config | Provider identifiers, URLs, voice endpoints, experiments, setup metadata | Absent from shipping product configuration |
| Onboarding/settings | AI setup, account badges, hidden opt-in toggles, prompt-file workflows | Absent; stale imported settings cannot enable them |
| Packaging | Agents window, agent host entry points, downloaded runtimes/models, Copilot build tasks | Excluded from artifact and build-fetch manifest |
| Help/update | AI links, recommendations, post-update reinstall | Removed; update cannot restore removed components |

AI-authored `.md`, `AGENTS.md`, prompt files, or code using an AI SDK are still ordinary user files. The editor can display them. Do not censor or delete user content based on words. No product “AI removal” step may scan and alter user notes.

## 3. Removal method

1. Inventory reachable contributions and runtime dependencies for the selected desktop entry point. Record exact paths/symbols with reasons in a removal manifest.
2. Split mixed modules where non-AI functionality depends on AI services/types. Prefer removing the injection at the consumer over leaving a large dormant service graph.
3. Remove entry imports, registration, platform process/channel creation, extension activation, provider metadata, and packaging/build targets as one reviewed slice.
4. Use narrow typed unsupported implementations only for compatibility contracts that truly must remain. They perform no file scan, network call, process spawn, token lookup, or timer. Test their behavior. Avoid generalized dynamic no-op proxies.
5. Remove dependency packages, regenerate locks, and verify no transitive provider SDK/model remains.
6. Audit UI and command registries after real launch. Conventional editing and extension host startup must still work.
7. Capture process/network/artifact receipts against the exact source and binary hash.

Retaining upstream AI source files solely to minimize source-fork maintenance can be acceptable if they are unreachable and absent from distributed bundles, archives, maps, models, and executables. “Zero occurrences of the word chat” is neither the requirement nor proof. Any retained compatibility type/module must have a named reason and be checked in the shipped graph.

## 4. Extension policy

V1 ships a reviewed set of built-in editing/language extensions. No general marketplace browsing, recommendation install, automatic extension download, or unchecked VSIX installation is part of the consumer build. Keep the extension host for those built-ins; do not throw away language services to remove AI.

This is a v1 scope decision, not a claim that arbitrary third-party code can be proven AI-free by its manifest. An AI category, known provider ID, or contributed LM API can be caught, but an extension can also call external APIs under an unrelated name. If unrestricted extension installation is introduced later, explicitly narrow the product promise to built-in features and create an owner-approved policy change. Do not pretend a regex blocklist solves this.

User-authored programs run through the terminal are outside the shipped-feature guarantee. Normal workspace trust and explicit execution rules still apply. Do not add a surveillance system that tries to infer whether the user's scripts use AI.

## 5. Network contract

Empty launch, local note open/edit/search/recovery, and passive Markdown rendering require zero product-originated outbound requests in the qualification run. No telemetry, experiments, remote fonts, remote images without consent, credential lookup, or provider discovery.

Explicit user actions can use the network where the product exposes them: opening an HTTPS link, Git operations, a user-run terminal command, a reviewed updater, or an explicitly permitted external image. Label/classify that traffic separately in evidence. No firewall rule blocking broad access is a substitute for removal; a blocked attempt is still an attempted request.

Logs stay local; support export previews and redacts document text/credentials/paths by default. No test or audit should publish private notes.

## 6. Mandatory proof

**N-01 Artifact inventory:** unpack release, inspect archives/maps/native workers/built-ins/dependencies, generate hashes/SBOM; absence checks use a reviewed manifest, including transitive libraries. Exceptions are explicit and justified.

**N-02 Command/UI inventory:** enumerate registered commands, menus, views, settings, status items, links, keybindings, and welcome surfaces in both writing and coding layouts. No product AI entries, including hidden-but-callable commands.

**N-03 Process inventory:** cold/fresh-process launch, ten minutes idle, open/edit Markdown, Code, folder, terminal. No AI worker, model runtime, MCP discovery process, or background agent created.

**N-04 Network observation:** local fixture workflows with network tracing, online and disconnected. Record all requests. Unexplained or AI-related attempts fail qualification, even if they return 404 or are blocked.

**N-05 Re-enable resistance:** change stale AI settings at user/workspace/profile levels, open old prompt files, call old commands, attempt provider activation in a fixture extension, import an old profile in a test harness. The feature remains unavailable and ordinary editing remains healthy.

**N-06 Preservation:** LSP completion, snippets, Git, terminal, debugging, Markdown navigation, save, undo, and recovery still work. Never “pass” by disabling the entire extension host or all networking globally.

**N-07 Update resistance:** upgrade from the previous Margin build in an isolated profile; no AI component or setup flow returns. Verify the exact upgraded artifact again.

## 7. Failure policy

Unmapped AI dependencies, dormant SDK packages, missing source/runtime proof, or inability to explain network traffic mean **AI removal incomplete**. Do not advertise “all AI removed” based on the experiments here. The first source sketch used command-name filtering and feature disabling; it is preserved to explain an explored approach and is explicitly not the accepted final architecture.

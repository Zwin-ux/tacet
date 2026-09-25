# Execution plan

## Working method

One repository, eight work packages, ordered by risk. Each package ends with a reviewable artifact and an explicit gate. Do not implement every screen before proving document durability. Do not merge untested source removal and rich editor changes into an undiagnosable batch.

The machine has 16 GB RAM and a recorded history of failures under unbounded agent/build concurrency. Run one native build/test lane. Do not spawn agents without authorization; if authorized, at most three concurrent subagents and depth two, with extra work queued. The safest useful split is one integrator, one independent read-only/source audit, one bounded design/fixture lane. No simultaneous root dependency installs or competing shared-tree edits.

## W0 — Establish a repeatable upstream baseline

**Owns:** M01/M12 infrastructure. **Dependencies:** none. **Deliverable:** launchable unmodified pinned Code OSS development build and a short receipt.

1. Read state, source identity, AGENTS, and original install failure.
2. Verify Node `.nvmrc`, Electron `.npmrc`, npm version, Python, chosen Visual Studio instance, architecture, available disk/memory.
3. Resolve the observed `MSB8040` Spectre library prerequisite for the actually selected compiler/toolset/architecture. Do not disable mitigations simply to bypass the error. If another installed toolchain already has matching components, select it explicitly and verify the result.
4. Bound install concurrency in a small clearly documented build-only patch. Do not trigger the old eight-job postinstall or parallel watch processes on this host.
5. Install from the baseline lock, build once, launch in an isolated profile and extension directory. Record source hash, build commands, process exit, startup logs, and screenshot.
6. Exercise open/type/save/undo/terminal in temporary fixtures. Keep the binary/profile distinct from the user's existing VS Code.

**Gate G0:** real app window, working conventional editor, reproducible command, no unexplained startup error. If blocked, report exact evidence and continue independent spec/fixture work, not fictional runtime validation.

## W1 — Product identity and AI removal

**Owns:** M01/M02. **Dependency:** G0. **Deliverable:** Margin-branded baseline with audited AI removal.

Build the explicit removal inventory from desktop and shared-process entry points. Remove providers, native agent process paths, service registration, extension API capability/activation, packaging targets, product endpoints, and setup surfaces. Preserve conventional editing features. Generate artifact/dependency receipts and a truthful compatibility exception list.

Create separate application IDs/profile directories/URI scheme, initial white theme, and original icon. Do not use Microsoft distribution endpoints or branding as the new product. Curate built-in extensions and their licenses. Complete N-01 through N-06 before declaring this package done.

**Gate G1:** actual Margin binary opens, zero shipped AI providers/runtimes or entry points, coding smoke still passes, local empty workflow has no unexpected outbound traffic. A settings-only fork fails this gate.

## W2 — First durable note

**Owns:** M03/M05/M09. **Dependencies:** G1. **Deliverable:** launch → write draft → Save As → close/reopen, using native text infrastructure.

Implement draft identity, first-launch routing, dedicated profile storage, honest status, native Save As transfer, hot-exit, and restored cursor. Use a plain/source editor initially if needed. Add targeted crash/error fixtures before visual expansion. This is the first meaningful vertical slice.

**Gate G2:** cancel/save failure/external conflict/renderer kill/normal exit preserve text; no duplicate mutable draft after save; original user files remain untouched by tests.

## W3 — Signature writing surface

**Owns:** M04/M11 plus M03. **Dependencies:** G2. **Deliverable:** Write/Read/Code on one document with final white typography and toolbar.

Use existing rich Markdown engine; add per-document mode ownership, source anchors, edit-queue drain, source fallback, Read mutation protection, and assets policy. Remove global read-only leakage into new drafts. Apply the design tokens; then check real Markdown fixtures, IME, undo, and source identity. Build the literal `.txt` route.

**Gate G3:** round-trip corpus passes, mode changes preserve text/history/position, Read cannot edit, source fallback protects unsupported syntax, compact window works.

## W4 — Find and navigate

**Owns:** M06/M07/M08. **Dependencies:** G3. **Deliverable:** draft/recent/folder shelf, quick open, content search, heading/task rail.

Prefer native views and search services. Use versioned Markdown structure from the existing language/parser stack; replace the experimental regex helper. Provide missing-file, cancellation, no-result, duplicate-title, and stale-range behavior. Search only explicit scope and include unsaved buffers.

**Gate G4:** a user can find a passage, navigate it, toggle a task safely, rename a file with link awareness, and return to editing without knowing developer commands.

## W5 — Useful coding and platform behavior

**Owns:** M10/M11/M12. **Dependencies:** G4. **Deliverable:** deliberate coding-layout toggle and Windows integration.

Preserve terminal/Git/debug/search/language tools, remember layout, retain task ownership when hidden. Finish native window controls, Explorer Open With, argument/URI routing, multiple windows, file dialogs, optional associations, print/PDF, and accessibility. No general plugin marketplace in v1.

**Gate G5:** notes → source → harmless command → Git inspection → notes works with no AI; file opening from the OS and Unicode paths works; printing produces readable local PDF.

## W6 — Trust and refinement

**Owns:** M09/M11/M12. **Dependencies:** G5. **Deliverable:** complete error/recovery/settings surfaces, measured performance, usability feedback.

Fault-inject file locks, disk failure, external writes, deleted paths, interrupted save/rename, and process failures. Review screen-reader keyboard flows and Windows scaling. Run a realistic corpus and resource benchmarks. Observe the product tasks with 5–8 users; address failures rather than adding scope. Finish source-faithful document details and original multiresolution app resources.

**Gate G6:** all P0 behavior/safety tests pass; visual defects have fixes/evidence; performance targets either pass or have explicit owner-accepted revised budgets. No unexplained errors hidden behind a polished screenshot.

## W7 — Release candidate

**Owns:** M01/M12. **Dependencies:** G6. **Deliverable:** versioned Windows x64 artifact, source receipt, notices/SBOM, release packet, rollback plan.

Build from a known clean product head in a controlled lane. Qualify fresh install, upgrade, uninstall-with-data-preservation, default associations, isolated profiles, and failure recovery. Repeat no-AI audit against the packaged artifact. Signing, publishing, paid certificates/services, public release, and default app changes need explicit owner authorization; do all authorized preparation first.

**Gate G7:** approved exact artifact hashes, native smoke, upgrade/rollback proof, accurate limitations, required signature/distribution decisions complete. No claim of Mac/Linux/mobile support from Windows or browser evidence.

## First assignment to Opus

Complete W0 only, then proceed to W1 if G0 passes. Do not begin by applying `experiments/prepare.mjs.txt`, rewriting the editor, adding a backend, or rendering more landing pages. The first report should contain exact baseline build identity, native launch evidence, the prerequisite resolution, and the reviewed removal inventory.

## Change and handoff discipline

- Inspect current git status before every work package. Preserve unrelated changes. Use isolated worktrees for risky integration.
- Keep current owner/head/test receipts in STATE or a project execution ledger. Product specs remain stable contracts.
- Every patch names its module, user behavior, acceptance case, and remaining risk.
- Integration must include the current dirty candidate when intended; a commit hash alone may omit active work.
- At a handoff: list completed gate IDs, file paths, exact commands/results, unresolved blockers, and the next bounded step.
- Re-run tests for affected behavior or a real unresolved risk. Do not spend tokens on repeated broad checks after evidence is sufficient.

# Acceptance and evidence matrix

No row marked required is satisfied by concept art. Browser prototype checks qualify only that prototype. Use isolated profiles and disposable fixture files, never the user's real notes.

## Core behavior and data safety

| ID | Scenario | Pass condition | Priority |
| --- | --- | --- | --- |
| A01 | First launch offline | Empty editable draft, no setup/account/network dependency | P0 |
| A02 | OS opens one file | Correct existing file, no project/import requirement | P0 |
| A03 | Draft Save As / cancel | Cancel preserves draft; success coordinates identity and latest edit | P0 |
| A04 | Save failure / denied path | Text retained, honest error, working Save a Copy | P0 |
| A05 | Open/save with no edit | Byte-for-byte identity for corpus, including BOM/EOL | P0 |
| A06 | Write → Code → Read → Write | Same document/version, mapped position, shared undo | P0 |
| A07 | Read mutation attempts | Keyboard/paste/drop/tasks/commands cannot change source | P0 |
| A08 | Literal `.txt` | No Markdown interpretation or extension conversion | P0 |
| A09 | External change with local edits | Autosave paused; compare; both versions recoverable | P0 |
| A10 | Save races external write | Detect/reject conflict without silent overwrite | P0 |
| A11 | Kill renderer/host/main | Recover acknowledged text; report measured loss window | P0 |
| A12 | Crash during Save As/rename | No lost draft/file, recoverable identities, no duplicate corruption | P0 |
| A13 | Reopen session | Correct docs, modes, caret, scroll; no extra empty drafts | P1 |
| A14 | IME/emoji/RTL/combining marks | Composition, selection, delete, undo, save/reopen correct | P0 |
| A15 | Unsupported Markdown | Intact source fallback, no destructive rewrite | P0 |
| A16 | Large/pathological/binary | Responsive routing, no truncation/accidental overwrite | P0 |
| A17 | Stale task/heading/search result | Re-resolve or safely refuse; never edit another range | P0 |
| A18 | Missing/locked/UNC/symlink/case-only path | Honest state, safe operations, no identity confusion | P0 |
| A19 | Image paste failure | No broken source link or untracked partial write | P1 |
| A20 | Remove Recent / clear index | Actual file and draft text unaffected | P0 |
| A21 | Duplicate names/titles/windows | Clear paths and single canonical ownership | P1 |
| A22 | History eviction and failed recovery | Live/unresolved drafts never evicted; export still possible | P0 |

## Navigation, accessibility, and coding

| ID | Scenario | Pass condition |
| --- | --- | --- |
| A23 | Ctrl+P | Search scope visible; Enter/Escape correct; no stale query results |
| A24 | Content search | Match snippets/paths/source anchors correct; unsaved edits searchable |
| A25 | Find/replace | Replace All one undo step; invalid regex explained; disabled in Read |
| A26 | Coding toggle | Tools function, writing layout restores, terminal lifetime understandable |
| A27 | Conventional completion/Git/debug | Useful non-AI features remain after removal |
| A28 | Keyboard-only session | All primary tasks reachable, focus visible, no traps |
| A29 | Narrator and NVDA | Names/states/selection/error announcements correct in native app |
| A30 | 125/150/200% scaling and document text zoom | Text/controls readable; Ctrl+wheel preserves position and changes document scale independently of UI scale |
| A31 | Widths 1280/960/720/600/480 | Content reflows, overlays dismiss, safe actions remain reachable |
| A32 | High contrast/reduced motion | System preferences honored, no color-only state |
| A33 | PDF/print | Selectable content, usable pagination/tables/code, source unchanged |
| A34 | Explorer/CLI/Unicode paths | Native routing, spaces/Unicode/multiple files correct |
| A35 | New/old profile separation | No accidental VS Code credential/settings/extension migration |

## Security, network, and removal

Satisfy N-01 through N-07 in the no-AI specification. Additional cases:

| ID | Input/action | Pass condition |
| --- | --- | --- |
| A36 | HTML/script/iframe/event handlers in Markdown | Inert content, no execution or host command dispatch |
| A37 | `command:`, `javascript:`, custom protocol links | Blocked unless an explicitly supported safe host route applies |
| A38 | Remote image/mermaid/font/resource in local note | No silent network access; safe opt-in/fallback |
| A39 | Relative paths/traversal/symlink resource | Resource roots enforced; no secret local file exposure |
| A40 | Malformed/oversized webview message | Validation rejects it, model unaffected, editor survives |
| A41 | Untrusted folder and fenced shell command | Reading works; no automatic execution |
| A42 | Logs/diagnostic export | No automatic upload, secrets/content excluded, preview before export |
| A43 | AI settings/profile/provider fixture | No reactivation, ordinary editor still works |
| A44 | Package upgrade | No returning AI components or lost profile/document data |

## Corpus

Create fixtures covering: empty file; LF/CRLF/mixed EOL; UTF-8 with/without BOM; supported UTF-16; unsupported legacy encoding; no final newline; trailing-space line breaks; frontmatter; ATX/setext/duplicate headings; nested lists and checkboxes inside fences; long fences; references and escaped URLs; local/remote images; irregular tables; HTML; math; Mermaid; footnotes; wiki links; callouts; MDX; emoji/combining/Arabic/CJK; 1 MiB and larger files; pathological nesting; binary bytes; Windows reserved/long/Unicode paths.

Include messy real-world public Markdown with source attribution and redistributable fixtures where possible. Keep private documents out of committed tests. Golden tests preserve byte hashes and intended minimal edit ranges. Test meaningful user actions, not a mirror of implementation functions.

## Performance targets

These are initial product budgets, **not measured claims**. Use the recorded 16 GB Windows x64 laptop class and a release build. Record CPU, storage, OS, power mode, source/binary hash, and process tree. Do not compare a release competitor to a development/debug build.

| Operation | Initial budget / method |
| --- | --- |
| Fresh process, warm filesystem cache, empty draft ready | p95 ≤ 1.5 s over 20 launches; timestamp from process start to actual input readiness |
| Existing process opens 50 KiB text/Markdown | p95 ≤ 300 ms over 30 opens |
| Typing in 50 KiB representative Markdown | p95 input-to-paint ≤ 32 ms; no >100 ms main-thread stall |
| Empty app idle memory | Target ≤ 350 MiB combined private working set across product processes after 60 s |
| Typical 10 documents, ~1 MiB total | Target ≤ 550 MiB combined; report every process, not only main |
| Repeated open/close cycles | 100 cycles, no unbounded growth; retained cache has a measured ceiling |
| File finder, 1,000 small notes | Initial results ≤ 150 ms after warm index; cancel obsolete query promptly |
| Content search, 10,000 small files | First results ≤ 500 ms, cancellable; corpus size/storage reported |
| Recovery checkpoint | Ordinary accepted input protected within 500 ms target; actual durability measured |
| Idle | No periodic AI/indexing work on unopened locations; settle near idle CPU |

If budgets fail, profile the actual bottleneck and revise architecture. An Electron/Code OSS fork cannot be called as small as Notepad without measurements. A slower target requires an explicit documented product decision; do not quietly change the budget in a test.

## Release gates

- Native Windows build, no-AI artifact/process/network audit, all P0 cases, and conventional editing smoke must pass.
- Clean install, upgrade, rollback, uninstall preserving notes, and opt-in associations must be exercised.
- Source/package/installer identities and hashes agree. Dependencies and licenses have a reviewable manifest.
- Public distribution/signing/update endpoints require explicit owner approval. Do not publish a local prototype as a release.
- Mac, Linux, touch, screen-reader, crash recovery, and accessibility claims each need their own actual evidence. Browser screenshots cannot substitute.

## Evidence receipt shape

For each gate store: date, source head plus dirty-patch hash if applicable, binary hash, profile path, fixture set/version, exact command, expected result, actual result, logs/screenshots, pass/fail, reviewer, and remaining limitation. Keep receipts under `margin/evidence/` or linked CI artifacts. Never mark an unchecked row passed.

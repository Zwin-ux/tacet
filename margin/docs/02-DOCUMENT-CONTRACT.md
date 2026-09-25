# Document, file, and recovery contract

Highest-priority behavior specification. Appearance cannot override text safety.

## 1. One document authority

Every canonical resource has one authoritative text model and an ordered version stream. Write, Read, Code, outline, tasks, search, print, and save status consume it. The rich renderer owns neither a separate undo stack nor persistence. Synchronization uses version/epoch-aware source edits.

| Concept | Contract |
| --- | --- |
| Identity | Stable resource URI; draft ID survives recovery; display title is separate |
| Current snapshot | Text, version, encoding/BOM/EOL, dirty flag, read-only capability |
| Saved baseline | Last acknowledged file state and reliable comparison identity; timestamp alone is insufficient |
| View state | Mode, caret/source selection, scroll anchor, folds; per document |
| Recovery | Identity, recoverable text version/bytes, encoding/EOL, checkpoint acknowledgment |
| Derived structure | Source version, headings/tasks/links/diagnostics; invalidate on change |

Map these to existing Code OSS services. This table does not mandate a new global store.

## 2. Save-state vocabulary

| State | Visible message | Meaning |
| --- | --- | --- |
| Empty draft | Draft | Stable local identity; not a user-selected file |
| Uncheckpointed input | Edited | Latest input is not acknowledged by recovery storage |
| Save taking noticeable time | Saving… | Useful progress; no flash on every keystroke |
| Recoverable draft | Saved in Drafts | Latest version has a successful recovery checkpoint |
| Named file | Saved | Acknowledged save matches the visible version |
| External divergence | Changed outside Margin | Autosave paused pending resolution |
| Failure | Couldn’t save | Preserve text; offer Retry and Save a Copy |
| File capability | Read-only file | Editing unavailable regardless of chosen view |

Read is a view; read-only file is a capability. Do not claim saved because IPC was sent or DOM changed. Displayed and saved versions must match.

## 3. Draft lifecycle

**D-01** Ctrl+N/New Note creates an empty editable draft, stable ID, and focused caret. No naming form or template.

**D-02** Derive a display title from the first heading/nonempty line. Never rename a saved file from content. Empty drafts show Untitled, disambiguated only when needed.

**D-03** Ctrl+S on a draft opens native Save As. Suggest a sanitized title with the appropriate extension. Handle Windows reserved names, invalid characters, trailing dots/spaces. Cancel leaves the draft intact.

**D-04** Save As drains accepted edits, checks destination, writes through the file service, verifies acknowledgment, transfers document/recovery identity, then retires the draft. Reuse native machinery. “Copy text, open another file, hide the old draft” is not an acceptable production algorithm.

**D-05** Keep the draft recoverable until destination save and recovery migration succeed. Cancel/failure/crash/conflict cannot lose it or leave two silently divergent active copies.

**D-06** Closing tabs/windows preserves recoverable drafts. Discard Draft is explicit, with recovery/undo. Empty never-edited drafts may disappear after close. Never silently expire drafts with content.

**D-07** Restore the last session and positions without adding blank notes on every launch. An explicit OS-opened file takes precedence. Drafts from other windows remain reachable without duplicate ownership.

## 4. Named files and concurrency

**D-08** Open and save without editing is byte-identical: EOL, BOM, final newline, trailing spaces, frontmatter, unknown syntax. Formatting is explicit.

**D-09** Preserve supported encodings. If rich editing cannot safely represent the file, use source/literal mode. Never decode with replacement characters and autosave over the original. Binary detection gives a non-editing notice.

**D-10** Watch only open files and selected folders with correlated/cancelable watchers. A clean external change reloads with source-anchor mapping. A change racing local edits pauses autosave and enters conflict state.

**D-11** Compare baseline/local/disk when available. Default to Compare Changes. Keep Both verifies a new copy before retiring anything. Use File on Disk checkpoints local text first. Explicit overwrite names the affected file and consequence.

**D-12** Rename/move uses native workspace operations so Markdown link updates can participate. No overwrite by default. Test case-only renames, UNC, removable drives, permissions, locks, symlinks, long paths. Failure preserves original identity and text.

**D-13** Autosave requires a matching identity and baseline; it can be disabled. Merely opening a file creates no write. Preserve Markdown trailing spaces and newlines.

**D-14** Do not write through an unresolved alias or silently changed symlink target. Protect the read-to-write race with existing file-service concurrency support and qualify it on supported filesystems.

## 5. Editing and view switching

**D-15** Write and Code share undo/redo. Ctrl+Z after switching reverses the prior logical edit, not a reconstructed document. Multiple cursors belong to Code.

**D-16** Drain accepted edits before switching. Carry model version, mapped source caret, selection, and scroll. Do not lose IME composition, jump to the beginning, or create duplicate tabs.

**D-17** Read rejects mutations from typing, paste, drop, checkboxes, formatting commands, and accessibility actions. Selection/copy/links remain. Enforce read-only at the model boundary.

**D-18** Test IME, accents, emoji, combining characters, Arabic/RTL mixed with English, and screen-reader editing. Do not replace established selection algorithms for visual convenience.

**D-19** Normal paste preserves useful text structure; Paste as Plain Text is reliable. Image paste/drop uses a visible adjacent-assets policy. No default base64 file bloat. Failed asset writes do not insert broken links.

**D-20** Tasks, headings, and search results reference versioned source ranges. A stale outline row cannot edit a different line. Re-resolve navigation when the source changes.

## 6. Markdown fidelity matrix

### Editing feel

Qualify the upstream editor's actual behavior against these expectations before writing bespoke handlers:

- Enter continues an existing list at the current nesting level; a new task starts unchecked. Enter on an empty list item exits one level. Backspace at a boundary has an undoable, predictable result.
- Heading/paragraph transitions, paired markers, paste, and formatting stay source-backed. A format command changes the selected region, not unrelated whitespace or the whole file.
- Plain-text paste is always available. Pasting text into a code fence stays literal. A URL paste does not fetch its destination or generate a preview.
- Tab/Shift+Tab indentation must coexist with upstream Tab Moves Focus mode and an accessible way to leave the editor. No keyboard trap is acceptable.
- Formatting shortcuts apply only to focused editable prose; Code preserves its coding bindings. Menu labels show the effective binding in the current view.
- A task toggle is one undoable token edit. Formatting and Replace All create coherent undo steps. Search navigation and mode switches do not create text edits.
- Rich editing must preserve selection direction, grapheme boundaries, composition state, and clipboard behavior. If the engine cannot meet the safety contract, fall back visibly to source for that construct.

| Construct | Write / Read | Preservation / fallback |
| --- | --- | --- |
| ATX/setext headings | Render, edit, navigate | Preserve heading style unless directly edited |
| Paragraphs/emphasis/strong/strike/inline code | Readable editing | Source-backed delimiters and escape tests |
| Nested/ordered/unordered lists, quotes | Render/edit | Preserve numbers, indent, blank lines |
| Tasks | Write toggles, Read inert | Change checkbox token only |
| Tables | Supported structures editable | Irregular structures stay in source blocks |
| Fenced/indented code | Literal, copyable, highlighted | Never execute; preserve fences/info strings |
| Standard/relative/reference links/images | Host-mediated navigation | Preserve escaped destinations and definitions |
| Frontmatter | Collapsible metadata/source | Never implicitly parse-and-reserialize or execute YAML tags |
| HTML | Safe representation | Exact stored source; no scripts/arbitrary iframes |
| Footnotes | Qualify upstream support | If unsupported, retain source and offer Code |
| Math/Mermaid | Safe local upstream render if qualified | Time/size limits; otherwise untouched source |
| Wiki links/callouts/MDX | Literal/source fallback v1 | No untested Obsidian or MDX compatibility claims |
| Unknown syntax | Exact source fallback | Never discard unsupported regions on save |

Compare bytes in round-trip tests, not just rendered HTML. A new exported file may normalize according to its explicit export contract; source saves cannot.

## 7. Recovery and history

**D-21** Base recovery on working-copy backup/hot-exit. Test killed renderer/extension host/main process, restart, low disk, interrupted Save As. Recovery identifies original files, drafts, and conflicts by path and time.

**D-22** Initial target: checkpoint ordinary typing within 500 ms; flush/join before normal close. Power-loss durability requires filesystem write/flush evidence. Record the measured loss window in crash tests rather than promising zero loss without proof.

**D-23** History is separate from current recovery. Proposed defaults: 30 days, 100 revisions/file, 512 MiB total; measure before finalizing. Evict only historical revisions, never live drafts or unresolved/pinned recovery copies. Retention is visible in settings.

**D-24** If text cannot be protected, present Retry, Save a Copy, Copy Text, and explicit Discard before normal close. Do not report a successful save or trap the user in an unclosable window.

## 8. Search and derived state

**D-25** Local lexical search only. Scope is explicit. Skip ignored/binary/generated/oversized content with an honest scope notice. Support cancellation; stale queries cannot replace newer results.

**D-26** Results show filename/path/context. Unsaved buffers supersede older disk content. Rename/delete invalidates results. Duplicate titles are disambiguated.

**D-27** Prose counts are deterministic; label estimates where segmentation is uncertain. Reading time is an estimate. No AI language detection dependency.

**D-28** Indexes can be deleted/rebuilt without losing notes. Never inject derived metadata into source files.

## 9. Size limits

Start rich Markdown qualification below 1 MiB and 20,000 lines, then adjust to measurements. Size is not the only cost: pathological syntax needs parser/time budgets. Route unsuitable files to Code before freezing. Use Monaco's existing large-file protections. Never truncate content; explain the view limitation and preserve the complete file.

# Screens, states, and interaction map

Twenty specified surfaces/states. Most are states of one window, not separate application pages. Native file dialogs stay native. Never turn this list into twenty routes, dashboards, or onboarding steps.

## Window anatomy

1. Native-compatible title bar with Windows controls at the right. Drag, resize, snap, Alt+Space, and double-click maximize work.
2. Optional left shelf, 236 px initial width, resizable 200–360 px.
3. Document toolbar: shelf toggle, filename/location, Write / Read / Code when applicable, document actions.
4. Document surface: one bounded reading column; source view uses the available editor width.
5. Optional On This Page region within the shelf. Do not show both a permanent file shelf and permanent right inspector in the default layout.
6. Quiet document footer: honest save state at left, optional word/read-time information at right. Coding status appears when coding tools are enabled.

No fake traffic lights on Windows. No persistent account slot, chat slot, assistant placeholder, welcome billboard, empty tab row, minimap, or giant command box.

## S01 — First launch / blank draft

Purpose: begin writing. Shelf closed initially; a small recognizable Tacet mark remains. Toolbar has a draft title and accessible New/Open actions. White content area with a caret and `Start writing.` placeholder at the document origin; no centered motivational quote. Placeholder is not part of the file and disappears on input.

Focus lands in the document after startup. Ctrl+N, Ctrl+O, Ctrl+S, Escape, and Alt menu work. If draft storage fails, expose the failure before implying recovery. Acceptance: type immediately, close/reopen, recover the text; no sample note appears in a real first-run profile.

## S02 — Markdown Write

Purpose: compose and revise. Document content has readable headings, lists, code blocks, and task controls. Toolbar is stable, filename distinguishable from a heading, path available without opening settings. Typographic controls appear on selection or through normal shortcuts; no always-visible ribbon.

Visible state includes `Edited`, `Saved in Drafts`, or `Saved`. Newline and caret placement remain predictable. No formatting toolbar overlaps selected text. Acceptance: edit heading/body/task/code fence, undo each, save/reopen byte-correctly. Rich editing cannot silently normalize untouched text.

## S03 — Read

Purpose: consume without changing anything. Same document/scroll anchor, Read selected. Insertion caret and editing affordances disappear. Links, select/copy, find, print, and outline remain. Checkboxes are informative and cannot toggle, including through keyboard or screen-reader actions.

The footer says `Read only` as a mode indicator, separate from saved state. Selecting Write restores editing if the file allows it. Acceptance: every mutation path is blocked and source bytes remain unchanged after extensive navigation.

## S04 — Code

Purpose: inspect/edit exact source. Monaco, monospace, line numbers, horizontal scrolling when wrapping is off, encoding/EOL discoverability. Same document and undo chain. Switching to Code does not automatically open a terminal or source-control sidebar.

Use the normal editor tooltips, find, selection, context menu, multi-cursor, folding, and diagnostics. Acceptance: selection from Write maps to source, edit, switch back, undo; no duplicate document or lost line breaks.

## S05 — Literal text

Purpose: replace basic notepad usage. `.txt` remains literal. A line beginning `#` is text. Wrap on, readable system font, no Markdown tasks or heading interpretation. Read is literal read-only text. Code exposes whitespace/EOL/encoding when wanted.

Acceptance: open a log, shopping list, pasted URL list, and configuration excerpt. No automatic extension change or source transformation. Large text follows the large-file route.

## S06 — Files shelf / open documents

Purpose: orient without turning the app into a library. Three possible sections: Drafts, Recent Files, Folders. Empty sections vanish. Open Documents is available from the title/switcher, without repeating the full same list in multiple regions.

Rows: small outline icon, readable title, filename/path when needed. Selection is pale blue. Hover reveals at most one overflow button. Context menu includes Rename, Show in Explorer, Remove from Recent; permanent deletion is not a shelf shortcut. Missing file gets Locate/Remove. Keyboard arrows/Home/End/type-ahead and Enter work.

Acceptance: two files with identical titles remain distinguishable; moved file remains actionable; removing history cannot delete source.

## S07 — Find a file

Purpose: open something quickly. Ctrl+P opens a compact palette anchored in the top third, width max 640 px. Query is focused; scope names Drafts/Recent/current folder. Result rows show filename/path and optional first-line context. Arrow keys select, Enter opens, Escape restores prior focus.

Empty query shows recent results; no matches says `No files match “…”` with Change Scope, not an unrelated creation prompt. Indexing shows a quiet progress label and results already available. Acceptance: cancel/fast typing cannot surface stale results.

## S08 — Search contents

Purpose: find a passage across files. Ctrl+Shift+F uses the selected scope; a clear scope control is always visible. Results contain real snippets with literal query highlighting, grouped by file only when helpful. Counts include any exclusions.

Click opens the match and preserves a route back to results. Match offsets update if the document changes. Search unsaved buffers. Acceptance: an ignored directory is not crawled; a matching draft is found; canceled queries stop work.

## S09 — Find and replace in document

Purpose: precise editing. Ctrl+F uses familiar compact find UI; Ctrl+H exposes replace in Write/Code, disabled in Read. Preserve standard case/whole-word/regex controls at a secondary level. Replace All is one undoable transaction and reports its count.

Acceptance: no replacement in Read, visible result highlight maps to source, Escape returns to the previous caret, invalid regex is explained inline.

## S10 — On This Page

Purpose: navigate structure and act on existing tasks. Toggle through the toolbar or menu. Heading hierarchy is indented sparingly, active section subtly emphasized. Tasks form a small optional section with completion state and a jump-to-source action. No task creation database.

On narrow windows this replaces shelf content or becomes a dismissible overlay, not an additional column. Empty state: `Add a heading to see an outline.` Acceptance: fences/frontmatter do not create fake headings/tasks; stale references are safely refreshed.

## S11 — Folder and coding tools

Purpose: grow into a project. Explicit Coding Tools reveals familiar Explorer/search/SCM/run/terminal surfaces and status information. Writing colors and typography remain coherent. Commands remain accessible even when their panel is hidden. Trust is requested at the operation that needs execution, not before reading a note.

Turning tools off restores the writing layout and keeps running tasks understandable. Do not kill a terminal as a side effect of hiding it. Acceptance: run a harmless local command in a test folder, inspect Git, switch back to writing, return to the same terminal; zero AI entry points.

## S12 — Draft Save As

Purpose: choose an ordinary file location. Native Windows dialog, suggested filename, extension appropriate to the document. Existing destination uses a real overwrite confirmation. Cancel is harmless. Successful save returns to the same content and position, with file location reflected in the toolbar.

Acceptance: rapid last keystroke before Save As is included; cancel/denied path/disconnected drive/collision never loses the draft. No duplicate independently active copy after success.

## S13 — External change / compare

Purpose: preserve competing edits. Inline notice `This file changed outside Tacet.` with Compare Changes, Keep Both Copies, and Use File on Disk. Autosave is paused. Compare uses native diff with clear labels and filenames/timestamps, not decorative red/green paragraphs.

On a narrow window use inline diff. All decisions remain keyboard accessible. Overwrite is a secondary explicit action naming its consequence. Acceptance: local version is recoverable after choosing disk, and Keep Both creates a verified separate file.

## S14 — Recovery after interruption

Purpose: return safely. Only show a recovery surface when a real recovery event exists. Simple list of recovered documents with title, original path, recovered timestamp, and reason. Main action `Open Recovered Files`; per-entry Compare when original differs.

Do not label recovered text “saved to original.” Do not force bulk discard. Acceptance: recovery works without network, handles duplicate names, survives a second crash, and does not erase dismissed entries automatically.

## S15 — Read-only / save failure / missing file

Purpose: provide an honest route forward. Reuse one compact notice pattern with concrete messages: `This file is read-only.`, `Couldn’t save to this folder.`, `This file is no longer available.` Actions depend on the actual error: Save a Copy, Retry, Locate, Copy Text.

Avoid generic toast-only failure and repeated modal loops. Editing text remains visible. Acceptance: failure can be reached and recovered with keyboard; user can copy/export text when storage fails.

## S16 — Large / unsupported / binary file

Purpose: remain responsive. Explain `This file is too large for Write view. Open it in Code.` with its actual size; offer source mode. Binary file notice does not decode-and-display corrupted text. Unsupported Markdown regions remain source-backed and visibly accessible.

Acceptance: malformed Markdown cannot freeze the shell; no source truncation, mutation, or implicit conversion. File dimensions and thresholds are factual, not vague error messages.

## S17 — Settings

Purpose: change a few meaningful defaults. A restrained settings editor with sections Appearance, Editing, Files & Recovery, and Coding Tools. Include text size, line width, wrapping, autosave, history retention/location, file-association help, and keyboard shortcuts. Advanced settings retain upstream search for non-AI controls.

No account pane, AI toggle, subscription panel, or unused network settings. Explain recovery retention beside the control. Changes apply predictably with undo/reset for settings. Acceptance: 200% scaling fits; settings cannot re-enable removed features.

## S18 — Print / PDF

Purpose: produce a readable artifact. Native print preview/dialog. Hide app chrome; retain headings, lists, links, tables, and readable code. Long lines wrap sensibly, tables do not vanish, page breaks do not isolate headings. Printing never edits the source.

Export to PDF uses the local native print path. Other export formats are outside v1. Acceptance: PDF opens correctly, contains selectable text and sensible pagination, and offline printing works.

## S19 — Compact window

Purpose: useful beside another app. Test widths 960, 720, 600, and 480 CSS px. Below 960 collapse optional secondary content; below 720 make shelf an overlay and shorten location; below 600 keep all essential actions accessible through overflow. Preserve title, mode, typing area, save state.

Minimum proposed desktop size: 480×360 logical px. At 200% text scaling, prefer scroll over clipped/unreachable controls. No automatic source truncation or hidden save error. This is desktop responsiveness, not a promise of a mobile app.

## S20 — About / updates / support evidence

Purpose: communicate exact identity. Product version, upstream version/commit, license notices, local data location, keyboard guide, and explicit Check for Updates when update infrastructure exists. A development build must say development build; an unavailable updater must not look functional.

Export Diagnostics previews/sanitizes local paths and content before creating a file. No automatic uploading. Acceptance: app identity, installer identity, and source receipt agree; updates never overwrite user files or import another VS Code profile.

## Shared interaction rules

### Keyboard map

| Binding | Tacet behavior | Context |
| --- | --- | --- |
| Ctrl+N / Ctrl+O | New draft / native Open | Window |
| Ctrl+S / Ctrl+Shift+S | Save / Save As | Current document |
| Ctrl+P / Ctrl+Shift+P | File finder / conventional command palette | Window |
| Ctrl+F / Ctrl+H | Find / replace in this document | Replace unavailable in Read |
| Ctrl+Shift+F | Search content in the explicit scope | Window |
| Ctrl+Tab / Ctrl+Shift+Tab | Next / previous open document | Preserve upstream switcher behavior |
| Ctrl+Z / Ctrl+Y | Undo / redo | Shared document history |
| Ctrl+B / Ctrl+I | Bold / italic | Focused editable Markdown Write only; otherwise existing upstream bindings |
| Ctrl+Alt+B | Toggle file shelf | Stable alternative independent of prose focus |
| Ctrl+Alt+1 / 2 / 3 | Write / Read / Code | Supported document modes; audit conflicts before registering |
| Ctrl+wheel | Adjust document text size | When pointer is over a document and text zoom is enabled |
| Escape | Close foreground palette/overlay, restore focus | Never discard a document |

Preserve platform-reserved bindings and allow user remapping. Audit upstream default conflicts explicitly; scope overrides with document mode and text focus. A shortcut must not trigger both formatting and a workbench action. The browser study implements only a subset, listed in its README.

- Every popover returns focus to its trigger; Escape closes the foremost dismissible surface.
- Buttons have tooltips/accessibility names. Icon-only controls need discoverable keyboard paths.
- Segmented modes use buttons with pressed state and arrow-key navigation; never communicate only with color.
- No animation gates input. Reduced motion preserves feedback without spatial motion.
- Dangerous actions cannot be adjacent unlabeled icons; default dialog focus favors preservation.
- Screen-reader announcements describe meaningful saves/errors, not every character or count update.
- The browser prototype is an interaction study with sample data. Its OS dialogs/window controls and native file safety are not evidence for these acceptance gates.

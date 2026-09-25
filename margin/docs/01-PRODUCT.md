# Product requirements

Status: v1 build contract. Working name: Margin. Naming and trademark clearance remain a release task.

## 1. The product

Margin makes opening, reading, editing, and finding a text file feel as natural as using a notepad. It is a real Code OSS fork with a considered document interface. Open an arbitrary `.md` or `.txt` from Explorer without creating a project, importing a library, granting execution trust, installing an extension, or making an account.

The useful proposition is **a note can become a working document without moving into another app**. A paragraph can gain headings, checklists, links, tables, or code; its file remains accessible to other editors. When a task needs a terminal, Git, or source editing, those tools appear in the same window.

Adoption must come from writing quality and trust. Removing AI is a firm constraint; it is insufficient differentiation by itself. Attractive chrome is insufficient if saving, search, or text selection behaves unexpectedly.

## 2. People and situations

| Person | Immediate job | Typical material | Friction to investigate |
| --- | --- | --- | --- |
| Everyday file user | Jot something down, reopen a list | Scratch text, instructions, lists | Choosing a folder too early; forgotten untitled windows |
| Markdown reader | Read and correct a received document | README, guide, research notes | Syntax noise, split previews, developer chrome |
| Independent maker | Work across notes and a small code folder | Requirements, changelog, scripts | Moving between a notes database and an editor |
| Deliberate writer | Organize a substantial draft | Headings, quotes, links, tables | Formatting surprises, weak navigation, losing work |
| Person receiving generated files | Inspect and revise Markdown | Plans, reports, agent output | Length, duplication, unfamiliar structure |

The last situation does not imply adding AI. These are ordinary files. Margin neither executes instructions inside them nor contacts the system that produced them.

Primary v1 audience: Windows users who repeatedly open loose Markdown/text files and want a calmer editor. Knowledge-base enthusiasts and professional IDE users are secondary. Their advanced workflows must not crowd the first note.

## 3. Distinctive experience

**P-01 Capture before organization.** Launch into the last active document, or a blank draft on first launch. Typing is immediately available. Drafts have stable local identities and real recovery storage. Ctrl+S on a draft asks where its ordinary file belongs, suggesting a safe title. First launch contains no onboarding carousel, dashboard, sample document, or signup.

**P-02 One file, three views.** Write is readable Markdown editing. Read prevents edits and uses comfortable document typography. Code exposes exact source through Monaco. Switching preserves the text version, caret/anchor, undo history, and dirty state. Switching is never a save or reformat. For `.txt`, Write and Read remain literal text; do not interpret `#` or `*`. Programming files open in Code and do not show unsuitable modes.

**P-03 Navigation that understands the document.** Optional On This Page contains headings and tasks already present in the file. A heading goes to its source location; a task toggle in Write changes its checkbox token. Read makes tasks inert. No parallel task database, project management, or gamification.

**P-04 Find a passage and return to it.** Ctrl+P finds files in recent files, drafts, and the explicitly opened folder. Ctrl+Shift+F searches content in a visible selected scope. Show filename, matching passage, and path before opening at the match. No semantic embeddings, online search, or home-directory crawling.

**P-05 Files remain useful outside Margin.** Opening a folder creates no vault or metadata directory there. Notes stay normal files. IDs, view state, drafts, indexes, and history live in the app profile. Local links work. Unsupported markup has a safe path to source editing.

**P-06 Coding is an intentional expansion.** Code view does not automatically expose the full IDE. Coding Tools reveals Explorer, search, source control, terminal, debugging, and ordinary language tools. Turning it off restores the writing layout. No AI is enabled with it. Preserve established shortcuts where they do not conflict with notes behavior.

## 4. Scope

| Must ship in v1 | After v1 proves the core | Excluded |
| --- | --- | --- |
| Open/save/save as/new, multi-file sessions, drag/drop | Opt-in global quick capture | Accounts, subscriptions, cloud storage backend |
| Local drafts and crash recovery | Folder backlinks | Chat, agents, prompts, providers, MCP |
| Write/Read/Code, literal text | Extract selection into a linked note | Social feed, comments, collaboration |
| Headings, lists, tasks, links, images, tables, fences | Opt-in wiki-link compatibility | Graph home screen, mandatory tags or journals |
| Syntax-preserving fallback | Extra export adapters | Generation, rewriting, semantic indexing |
| Find/replace, quick open, scoped search | Local dictionary spelling, after implementation audit | Arbitrary plugins as a consumer prerequisite |
| Local history, compare, external-change handling | macOS/Linux qualification | New language runtimes/package managers |
| White identity, high contrast, keyboard access | Deliberately designed dark theme | Database, calendar, kanban |
| Coding tools and built-in language support | Reviewed conventional extension catalog | Streaks, writing scores, chat bubbles |
| Native print/PDF | Templates justified by usage | Marketing site before desktop correctness |

Math and Mermaid exist upstream. Preserve and qualify safe local rendering where possible; otherwise show intact source. Do not delay core correctness to invent renderers. The detailed syntax matrix is in the document contract.

## 5. File and folder behavior

- A single file opens without project selection. Several files have a compact Open Documents switcher and keyboard cycling. The default single-document view has no empty tab strip. A tab strip is an optional preference.
- Opening the same canonical file reveals its existing document. Distinct files remain distinct; filesystem semantics govern case handling.
- Opening a folder is explicit. It becomes a scoped file source, not an import/conversion destination. Do not move files.
- Recent entries show useful titles and actual filenames when different. Missing files remain visibly unavailable with Locate and Remove from Recent. Removing a shelf entry never deletes a file.
- Drafts, saved files, and folders occupy distinct sections. Display titles never silently rename files.
- Windows default file associations require explicit user choice. Open With works independently.
- No global hotkey, background resident process, startup-at-login, or default-app takeover on first launch.

## 6. Quality and validation

### Initial defaults

| Choice | v1 default | Reason |
| --- | --- | --- |
| New note | Markdown draft in Write | Useful structure is available without a naming decision |
| Received `.md` | Write, unless read-only capability or an explicit Open in Read action applies | The product remains an editor; subsequent mode is remembered per resource |
| Received `.txt` | Literal Write | Preserve Notepad expectations |
| Named-file autosave | Off; explicit Ctrl+S, with background recovery still active | The user controls changes to arbitrary existing files |
| Draft/current recovery | Automatic; measured checkpoint target in the document contract | Closing a scratch note should not require filing it |
| White appearance | Default; system high contrast overrides it | Identity and readability are both required |
| File shelf | First blank launch closed; otherwise visible at ordinary desktop width, remembered and collapsible | Files are accessible without making a folder mandatory |
| Extra chrome | Tabs, minimap, breadcrumbs, line numbers, coding panels hidden for a single prose document | Focus stays on writing; Code uses its appropriate conventions |
| Document fonts | Platform sans serif for prose; platform monospace for Code | Good Windows text rendering without downloaded fonts |
| Network | No unsolicited requests for the local notes workflow | Opening a file does not contact a service |

Enabling named-file autosave is an explicit preference. It never weakens conflict detection, recovery, or honest status. Draft recovery and saving a named file are separate settings and concepts.

Time to writing: launch/open ends with an available caret. Comprehension: the user knows what is open, where it lives, whether it is safe, and whether it is editable. Trust: no surprise overwrites, no opaque database lock-in, no lossy rewrites. Taste: the visual system stays coherent with one note or a code folder open.

The first demonstration includes a blank note, messy real README, `.txt`, long document, external edit, and narrow window. A pristine article alone is insufficient.

Observe 5–8 Windows users, including at least two who rarely use IDEs. Use low-risk files with permission. Do not record private content by default. Tasks: capture without choosing a location, save as a file, reopen received Markdown, change a task, find a phrase, inspect source, resolve an external edit, enable a terminal, return to writing. Ask users to explain where their note lives.

Initial usability gate: at least 4/5 complete open/write/save/find without coaching, no observed mistaken overwrite, and everyone can locate the saved file. This small sample informs usability, not market-size claims. Fix confusing labels before adding features.

## 7. Decision rules

1. Reuse upstream document machinery before inventing storage or editing algorithms.
2. Prefer one obvious action to synonymous controls.
3. Preserve text before improving appearance.
4. A useful failure state is part of the feature.
5. AI runtimes or content uploads are outside this product.
6. Complete a vertical slice before widening UI coverage.
7. Require a user job and acceptance test for additions.

Success is a qualified desktop fork. Concept art, a prototype, a VS Code extension, or a collection of settings does not fulfill that requirement.

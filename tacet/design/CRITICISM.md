# Tacet criticism dossier: Notepad, VS Code, Markdown on Windows, terminals

Status: research input, 2026-09-27. Owner: tacet/design. Not authoritative. `SHIP-PLAN.md` and `docs/10-REBUILD.md` win until the coordinator accepts a change listed in §8.
Brief (owner, 2026-09-27): "remember the criticism — people want a way to open the MD and such and find it. Really think about how people are viewing terminal, Notepad, VS Code and the evolution; dig deep into criticism."

## 0. Evidence rules and limits

- Every quote is copied from the linked source. Hacker News quotes come from the Algolia HN API (`hn.algolia.com/api/v1/items/<id>`), with author, date and a permalink. GitHub data comes from the GitHub API through `gh`, fetched 2026-09-27.
- **Inference** marks a conclusion that is my reading of the evidence, not a sourced fact.
- **Limits of this pass.** Reddit blocked every access path: the gstack browser got HTTP 403 ("You've been blocked by network security"), `reddit.com/*.json` returned an HTML wall, and the Pushshift mirror returned "Rate limit exceeded". Reddit opinion therefore appears only where the press quotes it. TechRadar, gHacks, TechPowerUp and WindowsForum article bodies returned 403 or truncated pages. Where I cite them, the claim comes from the search-result summary and is marked **(summary only)**. Windows Insider Feedback Hub is not public on the web, so it is not covered.
- Two numbers carry a lot of weight here. Both are from `obsidianmd/obsidian-releases/community-plugin-stats.json`, fetched 2026-09-27. Among the 8,137 Obsidian community plugins, the rankings are: Git #6 (3,206,850 downloads), Omnisearch #16 (1,934,411), Recent Files #23 (1,199,284), Terminal #64 (432,219), Shell commands #199 (95,947) and Open in Terminal #417 (37,177). The AI plugins "Claudian" (#11) and "Copilot" (#13) also rank high. People who choose a notes app with plugins do want AI. Tacet does not serve those people, and it should not pretend that nobody wants AI.

---

## 1. Notepad, 2018–2026

### 1.1 What changed (dated)

| Date | Change | Source |
| --- | --- | --- |
| 2023-08-31 | Session state: "close Notepad without any interrupting dialogs and then pick up where you left off… Saved session state does not impact any of your files" | [Windows Insider blog](https://blogs.windows.com/windows-insider/2023/08/31/new-updates-for-snipping-tool-and-notepad-for-windows-insiders/) |
| 2024-07 | Spellcheck and autocorrect for all Windows 11 users, both on by default | [BleepingComputer](https://www.bleepingcomputer.com/news/microsoft/notepad-finally-gets-spellcheck-autocorrect-for-all-windows-11-users/), [Tom's Hardware](https://www.tomshardware.com/software/after-41-years-microsoft-quietly-adds-spellchecking-and-autocorrect-to-windows-notepad) |
| 2025-05-23 | Copilot "Write". A Microsoft account sign-in is required. | [The Register](https://www.theregister.com/2025/05/23/microsoft_ai_notepad) |
| 2025-05-30 | Lightweight Markdown formatting. A formatted/syntax toggle sits in the status bar. Formatting can be turned off. | [Windows Insider blog](https://blogs.windows.com/windows-insider/2025/05/30/text-formatting-in-notepad-begin-rolling-out-to-windows-insiders/) |
| 2025-09-18 | Summarize/Write/Rewrite run on-device on Copilot+ PCs. Other PCs need a subscription. | [The Register](https://www.theregister.com/2025/09/18/got_a_copilot_pc_now/), [BleepingComputer](https://www.bleepingcomputer.com/news/microsoft/notepad-gets-free-ai-features-on-copilot-plus-pcs-with-windows-11/) |
| 2025-11 → 2026-01 | Tables, then strikethrough, nested lists, and a welcome dialog | [blog 2026-01-21](https://blogs.windows.com/windows-insider/2026/01/21/notepad-and-paint-updates-begin-rolling-out-to-windows-insiders/) |
| 2026-02-10 | **CVE-2026-20841 (CVSS 8.8)**: a crafted Markdown link could "launch unverified protocols that load and execute remote files" with no warning | [ZDI](https://www.zerodayinitiative.com/blog/2026/2/19/cve-2026-20841-arbitrary-code-execution-in-the-windows-notepad), [The Register](https://www.theregister.com/2026/02/11/notepad_rce_flaw/), [BleepingComputer](https://www.bleepingcomputer.com/news/microsoft/windows-11-notepad-flaw-let-files-execute-silently-via-markdown-links/) |
| 2026-02-19 | Image support in testing | [Windows Latest](https://www.windowslatest.com/2026/02/19/exclusive-microsoft-is-adding-image-support-to-notepad-on-windows-11/) |
| 2026-03-20 | Microsoft commits to cutting "unnecessary Copilot entry points" in Notepad, Photos, Widgets and Snipping Tool | [TechCrunch](https://techcrunch.com/2026/03/20/microsoft-rolls-back-some-of-its-copilot-ai-bloat-on-windows) |
| 2026-04 | Copilot button removed. The features stay under the new name "Writing tools". | [TechPowerUp](https://www.techpowerup.com/348135/microsoft-starts-removing-copilot-from-notepad-snipping-tool-and-more-in-windows-11), [HN 47750899](https://news.ycombinator.com/item?id=47750899) **(summary only)** |
| 2026-06-24, 2026-07-24 | Both release notes lead with "Improved launch performance" | [Notepad release notes](https://learn.microsoft.com/en-us/windows-insider/release-notes/apps/notepad) |

### 1.2 Top complaints

1. **It stopped being the dumb, always-there utility.**
   - "Notepad is supposed to be a bare bones editor -- where you go when everything else fails. The VI of Windows." ([hliyan, HN, 2026-02-25](https://news.ycombinator.com/item?id=47154399))
   - "Just leave my dumb featureless utility alone." ([Someone1234, 2026-02-25](https://news.ycombinator.com/item?id=47158699))
   - "I've spent a long time building up my muscle memory. I don't want my tools changing out from under me." ([EvanAnderson, 2026-02-25](https://news.ycombinator.com/item?id=47157725))
2. **AI and sign-in were pushed into a core app, then only renamed.**
   - The Register: "It is unclear who asked for this, or why Microsoft thinks users of a once-simple text editor require this assistance." ([2025-05-23](https://www.theregister.com/2025/05/23/microsoft_ai_notepad))
   - Reddit users called the April 2026 change "still Copilot, just in disguise" and "less like removal and more like rebranding to reduce backlash". These quotes come through press coverage surfaced by search (**summary only**; the exact article was not verified). Related coverage: [Tom's Guide](https://www.tomsguide.com/computing/windows-operating-systems/microsoft-starts-removing-copilot-from-windows-11-im-saying-that-sarcastically-because-its-clearly-just-lip-service), [TechRadar](https://www.techradar.com/computing/windows/microsoft-has-begun-stripping-out-ai-from-windows-11-but-its-already-being-criticized-for-not-going-far-enough).
3. **On-by-default features.**
   - "What happened to 'just enable X if you need it'? Why are we always okay with every new thing being enabled by default?" ([Thanemate, 2026-02-25](https://news.ycombinator.com/item?id=47154928))
   - "Defaults should not be offensive. If you try to kill me with papercuts, I will stop using your software and never look back." ([bigyabai](https://news.ycombinator.com/item?id=47154822))
4. **Rendering hides the characters.**
   - "When I open notepad, I still want to see the characters that are present. Heck, I'd like to be able to see the difference between a space and a tab… which type of line ending are being used." ([cogman10, 2026-02-25](https://news.ycombinator.com/item?id=47157620))
   - "Apps like classic notepad are useful to have around, when apps that try to parse things like markdown get it wrong and the underlying file needs to be fixed." ([al_borland, 2026-02-26](https://news.ycombinator.com/item?id=47160432))
   - Notepad is also used to strip formatting from pasted text: "Notepad rendering other formats removes one of the specific reasons I use notepad: to strip the stupid formatting." ([BLKNSLVR, 2026-02-11](https://news.ycombinator.com/item?id=46973658))
5. **Features created an attack surface.**
   - "Does this text editor need a network-aware rendering stack?" ([Fiveplus, 2026-02-11](https://news.ycombinator.com/item?id=46972394))
   - "Maybe not allow it to blindly allow every URL scheme known to man. It seems reasonable to limit it to do http/https and MAYBE mailto." ([mrweasel](https://news.ycombinator.com/item?id=46972659))
   - "Notepad is a very trusted application and is often run as Administrator." ([dijit](https://news.ycombinator.com/item?id=46972588))
6. **Tabs and session restore surprised people.**
   - "The default behavior of opening tabs with previously-open files is jarring to me." ([EvanAnderson](https://news.ycombinator.com/item?id=47157725))
   - "I stopped using Notepad since they introduced tabs." ([saturn5k, 2025-06-25](https://news.ycombinator.com/item?id=44375319))
7. **Autocorrect changed files that were not prose.** One user found many corrections in a script file after closing it ([TechRadar, 2024-07](https://www.techradar.com/computing/windows/microsoft-just-gave-notepad-spellcheck-and-autocorrect-but-some-windows-11-users-arent-happy), **summary only**).
8. **The save prompt uses its own format vocabulary.** "After formatting some text, upon saving I was asked if I wanted to save as markdown or plain text… it said I'd lose formatting if I chose plain text." ([sjsdaiuasgdia, HN 44445699, 2025-07](https://news.ycombinator.com/item?id=44445699))
9. **Lost unsaved notes are an old pain.** A 2023 Microsoft Q&A post reads: "I have been working on a project with lots of jottings kept on two separate notepads… I returned to discover that my laptop had restarted." ([Q&A](https://learn.microsoft.com/en-us/answers/questions/4159092/unsaved-notepad-files-disappear-after-windows-11-r)). Later threads report unsaved tabs gone after updates ([Q&A](https://learn.microsoft.com/en-us/answers/questions/3902036/some-how-my-note-tabs-are-gone)).

### 1.3 What people praised or asked for

- **Readable .md is a real need.**
  - "The most popular use of notepad is to read text files quickly and these days that often includes Markdown files." ([dangus, 2026-02-26](https://news.ycombinator.com/item?id=47169860))
  - "Tons of Markdown documents, but almost nothing with which to simply view (not edit) them as intended." ([MoonWalk, 2026-02-25](https://news.ycombinator.com/item?id=47157178))
  - "Thank god notepad is finally useable now." ([alansaber](https://news.ycombinator.com/item?id=47159525))
- **Session restore as a scratchpad.** Before Notepad had it, Notepad++ was loved for exactly this: "Every new tab opens and without needing to be saved is persisted even if computer restarts. That is a perfect scratchpad for ideas." ([grugagag, HN, 2020-07-19](https://news.ycombinator.com/item?id=23889364))
- **A separate app for the rich features.** "Resurrecting Wordpad and making it really cool/useful would make everyone happy. They can add as much AI and Markdown as they want to Wordpad." ([Someone1234](https://news.ycombinator.com/item?id=47158699)). "If they wanted to ship an 'enhanced' notepad they should have called its something else." ([EvanAnderson](https://news.ycombinator.com/item?id=47157725))
- **Small asks.** "Still no line numbers...." ([nichos](https://news.ycombinator.com/item?id=47154399)). Unix line endings, historically: "All we wanted back in the day was Unix line ending support." ([zer0zzz](https://news.ycombinator.com/item?id=47154670))
- **Speed.** Microsoft's own two most recent release notes lead with launch performance (see §1.1).

### 1.4 What this means for Tacet

- **Inference.** Tacet is exactly the "separate app" commenters asked for: formatting and source view in its own app, with Notepad left alone. Say that in copy. Do not position Tacet as "Notepad but better at everything".
- Launch-to-caret speed and stability are the price of entry.
- Every addition is **off by default** unless it protects text. Protecting text covers recovery, and it does not cover autocorrect.
- Source is always one keystroke away. Rendering never hides the bytes without an escape hatch.
- Links are a security boundary. Tacet needs a scheme allowlist and a confirmation before leaving the app (`docs/08-ACCEPTANCE.md` A37 already requires this; CVE-2026-20841 is the proof).
- **Never autocorrect.** Spelling, if Tacet ships it, is squiggles only, in prose only.

---

## 2. VS Code as a note, Markdown and text editor

### 2.1 Top complaints

1. **AI everywhere, and "no" does not stick.**
   - [microsoft/vscode#237819](https://github.com/microsoft/vscode/issues/237819) (2025-01-13, 255 reactions): "Those of us who have already uninstalled Copilot have already said no to Copilot. **We should not have to say no again.**"
   - [#249314](https://github.com/microsoft/vscode/issues/249314) (2025-05-19): "Release after release things keep creeping in… My workplace explicitly forbids the use of AI agents… Please give me a trivial mechanism to 100% disable, in a future-proof way."
   - [#246041](https://github.com/microsoft/vscode/issues/246041) (2025-04-08) asks for one parent switch.
   - [#309947](https://github.com/microsoft/vscode/issues/309947) (2026-04-14): "`chat.disableAIFeatures` is removed from user profile without user approval, re-enabling AI features."
   - The rebrand as "The open source AI code editor" drew this: "For at least a couple of years it's been nothing but AI." ([misnome, HN, 2025-12-27](https://news.ycombinator.com/item?id=46403209))
2. **Chrome comes back after you close it.** "I can't even get visual studio code to stop showing that right-hand sidebar every time it opens up, regardless of what settings I use." ([embedding-shape, 2026-02-25](https://news.ycombinator.com/item?id=47154754))
3. **Weight.**
   - "I'm sorry but you cannot use VS Code and lightweight in the same sentence." ([paxys, 2026-02-25](https://news.ycombinator.com/item?id=47157339))
   - "The binary for 121 is like 50% larger than 120." ([matltc, 2026-06-03](https://news.ycombinator.com/item?id=48379590))
   - Slow startup even with extensions disabled: [#310904](https://github.com/microsoft/vscode/issues/310904) (2026-04-17).
4. **Trust prompts.**
   - "It was so incredibly annoying. Always asking me for my own repos… I ended up disabling it completely." ([perryizgr8, 2024-07-08](https://news.ycombinator.com/item?id=40904297))
   - The team's defence: "It's literally a security warning in a giant modal that forces you to chose." ([Tyriar, VS Code team, 2026-01-22](https://news.ycombinator.com/item?id=46719712))
5. **The preview is not the default and the edit/preview split is awkward.**
   - Setting preview as the default editor for `*.md` failed ([#192954](https://github.com/microsoft/vscode/issues/192954), 2023).
   - Ctrl+Shift+V preview conflicts with terminal paste ([#315461](https://github.com/microsoft/vscode/issues/315461), 2026-05).
   - An Obsidian-style WYSIWYG editor was requested and closed as an "extension candidate" ([#296639](https://github.com/microsoft/vscode/issues/296639), [#296770](https://github.com/microsoft/vscode/issues/296770), 2026-02).
6. **Images and relative paths.**
   - An image-root option for the preview ([#114319](https://github.com/microsoft/vscode/issues/114319), 61 reactions, open since 2021).
   - Preview images do not reload when changed by another tool ([#65258](https://github.com/microsoft/vscode/issues/65258)).
7. **Recent files is folder-centric.**
   - "'File > Open Recent' should also contain files which were recently created and saved" ([#153275](https://github.com/microsoft/vscode/issues/153275)).
   - Pinning in Open Recent ([#163509](https://github.com/microsoft/vscode/issues/163509), open since 2022).
   - Removing dead entries ([#177185](https://github.com/microsoft/vscode/issues/177185), open).
8. **Untitled scratch files nag on Save All** ([#99214](https://github.com/microsoft/vscode/issues/99214), 2020).
9. **Workbench UI text too small, hard to change**: [#519](https://github.com/microsoft/vscode/issues/519), 4,810 reactions, the most-reacted open issue these searches returned (open since 2015).

### 2.2 Why people still use it

- "This is why I use VSCode for notes lol, the built in markdown preview and built in markdown table of contents." ([joshxyz, 2020-12-29](https://news.ycombinator.com/item?id=25567701))
- "My gigantic notes.md file is always open in tab 1… less friction whenever I need to make a note (no need to create and name a new file)." ([hikarudo, 2025-04-13](https://news.ycombinator.com/item?id=43675278))
- "I like the integrated terminal, the directory search feature… the multiselect text editing." ([stult, 2020-09-22](https://news.ycombinator.com/item?id=24553806))
- "Ctrl+Shift+P to find any command, Ctrl+P to open any file in your workspace (no file browser needed)." ([wayneftw, 2019-10-01](https://news.ycombinator.com/item?id=21125003))
- "For open source GUI text editors there sadly aren't many that match the feature and polish of vscode." ([bobajeff, 2025-12-27](https://news.ycombinator.com/item?id=46403706))
- People who left for AI-free builds: "I switched to codium mostly out of purity from AI." ([catapart](https://news.ycombinator.com/item?id=46403281)). VSCodium has 33,429 GitHub stars (fetched 2026-09-27).

### 2.3 What this means for Tacet

- Keep the palette, Ctrl+P, multi-cursor and search.
- AI is absent from the source. It is not a setting. No update can bring it back (A43/A44).
- A closed surface stays closed across launches and updates.
- UI text at Windows body size. REFERENCES-V2 C2 is right, and #519 is the strongest signal in the tracker.
- Recent must include saved-from-draft files, pins and dead-entry handling.
- Never show a trust modal to *read or write a note*. `docs/03-SCREENS.md` already says: "Trust is requested at the operation that needs execution, not before reading a note."

---

## 3. Markdown on Windows: opening, reading, finding

### 3.1 Opening and reading

- **No native viewer until recently.** Stock Windows opens a double-clicked .md as raw text, or asks which app to use. Notepad formatting (2025) covers only part of it. As of 2026, fenced code, task lists, images, blockquotes, math and Mermaid show as plain text ([digitnaut 2026-02](https://www.digitnaut.com/2026/02/does-notepad-have-markdown-mode-guide.html), **summary only**; images are in testing per Windows Latest 2026-02-19).
- **A cottage industry of viewers exists to fill the gap.** MarkView, MDHero ("A Markdown viewer and editor Windows was missing", [HN 49181740](https://news.ycombinator.com/item?id=49181740), 2026-08-05), MarkdownView, mdview ([search roundup](https://macmdviewer.com/blog/markdown-viewer-windows)). Their pitch is the same every time: double-click → GitHub-style render, tables, code highlighting, Mermaid.
- **PowerToys is Microsoft's own conservative precedent.** Its preview pane renders .md with "Show local images… only loads images from the Markdown document's folder tree… Remote and online images remain blocked. This setting is off by default." ([Microsoft Learn, 2026-08-25](https://learn.microsoft.com/en-us/windows/powertoys/file-explorer))
- **Obsidian's biggest gap is loose files.** The feature request "Have Obsidian be the handler of .md files / … files outside vault" has been open since 2020-05-23 ([forum](https://forum.obsidian.md/t/have-obsidian-be-the-handler-of-md-files-add-ability-to-use-obsidian-as-a-markdown-editor-on-files-outside-vault-file-association/314)). A moderator's 2020 answer: "This is not possible… Obsidian is designed as a way of working with multiple markdown files" ([thread](https://forum.obsidian.md/t/opening-markdown-file-without-assigning-it-to-a-vault/9026)). In 2024 users still route files by path with batch scripts: "Loving Obsidian (and Typora for standalone files)" ([mackbird, 2024-10-25](https://forum.obsidian.md/t/have-obsidian-be-the-handler-of-md-files-add-ability-to-use-obsidian-as-a-markdown-editor-on-files-outside-vault-file-association/314/137)).
- **Typora.** Liked as the reader-editor for loose files. It is criticised for hiding syntax and for its license check: "The DRM is the problem" ([josephcsible, 2021-11-27](https://news.ycombinator.com/item?id=29361226)). One user's only must-have is image paste: "the functionality to copy pasted image to a folder - that is the only feature I really like" ([rodneyzeng](https://news.ycombinator.com/item?id=29362442)).
- **MarkText.** Went quiet: "Is MarkText dead? no new version released after 2022" ([marktext#3946](https://github.com/marktext/marktext/issues/3946), 2025-03). Then it shipped v0.19.1 on 2026-06-06 (GitHub API). Users also ask how to open a single file ([#236](https://github.com/marktext/marktext/issues/236)).
- **Zettlr.** "The UI has a few quirks and sometimes does not follow conventions set by other applications." ([zareith, 2024-08-23](https://news.ycombinator.com/item?id=41326193))
- **Markdown as the lingua franca of generated text.**
  - "In a Copilot world, Notepad is now meant to render Copilot output, which LLMs do a good job of spitting out Markdown." ([akgoel](https://news.ycombinator.com/item?id=47157189))
  - "Notepad is traditionally most heavily used to peruse readme files, which today are primarily written in Markdown." ([dangus, 2026-02-27](https://news.ycombinator.com/item?id=47185572))
  - **Inference:** the volume of .md files that people *receive* is rising, which strengthens Tacet's "person receiving generated files" persona in `docs/01-PRODUCT.md` §2.
- **The terminal is converging on Markdown too.** Windows Terminal's spec for "Markdown Notebook Panes" includes: "The user can perform some commandline action (like `wt open README.md`), which opens a new pane in the Terminal, with the markdown file rendered" ([microsoft/terminal#16495](https://github.com/microsoft/terminal/issues/16495)). A Markdown pane is live enough to get bug reports in 2026-09 ([#20703](https://github.com/microsoft/terminal/issues/20703)).

### 3.2 Finding

- **Windows Search is distrusted.**
  - "There's no bigger indictment on the bloat and degradation of quality of Windows than how criminally bad Windows Search is." ([disillusioned, 2024-08-28](https://news.ycombinator.com/item?id=41384912))
  - "Everything + RipGrep is how i search files and file contents on windows." ([smusamashah](https://news.ycombinator.com/item?id=41385660))
  - "Everything hooked into windows powertoys makes it even better." ([nirav72](https://news.ycombinator.com/item?id=41385219))
- **Search is why people digitize notes, and nested structure hides them.**
  - "One day, I got annoyed when I was not able to quickly search an old note as it was nested under some other note." ([akkshu92, 2020-07-19](https://news.ycombinator.com/item?id=23889202))
  - "Ability to do simple text search and go to specific date. Big lifesaver." ([ufmace](https://news.ycombinator.com/item?id=23890343))
- **Obsidian users install finding tools at scale.** Omnisearch (#16, 1.93M downloads) and Recent Files (#23, 1.20M) are plugin-store data (see §0).
- **Plain files are the trust anchor.**
  - "Obsidian uses markdown, that's it. No proprietary database… just a convenient way to manage your notes." ([fyredge, 2026-05-18](https://news.ycombinator.com/item?id=48180710))
  - "You can sync the vault folder with any syncing app for free." ([fwn](https://news.ycombinator.com/item?id=48183743))
- **Unsaved drafts get lost.**
  - Notepad (§1.2 item 9).
  - Notepad++ after updates: "Just updated to 8.7.7, my session is lost… I have the modified files in …\Notepad++\backup\ but I don't know which files the match" ([forum, 2025-02](https://community.notepad-plus-plus.org/topic/26617/just-updated-to-8-7-7-my-session-is-lost)).
  - **Inference:** recovery that exists but cannot be *found or matched to a title* reads as loss to the user.
- **Cloud folders are a trap on Windows.** Windows 11 setup turns on OneDrive folder backup for Documents and Desktop without asking ([Neowin 2024-06](https://www.neowin.net/news/windows-11-is-now-automatically-enabling-onedrive-folder-backup-without-asking-permission/), [The Register 2024-06-26](https://www.theregister.com/2024/06/26/microsoft_makes_onedrive_avoidance_trickier/)). Obsidian users on iCloud report "files missing, or suddenly disappearing as I open them" ([sshine, 2024-08-23](https://news.ycombinator.com/item?id=41326796)).

### 3.3 What this means for Tacet

- Double-clicking a .md must produce a *rendered, readable* page at once, with GitHub-flavoured basics: tables, fenced code with highlighting, task lists, local images, Mermaid (bundled `mermaid-markdown-features` exists in the tree).
- Relative images resolve from the file's own folder, with no folder or workspace step.
- Remote images are blocked until the user asks, as in PowerToys.
- Finding cannot depend on Windows Search. Tacet needs its own recent, pinned, Ctrl+P and scoped content search over folders the user chose.
- Drafts must be findable *by title*, never by opaque file names.
- **Inference:** the notes folder must not silently land in a OneDrive-synced folder.

---

## 4. Terminal

### 4.1 How it is viewed

- **Windows Terminal is broadly welcomed.** It became the Windows 11 default console in 22H2 ([BleepingComputer](https://www.bleepingcomputer.com/news/microsoft/windows-terminal-is-now-the-default-windows-11-22h2-console/)). From its launch: "I've tried many of the other terminal options on Windows… none have been great." ([amanzi, 2019-05-07](https://news.ycombinator.com/item?id=19845187))
- **Microsoft Edit** (2025) is the other half of the story, a terminal editor for "users largely unfamiliar with terminals" ([DrJokepu quoting the README](https://news.ycombinator.com/item?id=44372607)): "It opens incredibly fast compared to everything else I use." ([jsrcout](https://news.ycombinator.com/item?id=47162308)). 14,637 stars (fetched 2026-09-27).
- **The integrated terminal is a core reason people use VS Code**: "A big part of why I like VS Code is the integrated terminal though." ([tracker1, 2024-08-29](https://news.ycombinator.com/item?id=41392074))
- **Notes users want it too, as a minority.**
  - Obsidian's "Terminal" plugin ranks #64 of 8,137 (432k downloads), while Git ranks #6.
  - In 2026, one user left Obsidian because "Terminal plugins were slow and brittle" and they "had already gotten used to harnessing Claude Code" ([bingwu1995, 2026-05-19](https://news.ycombinator.com/item?id=48197942)).
  - **Inference:** in 2026 a terminal next to Markdown is increasingly how people run their *own* CLI tools, including agents, on their notes. `docs/06-NO-AI.md` already says user-run programs are outside the shipped guarantee.
- **No Notepad-class request for a terminal.** In the Notepad threads reviewed, nobody asked for a terminal in a Notepad-class editor. People asked for the opposite, a fast editor *inside* the terminal (Edit).

### 4.2 What this means for Tacet

- Keep the terminal, but as an opt-in tool (FIRST-BOOT Extras row 3 is right).
- It is always reachable from the palette (`Terminal: Toggle`) even when the shortcut is off.
- It never opens on its own, and it survives being hidden (`docs/03-SCREENS.md` already says this).
- **Inference:** it should start in the current file's folder. A notes user expects the terminal to be "here".
- Never run fenced code automatically. A "send to terminal" action is a post-1.0 idea at most, and only as an explicit action (A41).

---

## 5. The evolution and the anti-bloat and trust sentiment

- **The arc.**
  1. Notepad: always there, dumb.
  2. Notepad++ / Notepad2 / Metapad: small upgrades and sessions. "I used to overwrite c:\windows\notepad.exe with Metapad." ([crummy, 2026-02-11](https://news.ycombinator.com/item?id=46972462))
  3. VS Code: a power editor that became the default for text, notes included.
  4. Obsidian and Typora: rendered Markdown and folders of plain files.
  5. 2025–26: AI inserted into all of the above, and terminal agents working on Markdown.
- **The backlash is about placement, not AI as such.** Microsoft's own framing of the rollback: being intentional about "how and where Copilot integrates across Windows" ([TechCrunch 2026-03-20](https://techcrunch.com/2026/03/20/microsoft-rolls-back-some-of-its-copilot-ai-bloat-on-windows)). A Pew figure cited there: half of U.S. adults are more concerned than excited about AI (June 2025).
- **Trust as a feature.**
  - "I believe that not only you should own your data in plain files, but also you should own the software that opens those files." ([zakirullin, Files.md, 2026-05-18](https://news.ycombinator.com/item?id=48180199))
  - "An opensource product is very important for a notes product, where the implications of loosing access to a tool are huge." ([gbro3n](https://news.ycombinator.com/item?id=48182444))
  - Notepad++ lost trust over a supply-chain hijack ([HN 46851548](https://news.ycombinator.com/item?id=46851548), 2026-02-02): "Its programma non grata on my machines at the moment." ([voidfunc](https://news.ycombinator.com/item?id=47157241))
- **A built-in or no-install tool matters for shared PCs.** "When you're using notepad, it's in some situation where you don't want to install another exe." ([roger110](https://news.ycombinator.com/item?id=47161061)). **Inference:** Tacet cannot win that case. It targets people who choose to install an app, so trust must come from signed, auditable releases.

---

## 6. Synthesis (a): OPEN

| Entry | Required behavior |
| --- | --- |
| **Double-click in Explorer** (Tacet is the default) | One running instance. If the file is already open, focus that window and document (`01-PRODUCT` §5). Otherwise open it in the last-used window (Notepad-like). First-boot setup is skipped for this launch (`FIRST-BOOT` §9). Caret at the top, or at the remembered position for a known file. Session restore does not bury it: the OS-opened file is in front (D-07). |
| **Open With → Tacet** (not default) | Same as above. **After** the file is showing, offer one quiet, dismissible line once per extension: `Open .md files with Tacet by default?` → `Open Default Apps` (`ms-settings:defaultapps`). Microsoft's own guidance: "Use contextual prompts when your app opens a file type it supports but is not the default… Avoid aggressive prompts." ([Learn](https://learn.microsoft.com/en-us/windows/apps/develop/windows-integration/default-apps-platform)). Never touch associations programmatically; UCPD blocks it anyway (same source). |
| **Drag onto the window** | Dropping .md/.txt on the title bar, the shelf or an empty page opens the file. Dropping an image into Write inserts it under the assets policy (D-19). Shift+drop of any file inserts a relative link. **Inference:** open-on-drop is the Notepad expectation; insert-on-drop is the Typora expectation, so the modifier decides. |
| **Command line** | `margin <file…>` opens in the existing window. `margin <folder>` adds the folder to Folders and shows it. `margin` alone restores the session. `--new-window`, `--read` (open in Read), `--wait` (for `git commit` and `$EDITOR`), `--goto file:line`. Unicode and space-containing paths (A34). `margin -` reads stdin into a new draft. **Inference:** `code` users bring these reflexes; `--wait` makes Tacet usable as `EDITOR`. |
| **Mode on open** | `.md` opens in **Write**, rendered, editable, caret visible. Not Read, and not source. Reasons: Notepad (the incumbent) opens .md formatted and editable; most users open to read, and Write is readable; named-file autosave is off, so a stray key only shows the dirty dot and Ctrl+Z undoes it. **Exceptions → Read:** a read-only file, a file carrying Mark-of-the-Web (downloaded or attachment; **inference**, following the CVE lesson), and `--read`. `.txt` opens literal. The last mode per file is remembered. |
| **Source access** | `Code` (source) view is **always** available for .md. It is one key (Ctrl+Alt+3) and it appears in the mode picker. Unsupported syntax falls back to source blocks (A15). See §8, contradiction C1. |
| **Rendering on first paint** | Headings, emphasis, lists, task lists, tables, fenced code with highlighting, blockquotes, rules, footnotes (qualify), local images, Mermaid and math (bundled, local, time-boxed). Front matter is a collapsed, literal metadata block, never reserialised (contract §6). |
| **Relative images and links** | Resolve against **the file's folder**, with no workspace needed. Local images load from the file's folder tree, as in PowerToys. Remote images show the guide's `Image not loaded` + `Load` placeholder, per document, remembered (A38). Relative `.md`/`.txt` links open in Tacet, as a new document, keeping Back (Alt+Left). Other local files: **Reveal in File Explorer**, never execute. Web links: `http`/`https`/`mailto` only, with the destination shown before leaving the app. Every other scheme is blocked (A37, CVE-2026-20841). |
| **File outside any folder** | A first-class document, not a degraded "no folder" mode. It lands in Recent. Ctrl+P finds it. Relative links and images work. Content search offers the scope `This file's folder` without adding it to Folders or creating any metadata there (P-05). No workspace-trust prompt, no "Open Folder" suggestion, no restricted-mode banner. |
| **Encoding / EOL honesty** | With no status bar, an unusual file must still say so. For a non-UTF-8 file or mixed EOL, show a one-line note under the title on open, dismissible, and put the same facts in the title menu (`Encoding: UTF-16 LE · CRLF`). **Inference**, from cogman10 and zer0zzz. |

---

## 7. Synthesis (b): FIND

Model: **four places, one switcher, no crawling.** Everything is lexical and local (D-25). Nothing is written into the user's folders.

1. **Drafts.** Every untitled note is a draft with a stable ID and a derived title (D-02). The shelf lists drafts by title and last edit.
   - Closing the window, the app or Windows never loses one (D-06, A11).
   - Discard is explicit and undoable.
   - Draft recovery storage is inspectable: `Show drafts folder` opens a real folder of real `.md` files named by title plus ID. **Inference**, from the Notepad++ "I don't know which files the match" failure: a recovery store the user can open and read in any app is the strongest proof that nothing is lost.
2. **Recent.** Every file opened *or saved* in Tacet, including drafts saved to a file (VS Code #153275). It shows title + filename + folder when they differ (01-PRODUCT §5). Missing files stay, greyed out, with `Locate` / `Remove` (VS Code #177185). Removing an entry never deletes the file (A20).
3. **Pinned.** Pin any document or folder to the top of the shelf and the switcher (VS Code #163509; Obsidian's Recent Files plugin has 1.2M downloads). Not in the current M4 shelf spec: see §8, contradiction C6.
4. **Folders.** Explicitly chosen folders, including the notes folder from first boot. There is no vault: a folder is a scope, not a container.

**Ctrl+P (quick switcher).**
- Scope: Pinned, Drafts, Recent, then files in Folders.
- Matches the title and the filename.
- Rows show the folder path.
- The scope is written in the box (`Drafts, recent and 2 folders`) (A23).
- `#` prefix: jump to a heading in the current document (Code OSS `@` symbol search, relabelled).
- `>`: commands.
- Enter opens and Esc returns.

**Ctrl+Shift+F (search).**
- Lexical content search over a scope the user can see and change: `This document`, `This file's folder`, `Drafts`, `Folders`.
- Results show the file, the passage and the path; opening a result lands on the match (P-04, A24).
- Unsaved edits are searched.

**Jump within a document.**
- Ctrl+Shift+O, or `#` in Ctrl+P: headings.
- Optional On This Page list (P-03).
- Ctrl+F: find in the page, in Write and Read alike.

**Outside Tacet.**
- Saved notes are plain files in plain folders, so Everything, PowerToys Run and Explorer find them.
- Tacet adds **nothing** to the files (D-28).
- **Inference:** a `Copy path` command and `Reveal in File Explorer` in the title menu answer the usability-test question "where does your note live?" (01-PRODUCT §6).

---

## 8. Synthesis (c): the 12 highest-impact requirements for Tacet 1.0

| # | Requirement | Evidence | Milestone | Acceptance check |
| --- | --- | --- | --- | --- |
| R1 | **Double-click .md → rendered, editable page with caret, no setup, no folder, no trust prompt** | §3.1 viewers gap; Obsidian vault thread; VS Code #192954 | M8 (with M6) | Fresh profile: double-click `README.md` from `Downloads\` (plus one Unicode path). Rendered headings, table, code and local image are visible. No first-boot page, no modal. Caret ready ≤ 1.5 s p95 cold, ≤ 300 ms warm (existing budgets). |
| R2 | **Source is always one key away for .md** (Code view never hidden behind an Extras switch) | §1.2 item 4; Typora criticism; Notepad ships a syntax toggle | M6 | With default settings, Ctrl+Alt+3 on any .md shows the exact bytes, and the mode picker lists Code. A15 passes. |
| R3 | **Drafts never lost and always findable by title** | §1.2 item 9; Notepad++ session loss; grugagag | M5 | Kill the main process mid-typing, then reboot: each draft reappears in Drafts under its title, and the text is recovered within the measured window (A11). `Show drafts folder` shows readable `.md` files. |
| R4 | **Links cannot execute** (http/https/mailto only, destination shown; other schemes blocked; local non-text files revealed, not launched) | CVE-2026-20841 | M6 | A36/A37 fixture: `ms-*:`, `file:` .exe, `search-ms:`, `javascript:`, `command:` links do nothing but show a notice. An https link shows its URL before opening. |
| R5 | **Relative images and links work from the file's own folder; remote images blocked until asked** | PowerToys policy; VS Code #114319/#65258 | M6 | A README with `./img/a.png` and `https://…/b.png`: a renders; b shows `Image not loaded · Load`; zero network requests until Load (N-01). A `docs/other.md` link opens in Tacet and Alt+Left returns. |
| R6 | **One quick switcher over pinned, drafts, recent, folders; `#` jumps to headings** | wayneftw; Obsidian Omnisearch/Recent Files downloads | M7 | 1,000-note fixture: Ctrl+P finds a draft by title, a recent loose file, and a folder file ≤ 150 ms. `#` lists headings of the current doc. The scope label is visible (A23). |
| R7 | **Recent that behaves**: includes saved-from-draft files, pinning, missing entries with Locate/Remove | VS Code #153275, #163509, #177185 | M4 (shelf) + M7 | Save a draft as a file → it appears in Recent. Pin it → it heads the shelf and Ctrl+P. Delete it on disk → the row is greyed with Locate/Remove. Remove leaves the disk untouched (A20). |
| R8 | **Scoped content search including "This file's folder" without making a workspace** | Windows Search distrust; Everything+ripgrep | M7 | Open a loose file in `D:\notes\`, Ctrl+Shift+F, scope `This file's folder`: matches with passage and path. Afterwards, `D:\notes\` contains no new files or folders (P-05 audit). |
| R9 | **Every addition off by default; nothing re-enables itself across updates** | Thanemate/bigyabai; VS Code #237819, #309947; sidebar returning | M4 + M10 | Upgrade test (A44) plus a relaunch ×10: extras chosen off stay off. A closed shelf, panel or terminal stays closed. No AI surface appears. |
| R10 | **Honest file facts without a status bar** (dirty dot, save failure, non-UTF-8/EOL notice, read-only, path in the title menu) | cogman10, zer0zzz, nichos; D-08/D-09 | M4 | Open UTF-16 CRLF, read-only, and failing-save fixtures with the status line off: each shows its state in the title or its one-line note. `Copy path` and `Reveal in File Explorer` are in the title menu. |
| R11 | **Windows-native open paths**: single instance, Open With, drag-to-open, `margin` CLI with `--wait`/`--read`/`--goto`, contextual default-app offer | Learn default-apps guidance; `code` CLI habits | M8 | A34 plus: `margin a.md b.txt` opens both in one window. `git -c core.editor="margin --wait" commit` blocks until the tab closes. The default-app offer appears once, after the file shows, and never again after dismissal. |
| R12 | **Launch and typing feel like Notepad**: measured cold start, idle memory, and typing latency on the reference laptop | Notepad's 2026 notes lead with launch performance; paxys; #310904 | M9 | The existing budgets (1.5 s cold p95, ≤ 32 ms input-to-paint, ≤ 350 MiB idle) are measured on a release build and published in release notes. A missed budget is an explicit documented decision, never a quiet test change. |

Also high-value, below the cut:
- Spellcheck as squiggles only, never autocorrect, prose only (M6). Notepad has had it since 2024, so its absence will read as a regression. **Inference.**
- A notes-folder choice that warns when the path is OneDrive-synced (M3).
- The terminal starts in the current file's folder (M4 Code mode).

---

## 9. Synthesis (d): what Tacet must NOT do (the backlash list)

1. No AI entry point of any kind, including a renamed one ("Writing tools" was mocked as "Copilot, just in disguise"). No hidden setting that could re-enable it.
2. No account, sign-in prompt or "sign in to use X", ever.
3. No feature enabled by default that changes text: no autocorrect, no smart quotes (the guide already says off), no auto-format on save, no silent conversion of `.txt` to `.md`, no "save as Markdown or lose formatting" dialog.
4. No link handler that launches arbitrary protocols or local executables.
5. No network fetch on open: no remote images, fonts, link previews, update pings or telemetry without an explicit action (06-NO-AI N-01).
6. No chrome that comes back after the user closed it (the VS Code secondary-sidebar complaint).
7. No trust modal, restricted-mode banner or "Open Folder" push to read or write a note.
8. No vault: never require a folder, never write `.margin/` or metadata into user folders.
9. No lock-in: notes stay plain `.md`/`.txt`; drafts are readable files.
10. No tabs of restored files forced on someone who opened one file (EvanAnderson's "jarring"): an OS-opened file comes first, and the tab strip stays optional (01-PRODUCT §5).
11. No welcome carousel, tips, "What's new" or megaphone icon (Notepad January 2026). No first boot on a file launch.
12. No promotion inside the app, and no messages unrelated to the document (a Notepad++ release-message complaint: "Not in my text editor, that's for sure." [bigstrat2003](https://news.ycombinator.com/item?id=47160258)).
13. No auto-run of fenced code, no terminal that opens itself, no shell started at launch.
14. No silent move of notes into a cloud-synced folder.

---

## 10. Synthesis (e): where the current plan and specs contradict the evidence

| # | Plan/spec says | Evidence says | Proposed resolution |
| --- | --- | --- | --- |
| C1 | `FIRST-BOOT.md` §6 Extras row 4: "`Show Markdown source view`… without it `.md` shows Write and Read only", default **off** | The strongest Notepad complaint is hidden characters (cogman10, al_borland). Notepad itself ships a formatted/syntax toggle. `01-PRODUCT` P-02 promises "one file, three views", and contract §6 / A15 require a source fallback. | Remove row 4. Code view is always available for .md. If the owner wants a quieter picker, move `Code` into the picker's overflow, but keep Ctrl+Alt+3 bound. |
| C2 | `FIRST-BOOT.md` §5 step 3 default: `Notes folder in Documents` | Windows 11 auto-enables OneDrive backup of Documents (Neowin, The Register 2024-06). The "no cloud" promise then breaks silently, and cloud placeholders can make files vanish (sshine). | Detect a Known-Folder-Move/OneDrive path. When found, the row reads `…\OneDrive\Documents\Notes · synced by OneDrive` and offers `%USERPROFILE%\Notes` as a second radio row. Never hide the sync fact. |
| C3 | `SHIP-PLAN.md` one-liner: "a terminal one keystroke away"; `FIRST-BOOT.md` Extras row 3: Ctrl+\` **not bound** by default | Internal inconsistency. The evidence supports the FIRST-BOOT version: terminal demand is real but a minority (Obsidian Terminal #64 vs Git #6), and no Notepad-class user asks for one. | Change the SHIP-PLAN sentence to "a terminal one command away". Keep `Terminal: Toggle` in the palette always. |
| C4 | `SHIP-PLAN.md` removes git and SCM (M1 R1b); `01-PRODUCT.md` P-06, §1 and `06-NO-AI.md` N-06 still list source control and Git as kept; A27 tests Git | Internal inconsistency. The evidence cuts against full removal: Obsidian's Git plugin is #6 of 8,137 (3.2M downloads). Notes users *do* want versioning. | Owner decision stands (git removed). Update 01-PRODUCT, 06-NO-AI N-06 and A27 to match. Make local history (D-23) visible and good, since it is the replacement answer to "undo last week". Record Git as a post-1.0 candidate with this evidence. |
| C5 | `08-ACCEPTANCE.md` A01: "Empty editable draft, **no setup**/account/network dependency" | Conflicts with the M3 first boot (4 steps) now in force. | Rewrite A01: "first launch shows the optional setup; Esc from any step lands in an empty editable draft; a launch with a file argument shows the file and no setup." |
| C6 | M4 shelf = "New note, Search, Drafts, Recent, Folders", with no **Pinned** | VS Code #163509 (open since 2022); Obsidian Recent Files 1.2M downloads; the owner's "find it" brief | Add `Pinned` above Drafts, shown only when something is pinned (so first launch is unchanged). |
| C7 | `FIRST-BOOT.md` §6: "default-app association" dropped to Settings only | Microsoft's guidance recommends a *contextual* prompt when the app opens a type it supports but is not the default | Keep it out of first boot. Add the one-time contextual line from §6 (Open With row). |
| C8 | No status bar by default (owner decision), with save state in the title | Power users want encoding/EOL/line facts (cogman10, zer0zzz, nichos), and contract D-08/D-09 require honesty about encodings | Keep the decision. Add the exception-only note and the title-menu facts (R10). This supports the decision rather than overturning it. |
| C9 | `01-PRODUCT.md` §4: spelling is "after v1" | Notepad has shipped spellcheck to all Windows 11 users since 2024-07. Its *autocorrect* is what drew criticism. | **Inference:** qualify local spelling squiggles for Write prose in 1.0 if they cost little (the guide already reserves "Spelling (when available)"). Never autocorrect. Owner call. |
| C10 | `01-PRODUCT.md` §6: received `.md` → Write "unless read-only capability or explicit Open in Read" | Mostly consistent. The CVE and the "view, not edit" demand argue for one more exception. | Add the Mark-of-the-Web exception: downloaded or attachment .md opens in Read, with a one-line `Downloaded file. Editing is off. Edit` affordance (**inference**). |
| C11 | `REFERENCES-V2.md` §6.2 and `FIRST-BOOT.md` both treat the positioning line vs Notepad as "formatting and no AI" | The loudest demand is not "no AI" alone. It is "leave the simple tool simple, put the features in a *separate* app" (Someone1234, EvanAnderson). `01-PRODUCT` §1 already says removing AI "is insufficient differentiation by itself". | Positioning copy: "Markdown that reads well, source one key away, nothing that changes your text, and no AI." Lead with reading and safety, not with the absence of AI. |

---

## 11. Sources (all accessed 2026-09-27)

HN threads (Algolia API): [47154399](https://news.ycombinator.com/item?id=47154399) Notepad Markdown (2026-02-25); [46971516](https://news.ycombinator.com/item?id=46971516) Notepad RCE (2026-02-11); [44445699](https://news.ycombinator.com/item?id=44445699) Notepad formatting (2025-07-02); [46403073](https://news.ycombinator.com/item?id=46403073) VS Code AI rebrand (2025-12-27); [44372380](https://news.ycombinator.com/item?id=44372380) Microsoft Edit (2025-06-25); [48179677](https://news.ycombinator.com/item?id=48179677) Files.md (2026-05-18); [41337268](https://news.ycombinator.com/item?id=41337268) Everything (2024-08-24); [23888799](https://news.ycombinator.com/item?id=23888799) Tired of note-taking apps (2020-07-19); [29360720](https://news.ycombinator.com/item?id=29360720) Typora 1.0; [41325514](https://news.ycombinator.com/item?id=41325514) Zettlr; [19844678](https://news.ycombinator.com/item?id=19844678) Windows Terminal.
GitHub: microsoft/vscode #519, #65258, #99214, #114319, #153275, #163509, #177185, #192954, #237819, #246041, #249314, #296639, #296770, #309947, #310904, #315461; microsoft/terminal #16495, #20703; marktext/marktext #236, #3946; obsidianmd/obsidian-releases plugin stats.
Microsoft: Windows Insider blog 2023-08-31, 2025-05-30, 2026-01-21; Notepad release notes (Learn, updated 2026-07-24); PowerToys File Explorer add-ons (Learn, 2026-08-25); Windows app defaults platform (Learn, updated 2026-04-04); Q&A 4159092, 3902036.
Press: The Register 2025-05-23, 2025-09-18, 2026-02-11, 2024-06-26; TechCrunch 2026-03-20; ZDI 2026-02-19; BleepingComputer (spellcheck; CVE; 22H2 terminal; Copilot+ Notepad); Windows Latest 2026-02-19; Neowin 2024-06; Tom's Hardware; Tom's Guide; TechRadar, TechPowerUp, gHacks, WindowsForum (summary only, bodies blocked).
Forums: Obsidian forum threads 314 and 9026; Notepad++ Community topic 26617.

# Tacet design assets

Generated 2026-09-24 with Higgsfield (account: ultra plan, authenticated; no credit or auth blockers) plus hand-authored SVG. Every generated image was reviewed against [DESIGN-GUIDE.md](../DESIGN-GUIDE.md). Selected renders are references for material, rhythm and hierarchy; written numbers in the guide win over pixels (guide §11 lists each mockup's known deviations).

Job records (full request/response JSON, including result URLs) are in [_jobs/](_jobs/). Prompts are in [prompts/](prompts/). Every mockup prompt starts with the shared style block [prompts/_style.txt](prompts/_style.txt) (v1 without icon rules: [prompts/_style.v1.txt](prompts/_style.v1.txt)).

## Selected assets

### App icon and marks (hand-authored SVG; the generated images were exploration only)

| File | What | Source |
| --- | --- | --- |
| [icon/tacet-app-icon.svg](icon/tacet-app-icon.svg) | Master app icon, 48 grid, Fluent material | Hand-authored from candidate A below |
| [icon/tacet-app-icon-1024.png](icon/tacet-app-icon-1024.png) | 1024 PNG, transparent | Rasterized from the SVG with headless Chrome |
| [icon/tacet-app-icon-flat.svg](icon/tacet-app-icon-flat.svg) | Flat vector mark (no material) | Hand-authored |
| [icon/tacet-app-icon-32.svg](icon/tacet-app-icon-32.svg), [-24](icon/tacet-app-icon-24.svg), [-16](icon/tacet-app-icon-16.svg) | Optical sizes, pixel-snapped | Hand-authored |
| [icon/tacet-app-icon-hc.svg](icon/tacet-app-icon-hc.svg) + [1024 PNG](icon/tacet-app-icon-hc-1024.png) | High contrast | Hand-authored |
| [icon/tacet-mark-16.svg](icon/tacet-mark-16.svg), [icon/tacet-mark-mono.svg](icon/tacet-mark-mono.svg) | Title-bar mark (color, currentColor) | Hand-authored |
| [icon/tacet-file-md.svg](icon/tacet-file-md.svg) + [1024 PNG](icon/tacet-file-md-1024.png), [icon/tacet-file-txt.svg](icon/tacet-file-txt.svg) | File association icons (the only place a fold appears) | Hand-authored |
| [icon/icon-review.png](icon/icon-review.png) ([html](icon/icon-review.html)) | All sizes on light and dark taskbars | Headless Chrome render |
| [icon/candidates/recraft-A-ruled-margin.svg](icon/candidates/recraft-A-ruled-margin.svg) (+png) | Winning direction, raw | Recraft V4.1 vector, job `d769f375`, prompt [prompts/logo-A-ruled-margin.txt](prompts/logo-A-ruled-margin.txt), colors [prompts/logo-colors.json](prompts/logo-colors.json), background `#F2F4F7` |
| [icon/candidates/icon-1-sheet.png](icon/candidates/icon-1-sheet.png) | Winning direction as a Windows 11 app-icon render (material reference) | GPT Image 2, job `d251d468`, prompt [prompts/icon-1-sheet.txt](prompts/icon-1-sheet.txt) |

Why A won: it is the only candidate whose single idea (a margin, inset from the edge) is both ownable and survives at 16px. It also avoids the generic "document with a colored spine" reading of B and the ambiguity of C.

Refinements made by hand from A: page proportion 30:42 (paper, not phone); radius cut from ~16% to 8% of width (the Recraft render read as a smartphone); rule moved from 8% to 21% inset and thinned to 5% of width; inner hairline at 16% ink so the page holds on a white Start menu; separate pixel-snapped 16/24/32 drawings; no fold (folds are reserved for document icons).

### Brand sheet

| File | What |
| --- | --- |
| [brand/brand-sheet.png](brand/brand-sheet.png) ([html](brand/brand-sheet.html)) | Mark, light and dark palette with contrast ratios, type roles, a document sample. Deterministic HTML rendered with headless Chrome (uses the bundled fonts in `../fonts/`). |

### Mockups (GPT Image 2, 2k, quality high, 16:9 unless noted)

| File | Screen | Prompt | Job | Version |
| --- | --- | --- | --- | --- |
| [mockups/01-first-launch.png](mockups/01-first-launch.png) | S01 first launch, blank draft | [mock-01-first-launch.v3.txt](prompts/mock-01-first-launch.v3.txt) | `2f1a05b1` | v3 |
| [mockups/02-writing-markdown.png](mockups/02-writing-markdown.png) | S02 Markdown Write with shelf | [mock-02-writing.v2.txt](prompts/mock-02-writing.v2.txt) | `0d33a799` | v2 |
| [mockups/03-read-view.png](mockups/03-read-view.png) | S03 Read with On This Page | [mock-03-read.v2.txt](prompts/mock-03-read.v2.txt) | `0dfa75a5` | v2 |
| [mockups/04-explorer-shelf-coding.png](mockups/04-explorer-shelf-coding.png) | S11 Coding Tools: explorer in shelf, Code view, terminal | [mock-04-coding.v2.txt](prompts/mock-04-coding.v2.txt) | `dfd9deef` | v2 |
| [mockups/05-file-finder-palette.png](mockups/05-file-finder-palette.png) | S07 file finder / palette | [mock-05-palette.v2.txt](prompts/mock-05-palette.v2.txt) | `30ba863a` | v2 |
| [mockups/06-settings.png](mockups/06-settings.png) | S17 settings, Appearance | [mock-06-settings.v2.txt](prompts/mock-06-settings.v2.txt) | `99bb8c73` | v2 |
| [mockups/07-dark-writing.png](mockups/07-dark-writing.png) | Dark variant of S02 | [mock-07-dark.v2.txt](prompts/mock-07-dark.v2.txt) | `3a7bed1e` | v2 |
| [mockups/08-compact-480.png](mockups/08-compact-480.png) | S19 compact 480 window (9:16 frame) | [mock-08-compact.v3.txt](prompts/mock-08-compact.v3.txt) | `313b7a89` | v3 |

### Other hand-authored design files

| File | What |
| --- | --- |
| [../icons/*.svg](../icons/) + [specimen.png](../icons/specimen.png) | 24 product glyphs on the 16px grid |
| [../icons/tacet-product-icon-theme.json](../icons/tacet-product-icon-theme.json), [glyph-map.json](../icons/glyph-map.json) | Product icon theme draft and codepoints |
| [../css/typography-specimen.png](../css/typography-specimen.png) ([html](../css/typography-specimen.html)) | Every Markdown block rendered with `md-theme-tacet.css` at 150% |

No illustration or texture was produced for first-run or empty states. That is a decision, not a gap: guide §4.28 and §4.29 specify word-only empty states and no first-run surface. An illustrated empty state would break M1 (the page leads) and the slop list.

## Rejection log

Judged as an Apple design director would: does it express the system, or is it a generic app screenshot?

| Rejected | Model | Why | What changed |
| --- | --- | --- | --- |
| [recraft-B-folded-spine](rejected/recraft-B-folded-spine.jpg) | Recraft V4.1 | Blue dog-ear plus blue spine is every "document" icon (Docs, Word-ish). Reads as a file, not an app. Two blue areas compete. | Fold reserved for file association icons only. |
| [recraft-C-caret-margin](rejected/recraft-C-caret-margin.jpg) | Recraft V4.1 | Caret is a tiny floating object; at 32px it reads as a battery or a hanging tag. Page radius phone-like. | Caret idea kept only as the `mode-write` glyph. |
| [icon-2-sheet-fold](rejected/icon-2-sheet-fold.jpg) | GPT Image 2 | Premium render, but the fold makes the app icon identical in kind to its documents in Explorer. | Same as B. |
| [icon-3-sheet-caret](rejected/icon-3-sheet-caret.jpg) | GPT Image 2 | Thick blue bar reads as a bookmark ribbon or sticky tab, not a caret. Ambiguous at every size. | Rejected. |
| [mock-01 v1](rejected/mock-01-first-launch.v1.jpg) | GPT Image 2 | Hamburger menu (banned); tinted title bar although the shelf is closed; mark drawn with a fold. | Added explicit icon rules to the style block. |
| [mock-01 v2](rejected/mock-01-first-launch.v2.jpg) | GPT Image 2 | Mark rendered as a second panel-toggle glyph (two identical icons side by side); title bar still grey with a hairline. | v3 prompt forced a pure white title bar and a distinct paper mark. |
| [mock-02 v1](rejected/mock-02-writing.v1.jpg) | GPT Image 2 | Write/Read/Code dropped to a second toolbar row (breaks the unified 48px title bar); hamburger. | "Segmented control INSIDE the single title bar row" rule. |
| [mock-03 v1](rejected/mock-03-read.v1.jpg) | GPT Image 2 | Headings too heavy (bold, not semibold); hamburger; no mark. | Weight rule added. |
| [mock-04 v1](rejected/mock-04-coding.v1.jpg) | GPT Image 2 | Invented "M" letter logo; hamburger on the shelf; colored per-type file icons. | "Never a letter M"; monochrome icons. |
| [mock-05 v1](rejected/mock-05-palette.v1.jpg) | GPT Image 2 | Generic window chrome behind the palette (plain "Tacet" title bar, hamburger), invented paragraph. | v2 accepted with noted deviations (palette position still low). |
| [mock-06 v1](rejected/mock-06-settings.v1.jpg) | GPT Image 2 | Letter "M" logo; hamburger; segmented controls drawn as bordered button groups (web-form look). | Track + thumb segmented control rule. |
| [mock-07 v1](rejected/mock-07-dark.v1.jpg) | GPT Image 2 | Completed task struck through (we dim, never strike); link underlined at rest; two-line title in the title bar. | Explicit rules in v2. |
| [mock-08 v1](rejected/mock-08-compact.v1.jpg) | GPT Image 2 | Not compact: the "480px" window rendered about 1400px wide; hamburger. | v2 attempted a portrait window. |
| [mock-08 v2](rejected/mock-08-compact.v2.jpg) | GPT Image 2 | Still roughly square and wide; completed task not dimmed. | v3 used a 9:16 frame with the window alone. |

Recurring failure modes of the image model, for anyone generating more: it defaults to a hamburger icon for any sidebar toggle, invents a letter logo when asked for a "mark", tints the whole title bar, and ignores pixel widths unless the frame aspect ratio forces them. The v2 style block's icon rules fix the first three; aspect ratio fixes the last.

## Still to do (not blocked, but outside this pass)

- ICO assembly and installer bitmaps (IMPLEMENTATION-MAP T1.3).
- A real-screen taskbar test of the 16/24/32 icons on Windows 11 light and dark at 100/125/150/200% scaling.
- Replacing the mockups with real screenshots once T2 to T8 land.

## Concept v2, first boot, motion, animated identity, hero and launch (2026-09-27)

Made with Codex CLI 0.157.1 (`image_generation`) and Higgsfield (GPT Image 2.5, Kling 3.0 Pro, MiniMax H3; ultra plan) plus hand-authored SVG, CSS, Lottie and HTML. Everything is on one page: [concept-v2/CONTACT-SHEET.html](concept-v2/CONTACT-SHEET.html). Prompts: [prompts/v2/](prompts/v2/) (style blocks `_style.v2.txt`, `_style.v3.txt`, `_style.shellv2.txt`, `_style.shellv3.txt`, `_style.dark.txt`, `first-boot/_style.fb.v2.txt`). Higgsfield job records: [_jobs/v2/](_jobs/v2/). Specs that beat these pixels: [../FIRST-BOOT.md](../FIRST-BOOT.md), [../motion/MOTION.md](../motion/MOTION.md), [animated/ANIMATED-IDENTITY.md](animated/ANIMATED-IDENTITY.md).

Owner revisions applied on 2026-09-27: git removed (10-REBUILD), no status bar by default (opt-in Extra), first boot allowed (overrides guide §4.28), ANIMATION-GATE.md. Renders marked "guide v1 shell" keep the centered segmented control, find field and footer; they stay valid for the component they show.

### Selected (v2)

| File | Screen | Source | Verdict |
| --- | --- | --- | --- |
| [c01-shelf-states.hf.v2.png](concept-v2/hf/c01-shelf-states.hf.v2.png) | C01 Shelf states | Higgsfield GPT Image 2.5 (high, 2k), job 7a1de59a | Row states read at a glance with three greys and one blue. |
| [c02-title-menu.codex.v1.png](concept-v2/codex/c02-title-menu.codex.v1.png) | C02 Document title menu | Codex CLI 0.157.1 image_generation, prompt prompts/v2/c02-title-menu.v1.txt | The Pages-style title menu: no icons, one shadow tier. |
| [c03-compare.codex.v1.png](concept-v2/codex/c03-compare.codex.v1.png) | C03 Compare (S13) | Codex CLI 0.157.1 image_generation, prompt prompts/v2/c03-compare.v1.txt | No lines except the pane split. |
| [c04-notice-changed.hf.v2.png](concept-v2/hf/c04-notice-changed.hf.v2.png) | C04 Notice: changed on disk (S15) | Higgsfield GPT Image 2.5 (high, 2k), job f7ea27aa | Recoverable state in words, in place, no toast. |
| [c05-notice-savefailed.codex.v3.png](concept-v2/codex/c05-notice-savefailed.codex.v3.png) | C05 Notice: save failed | Codex CLI 0.157.1 image_generation, prompt prompts/v2/c05-notice-savefailed.v3.txt | Honest failure, one primary; footer and notice agree (M5). |
| [c06-dialog-unsaved.codex.v2.png](concept-v2/codex/c06-dialog-unsaved.codex.v2.png) | C06 Dialog: unsaved changes on close | Codex CLI 0.157.1 image_generation, prompt prompts/v2/c06-dialog-unsaved.v2.txt | Reads as a Windows 11 first-party dialog; the safe action has focus. |
| [c07-about.codex.v3.png](concept-v2/codex/c07-about.codex.v3.png) | C07 About (S20) | Codex CLI 0.157.1 image_generation with icon/tacet-app-icon-1024.png attached, prompt prompts/v2/c07-about.v3.txt | No marketing, the real icon, selectable facts. |
| [c08-print-preview.codex.v3.png](concept-v2/codex/c08-print-preview.codex.v3.png) | C08 Print preview (S18) | Codex CLI 0.157.1 image_generation, prompt prompts/v2/c08-print-preview.v3.txt | The page is the product even on paper. |
| [c09-code-terminal.hf.v4.png](concept-v2/hf/c09-code-terminal.hf.v4.png) | C09 Code mode + terminal (no git, no footer) | Higgsfield GPT Image 2.5 (high, 2k), job 610c57d2 | Fixes mockup 04 (no dark outline, no dark slab) and follows the git removal and the no-status-bar default. |
| [c10-dark-code.hf.v4.png](concept-v2/hf/c10-dark-code.hf.v4.png) | C10 Dark: Code mode + terminal | Higgsfield GPT Image 2.5 (high, 2k), job 114fd13f | The dark variant keeps the two-surface rule. |
| [c11-shellv3-writing.hf.v2.png](concept-v2/hf/c11-shellv3-writing.hf.v2.png) | C11 Shell v2: title bar + page only | Higgsfield GPT Image 2.5 (high, 2k), job e271c737 | The calmest Tacet render so far: nothing competes with the H1. |
| [kf-02-palette.png](motion/keyframes/kf-02-palette.png) | C12 Palette in context | Higgsfield GPT Image 2.5 (high, 2k) edit of mockups/02, job f1552fd2 | Made as a motion keyframe; also fixes mockup 05's low palette position.. |
| [fb1-look.codex.v2.png](first-boot/fb1-look.codex.v2.png) | FB1 Look | Codex CLI 0.157.1 image_generation, prompt prompts/v2/first-boot/fb1-look.v2.txt | A page, not a wizard. |
| [fb2-import.codex.v2.png](first-boot/fb2-import.codex.v2.png) | FB2 Bring your settings | Codex CLI 0.157.1 image_generation, prompt prompts/v2/first-boot/fb2-import.v2.txt | Honest, one-way import in two lines of copy.. |
| [fb3-notes.codex.v2.png](first-boot/fb3-notes.codex.v2.png) | FB3 Where your notes live | Codex CLI 0.157.1 image_generation, prompt prompts/v2/first-boot/fb3-notes.v2.txt | Trust copy says where files go. |
| [fb4-extras.codex.v2.png](first-boot/fb4-extras.codex.v2.png) | FB4 Extras (optional) | Codex CLI 0.157.1 image_generation, prompt prompts/v2/first-boot/fb4-extras.v2.txt | Opt-in power for one keystroke; Enter keeps everything off.. |
| [fb5-landing.codex.v2.png](first-boot/fb5-landing.codex.v2.png) | FB5 Landing | Codex CLI 0.157.1 image_generation, prompt prompts/v2/first-boot/fb5-landing.v2.txt | The last screen of setup is the product: title bar and page only.. |
| [hero-01-light.v1.png](hero/hero-01-light.v1.png) | Hero 16:9 light | Higgsfield GPT Image 2.5 (high, 4k, image refs) (mockups/02), job a8ccacc0 | Quiet and real; room for a headline below. |
| [hero-02-light-dark.v2.png](hero/hero-02-light-dark.v2.png) | Hero 16:9 light + dark | Higgsfield GPT Image 2.5 (high, 4k, image refs) (mockups/02 + 07), job 4267642a | Both themes, no gradient, no glow. |
| [hero-03-blank.v1.png](hero/hero-03-blank.v1.png) | Hero 16:9 blank page | Higgsfield GPT Image 2.5 (high, 4k, image refs) (mockups/01), job 7ef74b44 | The clean-sheet promise in one frame. |
| [hero-05-square-blank.v1.png](hero/hero-05-square-blank.v1.png) | Hero 1:1 blank page | Higgsfield GPT Image 2.5 (high, 4k, image refs) (mockups/01), job e742de9a | Works as a store tile. |
| [tacet-banner-light.png](launch/tacet-banner-light.png) | README banner, light | Hand-authored HTML (launch/src/launch.html), headless Chrome at 2x; window built from tokens | Exact type and color; no AI render in the product shot.. |
| [tacet-banner-dark.png](launch/tacet-banner-dark.png) | README banner, dark | Hand-authored HTML, headless Chrome 2x | Pairs with the light banner in a picture element.. |
| [tacet-pillars-light.png](launch/tacet-pillars-light.png) | Pillars, light | Hand-authored HTML, headless Chrome 2x | Type-led; the brand gesture is the only decoration.. |
| [tacet-pillars-dark.png](launch/tacet-pillars-dark.png) | Pillars, dark | Hand-authored HTML, headless Chrome 2x | Pairs with the light pillars.. |
| [tacet-social.png](launch/tacet-social.png) | GitHub social preview | Hand-authored HTML, headless Chrome 2x | Reads at thumbnail size; no glow, no device.. |

### Motion references (feel only; the spec is motion/MOTION.md)

| File | Motion | Source | What to see |
| --- | --- | --- | --- |
| [mo-01-mode-switch.mp4](motion/mo-01-mode-switch.mp4) | M-01 Mode switch | Higgsfield Kling 3.0 Pro (start/end frames), job 8111c749, ping-pong | Only the thumb moves Write to Read; the page is identical. |
| [mo-02-shelf-open-close.mp4](motion/mo-02-shelf-open-close.mp4) | M-02 Shelf open/close | Higgsfield Kling 3.0 Pro (start/end frames), job e3f6b683, ping-pong | The page edge travels; the text column stays put. |
| [mo-03-palette-arrive.mp4](motion/mo-03-palette-arrive.mp4) | M-03 Palette arrival | Higgsfield MiniMax H3 (start/end frames), job 548fb38f, ping-pong | Palette fades in with results present; the page never dims or moves. |
| [mo-04-caret-phase.mp4](motion/mo-04-caret-phase.mp4) | M-04 Caret phase | Higgsfield Kling 3.0 Pro (start/end frames) (same start/end frame), job d1434f1c | Soft phase blink, no hard on/off. |
| [mo-05-save-state.mp4](motion/mo-05-save-state.mp4) | M-05 Save state | Higgsfield MiniMax H3 (start/end frames), job ac202ab2, ping-pong | Edited crossfades to Saved in place. |
| [mo-06-fb-page-clears.mp4](motion/mo-06-fb-page-clears.mp4) | M-07 First boot: the page clears | Higgsfield MiniMax H3 (start/end frames), job 9a65c9f0 | Setup text fades out; the same page shows Start writing. and the caret. |
| [mk-a-pen-stroke.minimax-h3.mp4](animated/studies/mk-a-pen-stroke.minimax-h3.mp4) | Mark study A: pen stroke + settle | Higgsfield MiniMax H3 (start/end frames), job b2581a93 | The rule draws top to bottom; the page dips once. |
| [mk-b-caret-wink.kling3.mp4](animated/studies/mk-b-caret-wink.kling3.mp4) | Mark study B: caret wink | Higgsfield Kling 3.0 Pro (start/end frames), job cf48c7c5 | The rule retracts and redraws once. |

### Animated identity (hand-authored)

| File | What |
| --- | --- |
| [animated/tacet-mark.css](animated/tacet-mark.css) | Mark animations: pen-stroke draw 880 ms (chosen), compact 560 ms, caret wink 600 ms, page nod 720 ms, reduced-motion fade |
| [animated/tacet-mark-draw.svg](animated/tacet-mark-draw.svg), [-wink](animated/tacet-mark-wink.svg), [-nod](animated/tacet-mark-nod.svg) | Standalone self-playing SVGs |
| [animated/tacet-mark-draw.lottie.json](animated/tacet-mark-draw.lottie.json) | Lottie of the chosen draw, 60 fps, verified with lottie-web 5.12.2 light ([vendor/](animated/vendor/)) |
| [animated/icons-animated.css](animated/icons-animated.css) | Hover micro-animations for 5 icons on occasional surfaces; state motion for twisties and checkboxes |
| [animated/PREVIEW.html](animated/PREVIEW.html) | Plays everything, with a reduced-motion toggle |

### Rejection log (v2)

| Rejected | Model | Why | What changed |
| --- | --- | --- | --- |
| [C01 v1](rejected/v2/concept-v2__hf__c01-shelf-states.hf.v1.png) | GPT Image 2.5 | Invented Cancel/Save buttons on the page; hairlines under the title bar and above the footer; window cropped. | v3 style block: no lines under the title bar or above the footer, semibold not bold, whole window visible, no invented controls. |
| [C01 codex v1](rejected/v2/concept-v2__codex__c01-shelf-states.codex.v1.png) | Codex CLI 0.157.1 image_generation | PNG came back with a transparent hole burned through the page and ragged alpha edges (fixed later by demanding an opaque image). | Prompts now demand an opaque image. |
| [C02 v1](rejected/v2/concept-v2__hf__c02-title-menu.hf.v1.png) | GPT Image 2.5 | No centered column (text at the window edge); plain-text first line rendered bold; window cropped. | v3 style block: no lines under the title bar or above the footer, semibold not bold, whole window visible, no invented controls. |
| [C03 v1](rejected/v2/concept-v2__hf__c03-compare.hf.v1.png) | GPT Image 2.5 | Hairlines under the title bar and above the footer; toggle filled at rest (M7). The Codex take has none of these. | v3 style block: no lines under the title bar or above the footer, semibold not bold, whole window visible, no invented controls. |
| [C04 v1](rejected/v2/concept-v2__hf__c04-notice-changed.hf.v1.png) | GPT Image 2.5 | Faintly tinted title bar; footer hairline; heavy H1. | v3 style block: no lines under the title bar or above the footer, semibold not bold, whole window visible, no invented controls. |
| [C05 v1](rejected/v2/concept-v2__hf__c05-notice-savefailed.hf.v1.png) | GPT Image 2.5 | Column not centered; heavy H1; footer hairline. | v3 style block: no lines under the title bar or above the footer, semibold not bold, whole window visible, no invented controls. |
| [C05 v2](rejected/v2/concept-v2__hf__c05-notice-savefailed.hf.v2.png) | GPT Image 2.5 | Grey strip across the left of the title bar with the shelf closed (the known tint failure); typo in the document text. | v3 style block: no lines under the title bar or above the footer, semibold not bold, whole window visible, no invented controls. |
| [C06 v1](rejected/v2/concept-v2__hf__c06-dialog-unsaved.hf.v1.png) | GPT Image 2.5 | Scrim stops at the title bar and footer (banded window); invented sentimental prose; doubled focus ring. | v3 style block: no lines under the title bar or above the footer, semibold not bold, whole window visible, no invented controls. |
| [C07 v1](rejected/v2/concept-v2__hf__c07-about.hf.v1.png) | GPT Image 2.5 | Banded scrim with a grey phantom panel; no document title; mode control shifted left. | v3 style block: no lines under the title bar or above the footer, semibold not bold, whole window visible, no invented controls. |
| [C07 codex v2](rejected/v2/concept-v2__codex__c07-about.codex.v2.png) | Codex CLI 0.157.1 image_generation | Ragged transparent edges; title bar scrimmed less than the page; weak icon. | Prompts now demand an opaque image. |
| [C07 v3](rejected/v2/concept-v2__hf__c07-about.hf.v3.png) | GPT Image 2.5 | Scrim far heavier than 12% (grey dashboard); phantom shelf edge; icon rule drawn at the edge (binder). | v3 style block: no lines under the title bar or above the footer, semibold not bold, whole window visible, no invented controls. |
| [C08 v1](rejected/v2/concept-v2__hf__c08-print-preview.hf.v1.png) | GPT Image 2.5 | Window behind shows a File/Edit/View menu row and a Tacet wordmark; blockquote dimmed. | v3 style block: no lines under the title bar or above the footer, semibold not bold, whole window visible, no invented controls. |
| [C08 v2](rejected/v2/concept-v2__hf__c08-print-preview.hf.v2.png) | GPT Image 2.5 | Hamburger icon in the window behind (banned); invented paragraph. | v3 style block: no lines under the title bar or above the footer, semibold not bold, whole window visible, no invented controls. |
| [C09 codex v1](rejected/v2/concept-v2__codex__c09-code-terminal.codex.v1.png) | Codex CLI 0.157.1 image_generation | Transparent hole in the editor; two-line title in the title bar. | Prompts now demand an opaque image. |
| [C09 v1](rejected/v2/concept-v2__hf__c09-code-terminal.hf.v1.png) | GPT Image 2.5 | Superseded: a good guide-v1 render, but it shows branch main and a source-control icon, and git is removed (10-REBUILD revision 2026-09-27). | Superseded by a newer owner decision. |
| [C10 v1](rejected/v2/concept-v2__hf__c10-dark-code.hf.v1.png) | GPT Image 2.5 | File name dropped to a second row under the title bar (breaks the one-row title bar). | v3 style block: no lines under the title bar or above the footer, semibold not bold, whole window visible, no invented controls. |
| [C10 v2](rejected/v2/concept-v2__hf__c10-dark-code.hf.v2.png) | GPT Image 2.5 | Superseded by the git removal (branch, source control); static Code label drawn as an outlined pill. | Superseded by a newer owner decision. |
| [C10 v3](rejected/v2/concept-v2__hf__c10-dark-code.hf.v3.png) | GPT Image 2.5 | Only the editor went dark; shelf and title bar stayed light; picker on a second row. | v3 style block: no lines under the title bar or above the footer, semibold not bold, whole window visible, no invented controls. |
| [Hero 02 v1](rejected/v2/hero__hero-02-light-dark.v1.png) | GPT Image 2.5 | Tacet wordmark in both sidebars (banned). | v3 style block: no lines under the title bar or above the footer, semibold not bold, whole window visible, no invented controls. |
| [Hero 04 v1](rejected/v2/hero__hero-04-square.v1.png) | GPT Image 2.5 | At hero scale the H1 is clearly bold 700, not semibold; no folder name. | v3 style block: no lines under the title bar or above the footer, semibold not bold, whole window visible, no invented controls. |
| [Hero 04 v2](rejected/v2/hero__hero-04-square.v2.png) | GPT Image 2.5 | Still a bold H1 and a hairline under the title bar; replaced by the blank-page square. | v3 style block: no lines under the title bar or above the footer, semibold not bold, whole window visible, no invented controls. |
| [Keyframe: palette removed](rejected/v2/motion__keyframes__kf-05-no-palette.png) | GPT Image 2.5 | The edit rebuilt a generic window (wordmark, full-width hairlines) instead of removing the overlay; replaced by adding a palette to mockup 02. | v3 style block: no lines under the title bar or above the footer, semibold not bold, whole window visible, no invented controls. |
| [Shelf, MiniMax](rejected/v2/motion__raw__shelf.minimax-h3.mp4) | MiniMax H3 | Shelf rows slide in with the edge (rows never animate in, guide 4.7). | Replaced by another take. |
| [Palette, Kling](rejected/v2/motion__raw__palette.kling3.mp4) | Kling 3.0 Pro | The frame arrives empty and results stream in afterwards (results never animate). | Replaced by another take. |
| [Mark study C: corner curl](rejected/v2/animated__studies__mk-c-page-hello.kling3.mp4) | Kling 3.0 Pro | Draws a folded corner, which is reserved for file icons (guide 10.5); re-authored as a flat nod. | Replaced by another take. |
| [FB1 v1](rejected/v2/first-boot__fb1-look.codex.v1.png) | Codex CLI 0.157.1 image_generation | Superseded: footer step line removed (owner 2026-09-27, no status bar); the flow is now 4 steps with Extras. | Superseded by a newer owner decision. |
| [FB2 v1](rejected/v2/first-boot__fb2-import.codex.v1.png) | Codex CLI 0.157.1 image_generation | Superseded: footer removed. | Superseded by a newer owner decision. |
| [FB3 v1](rejected/v2/first-boot__fb3-notes.codex.v1.png) | Codex CLI 0.157.1 image_generation | Superseded: footer removed; primary is now Continue. | Superseded by a newer owner decision. |
| [FB landing v1](rejected/v2/first-boot__fb4-landing.codex.v1.png) | Codex CLI 0.157.1 image_generation | Superseded: the footer hint moved under the placeholder. | Superseded by a newer owner decision. |
| [C09 v3](rejected/v2/concept-v2__hf__c09-code-terminal.hf.v3.png) | GPT Image 2.5 | Superseded: footer and line numbers are now opt-in Extras. | Superseded by a newer owner decision. |
| [C11 v1](rejected/v2/concept-v2__hf__c11-shellv2-writing.hf.v1.png) | GPT Image 2.5 | Superseded: footer removed by default. | Superseded by a newer owner decision. |
| [C11 v3 take 1](rejected/v2/concept-v2__hf__c11-shellv3-writing.hf.v1.png) | GPT Image 2.5 | Write picker and overflow dropped to a second row under the title bar (breaks the one-row title bar); heavy H1. | v3 style block: no lines under the title bar or above the footer, semibold not bold, whole window visible, no invented controls. |

Recurring failure modes, v2: GPT Image 2.5 still draws the H1 in bold 700 whatever the prompt says, tints the title bar grey on the shelf side even with the shelf closed, adds hairlines under the title bar and above the footer, and drops right-side title-bar controls onto a second row. Codex renders are more literal about layout and copy but sometimes return transparent PNGs with holes (ask for an opaque image). Video models (Kling 3.0 Pro, MiniMax H3) keep text stable with start and end keyframes but cannot hold sub-200 ms timing: use them for what moves, never for how long.

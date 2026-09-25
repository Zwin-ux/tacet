# Margin design assets

Generated 2026-09-24 with Higgsfield (account: ultra plan, authenticated; no credit or auth blockers) plus hand-authored SVG. Every generated image was reviewed against [DESIGN-GUIDE.md](../DESIGN-GUIDE.md). Selected renders are references for material, rhythm and hierarchy; written numbers in the guide win over pixels (guide §11 lists each mockup's known deviations).

Job records (full request/response JSON, including result URLs) are in [_jobs/](_jobs/). Prompts are in [prompts/](prompts/). Every mockup prompt starts with the shared style block [prompts/_style.txt](prompts/_style.txt) (v1 without icon rules: [prompts/_style.v1.txt](prompts/_style.v1.txt)).

## Selected assets

### App icon and marks (hand-authored SVG; the generated images were exploration only)

| File | What | Source |
| --- | --- | --- |
| [icon/margin-app-icon.svg](icon/margin-app-icon.svg) | Master app icon, 48 grid, Fluent material | Hand-authored from candidate A below |
| [icon/margin-app-icon-1024.png](icon/margin-app-icon-1024.png) | 1024 PNG, transparent | Rasterized from the SVG with headless Chrome |
| [icon/margin-app-icon-flat.svg](icon/margin-app-icon-flat.svg) | Flat vector mark (no material) | Hand-authored |
| [icon/margin-app-icon-32.svg](icon/margin-app-icon-32.svg), [-24](icon/margin-app-icon-24.svg), [-16](icon/margin-app-icon-16.svg) | Optical sizes, pixel-snapped | Hand-authored |
| [icon/margin-app-icon-hc.svg](icon/margin-app-icon-hc.svg) + [1024 PNG](icon/margin-app-icon-hc-1024.png) | High contrast | Hand-authored |
| [icon/margin-mark-16.svg](icon/margin-mark-16.svg), [icon/margin-mark-mono.svg](icon/margin-mark-mono.svg) | Title-bar mark (color, currentColor) | Hand-authored |
| [icon/margin-file-md.svg](icon/margin-file-md.svg) + [1024 PNG](icon/margin-file-md-1024.png), [icon/margin-file-txt.svg](icon/margin-file-txt.svg) | File association icons (the only place a fold appears) | Hand-authored |
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
| [../icons/margin-product-icon-theme.json](../icons/margin-product-icon-theme.json), [glyph-map.json](../icons/glyph-map.json) | Product icon theme draft and codepoints |
| [../css/typography-specimen.png](../css/typography-specimen.png) ([html](../css/typography-specimen.html)) | Every Markdown block rendered with `md-theme-margin.css` at 150% |

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
| [mock-05 v1](rejected/mock-05-palette.v1.jpg) | GPT Image 2 | Generic window chrome behind the palette (plain "Margin" title bar, hamburger), invented paragraph. | v2 accepted with noted deviations (palette position still low). |
| [mock-06 v1](rejected/mock-06-settings.v1.jpg) | GPT Image 2 | Letter "M" logo; hamburger; segmented controls drawn as bordered button groups (web-form look). | Track + thumb segmented control rule. |
| [mock-07 v1](rejected/mock-07-dark.v1.jpg) | GPT Image 2 | Completed task struck through (we dim, never strike); link underlined at rest; two-line title in the title bar. | Explicit rules in v2. |
| [mock-08 v1](rejected/mock-08-compact.v1.jpg) | GPT Image 2 | Not compact: the "480px" window rendered about 1400px wide; hamburger. | v2 attempted a portrait window. |
| [mock-08 v2](rejected/mock-08-compact.v2.jpg) | GPT Image 2 | Still roughly square and wide; completed task not dimmed. | v3 used a 9:16 frame with the window alone. |

Recurring failure modes of the image model, for anyone generating more: it defaults to a hamburger icon for any sidebar toggle, invents a letter logo when asked for a "mark", tints the whole title bar, and ignores pixel widths unless the frame aspect ratio forces them. The v2 style block's icon rules fix the first three; aspect ratio fixes the last.

## Still to do (not blocked, but outside this pass)

- ICO assembly and installer bitmaps (IMPLEMENTATION-MAP T1.3).
- A real-screen taskbar test of the 16/24/32 icons on Windows 11 light and dark at 100/125/150/200% scaling.
- Replacing the mockups with real screenshots once T2 to T8 land.

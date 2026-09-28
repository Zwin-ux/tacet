# Tacet animated identity

Status: v1, 2026-09-27. Owner: margin/design. Gate: [ANIMATION-GATE.md](../../ANIMATION-GATE.md). Motion vocabulary: [motion/MOTION.md](../../motion/MOTION.md).
Play everything: [PREVIEW.html](PREVIEW.html) (local files only, reduced-motion toggle).

The quirk is spent where it is rare: the mark, the first boot, About, the first save. Everything a person touches 100 times a day stays still. The personality is the margin rule itself behaving like a caret: it draws, it winks, it nods. No bounce, no confetti, no characters with faces.

## 1. The animated mark

Three directions were explored as Higgsfield motion studies first (feel only; [studies/](studies/)), then authored by hand in SVG + CSS. The shipped values live in [margin-mark.css](margin-mark.css).

| Direction | Study (feel reference) | Authored | Verdict |
| --- | --- | --- | --- |
| **A. Pen stroke + paper settle** | [mk-a-pen-stroke.kling3.mp4](studies/mk-a-pen-stroke.kling3.mp4) (Kling 3.0 Pro, job `791704b0`), [mk-a-pen-stroke.minimax-h3.mp4](studies/mk-a-pen-stroke.minimax-h3.mp4) (MiniMax H3, job `b2581a93`, the better settle) | [margin-mark-draw.svg](margin-mark-draw.svg), [margin-mark-draw.lottie.json](margin-mark-draw.lottie.json) | **Chosen** for the mark. It performs the brand's one gesture (the margin line = "here") once, and it reads as writing, not as a logo sting. |
| B. Caret wink | [mk-b-caret-wink.kling3.mp4](studies/mk-b-caret-wink.kling3.mp4) (job `cf48c7c5`; the model retracted and redrew the rule instead of fading it, a nice alternative) | [margin-mark-wink.svg](margin-mark-wink.svg) | Kept as a **moment** (first save), not the logo animation: a wink needs the mark to already be there. |
| C. Page hello | [mk-c-page-hello.kling3.mp4](studies/mk-c-page-hello.kling3.mp4) (job `798699be`) | [margin-mark-nod.svg](margin-mark-nod.svg) (as a flat "nod") | The study's corner curl is charming but draws a folded corner, which the icon brief reserves for file icons (guide §10.5). Authored instead as a 4-degree nod on the bottom-left corner. Kept as the **About easter egg**. |

### A. Pen stroke + paper settle (the logo animation), 880 ms

| Time | Element | Property | Values | Curve |
| --- | --- | --- | --- | --- |
| 0 to 160 ms | whole mark | opacity, scale | 0 -> 1, 0.97 -> 1 (never from 0) | gate ease-out `(0.23, 1, 0.32, 1)` |
| 120 to 600 ms | blue rule | scaleY from the top edge | 0 -> 1 | gate ease-in-out `(0.77, 0, 0.175, 1)` (a pen stroke: quick middle, soft ends) |
| 560 to 880 ms | whole mark | translateY | 0 -> 0.6 -> 0 grid units (0.8 px at 64 px, 3.2 px at 256 px) | gate ease-in-out |

Compact variant `mm--draw-compact` (cold-launch splash): 560 ms (arrive 120, draw 60 to 380, settle 360 to 560).

Reduced motion: 200 ms opacity fade of the complete mark; the rule is drawn from the start.

Uses and rules:

| Surface | Variant | Rule |
| --- | --- | --- |
| First boot, step 1 (above or instead of the `Tacet` heading) | draw, 880 ms | Plays once when the step appears. Input is live from frame 1; Enter works during the animation. |
| Cold-launch splash | draw-compact, 560 ms | Only if the workbench is not ready 400 ms after the window shows; centered 64 px on canvas; the moment the editor is ready, the splash fades out in 110 ms even mid-animation. Never blocks typing: keystrokes go to the draft buffer. Most launches never show it. |
| About | draw, 880 ms | Plays when the dialog opens. |
| Landing page hero | draw, 880 ms, at 128 to 256 px | Plays once when scrolled into view; never loops. |

Formats: inline SVG + `margin-mark.css` (workbench and webviews), standalone self-playing SVGs, and a Lottie JSON (hand-authored, 60 fps, 256 x 256, verified frame by frame with lottie-web 5.12.2 light; it omits the contact shadow and the 2% paper falloff, which the host adds if needed).

### B. Caret wink, 600 ms

Rule opacity 1 -> 0 in 200 ms (exit curve `(0.3, 0, 1, 1)`), holds 80 ms, 0 -> 1 in 320 ms (gate ease-out). The page does not move. Reduced motion: none.

### C. Page nod, 720 ms

Whole mark `rotate(0 -> -4deg -> 0)` on the page's bottom-left corner, 300 ms up and 420 ms down, gate ease-in-out, no overshoot. Reduced motion: none.

## 2. Quirky moments (the delight budget)

Every moment below passes the gate: rare or first-time (1), a named purpose (2), a speed in range (3), and nothing the user is reading or acting on moves (4). Each plays once per trigger and never delays input.

| # | Moment | Trigger and frequency | What happens (exact) | Purpose | Reduced motion |
| --- | --- | --- | --- | --- | --- |
| Q1 | The mark writes itself | First boot step 1; About opens; landing hero | Direction A, 880 ms (above) | Delight + explanation (the margin is the product) | 200 ms fade |
| Q2 | Launch splash | Cold launch slower than 400 ms only | Direction A compact, 560 ms, then 110 ms fade to the page | Preventing a jarring change (blank window) | 200 ms fade, or nothing if ready |
| Q3 | First save ever | The first time a draft becomes a file on this PC (once per install; tracked in application storage `margin.moment.firstSave`) | The 16 px title-bar mark winks once (Direction B, 600 ms) at the moment the footer turns to `Saved`. The footer does not change behavior. | Delight + feedback (your text is now a real file) | none |
| Q4 | About nod | Third click on the app icon in About within 2 s (discoverable, harmless) | Direction C, 720 ms. A fourth click does nothing new (no escalation, no counters). | Delight | none |
| Q5 | The page clears | Finishing the first boot | 110 ms fade out, 40 ms empty page, 160 ms fade in of `Start writing.` and the caret, which stays solid for 500 ms before the first phase blink (FIRST-BOOT §6) | Explanation + spatial consistency (the setup was written on the same page) | instant |
| Q6 | Copied | `Copy` in About | The text button reads `Copied` for 1.5 s, opacity crossfade 100 ms each way. No check mark, no toast. | Feedback | instant swap |

### Rejected candidates

| Candidate | Why not |
| --- | --- |
| "All notes saved" animation when closing the window | The window is gone before anyone can see it, and anything that delays close costs trust (M5). |
| Word-count milestones (1,000 words, streaks) | Achievement framing; the guide says Saved is not an achievement. Also motivational copy (slop list). |
| The mark as an empty-state illustration that draws itself | Empty states are words only (guide §4.29); it would be an illustration with extra steps. |
| Confetti or sparkle on `Start writing` | Slop list (sparkles), and the reward for finishing setup is the page. |
| A caret with personality while typing (wobble, color, trail) | 100+ times a day (gate 1), and the caret is the focus indicator (§2.8). |
| Shelf rows cascading in on open | Tens a day (gate 1) and guide §4.7 (rows do not animate in). |
| Icon wiggles on title-bar buttons | 100+ times a day (gate 1); see §3. |

## 3. Product icon micro-animations

Code: [icons-animated.css](icons-animated.css). Hover only under `(hover: hover) and (pointer: fine)`, CSS transitions (they reverse cleanly on hover-out), transform and opacity only, 150 to 300 ms, gate ease-out. A control opts in with `.mi-anim`; the class is allowed only on occasional surfaces: overflow and title menus, the Settings page, notices, dialogs, About, first boot. The glyphs are the 16 px set in [../../icons/](../../icons/) (1 px = 1 grid unit).

Honest finding: Tacet shows few icons on occasional surfaces (menus and the title menu are text-only, first boot and empty states have no icons). So the animated set is small on purpose. If the owner wants more animated icons, the question is where icons should appear, not how they move.

| Icon | Animation | Duration | Purpose | Where it may animate |
| --- | --- | --- | --- | --- |
| `settings` | the two knobs slide 1 unit apart | 220 ms | feedback: adjustable | Settings entry in the overflow menu (if menus get icons), Settings page nav |
| `recent` | the clock hand turns back 45 degrees | 280 ms | explanation: going back in time | `Version History` in the title menu (if the title menu gets icons) |
| `compare` | both panes move 0.5 unit toward the middle | 200 ms | feedback: side by side | the compare toolbar (S13), `Compare Changes` if it gets an icon |
| `folder` | the lid line lifts 1 unit and dims to 70% | 200 ms | feedback: opens a folder | `Show in File Explorer`, first boot `Choose Folder…` (if an icon is added) |
| `coding-tools` | the prompt steps right 1 unit | 180 ms | feedback | Settings > Coding tools |
| `chevron-right` | state, not hover: rotates to 90 degrees on expand | 100 ms | state indication | shelf folders, tree (near-imperceptible is allowed at tens a day) |
| `task` | state: the tick enters from 90% scale and 0 opacity | 100 ms | feedback | checkboxes in documents and settings; unchecking is instant |

Must NOT animate, ever:

| Icon | Where it lives | Why (gate) |
| --- | --- | --- |
| `shelf`, `more`, `new-note` | title bar | 100+ a day; motion on the most-used buttons is noise (gate 1). |
| `mode-write`, `mode-read`, `mode-code` | mode control, compact overflow | Mode switches are frequent and M3 forbids anything moving on switch. |
| `note`, `note-draft`, `file`, `file-text`, `folder` in rows, `outline` | shelf rows, Explorer tree, On This Page | Scanned and clicked tens to hundreds of times a day; rows must be still to be read (gate 1, gate 4). |
| `search` | shelf Search row, palette, settings search | The palette is 100+ a day (gate 1). |
| `close` | dialogs, toasts, panels, find | Appears on frequent surfaces too; the same glyph must behave the same everywhere (M9). A spinning X is also a cliché. |
| `lock` | footer `Read only`, title | A lock that moves suggests it can be unlocked; it cannot (function, gate 4). |
| `warning` | notices, toasts | A moving hazard sign reads as alarm; notices must be calm (M5). |
| `saved` | menu check marks | Frequent, and Saved is not an achievement. |
| everything in the footer and the palette | footer, palette | Gate 1; the footer is state (M5), never decoration. |

Reduced motion: all icon transitions off; `.mi-reduced` on an ancestor forces the same (used by the preview toggle).

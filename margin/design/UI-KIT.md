# Margin UI kit: Animate UI across the product

Status: coordinator decision, 2026-09-27. Owner direction: "all aspects of the UI should be optimized and better with Animate UI, re-inspired and more modern." Every motion still passes [ANIMATION-GATE.md](ANIMATION-GATE.md). Catalog checked 2026-09-27 at https://animate-ui.com/docs (components, primitives, icons). Motion (the engine) is `motion@13.4.4`.

## Architecture: two ways Animate UI reaches the product

| Surface type | How | Why |
| --- | --- | --- |
| **Margin-owned webview surfaces** (first boot, Settings home, About, What's new, Import) | Animate UI React components **verbatim** (shadcn registry), React 19 + Tailwind v4 + Motion, restyled with Margin tokens from the active theme's CSS variables. Proven by the spike (`extensions/margin-welcome`, 2cbadc3a). | Full fidelity, fastest to build, rare surfaces can afford ~140 KB gz. |
| **Workbench chrome** (title bar, title menu, mode picker, shelf, menus, tooltips, dialogs, toasts, checkboxes/switches/radios, Read view) | **Vanilla port** of the matching Animate UI component into `src/vs/workbench/contrib/margin/browser/kit/`: same anatomy, states and motion, built on the native Web Animations API + CSS transitions. Motion's springs are baked into CSS `linear()` easing strings at build time (generated once from Motion's spring solver into `kit/easing.ts`), so the workbench gets Motion-accurate springs with **no React and no runtime dependency**. | The workbench is plain TypeScript DOM; React in the core chrome would cost startup time on every launch. |
| **Read view** (Markdown preview webview, not React) | Vanilla ports of the copy button, code-block, checkbox tick and highlight effects, injected as preview scripts/CSS. | Same look inside documents. |

Rule: one visual language. A user must not be able to tell which surfaces are React and which are ported.

## Surface map

Tier = frequency tier from the gate (K = keyboard/100+ a day: never animate; F = frequent: near-invisible; O = occasional: standard; R = rare: delight budget).

| Surface | Animate UI source | Runs as | Tier | Motion |
| --- | --- | --- | --- | --- |
| First boot (all screens) | `texts/splitting` (welcome line), `radix/radio-group` (theme), `base/toggle-group` (text size), `base/switch` (Extras), `buttons/button` + animated arrow icon, `effects/fade` + `effects/slide` between steps | React webview | R | Step change 280 ms `--ease-out`, slide 12 px; reduced motion: instant |
| Theme change (any time) | `effects/theme-toggler` (circular reveal from the control) | Vanilla (View Transitions API) | R | 400 ms `--ease-in-out`; reduced motion: 150 ms crossfade |
| Margin mark (launch, About, first boot) | Custom, per design lane "animated identity" | SVG + CSS | R | 600–1200 ms, never blocks typing |
| Document title + dirty dot | `texts/morphing` for "Saved" ↔ "Edited" on title hover/focus; dot scale-in | Vanilla | F | Dot 120 ms opacity+scale from 0.6; text morph 180 ms; no motion while typing |
| Title menu (rename, location, Show in Explorer, Save As) | `base/popover` | Vanilla | O | Grow from the title (`transform-origin` at trigger), 180 ms `--ease-out`, from scale 0.96 + opacity 0; exit 120 ms |
| Mode picker `Write ▾` | `base/menu` (dropdown) | Vanilla | O | 160 ms from trigger, items not staggered |
| Shelf (side bar) | `radix/sidebar` (collapse), `base/files` (folder tree), `primitives/animate/pinned-list` (pinned notes), `base/accordion` / `collapsible` (sections) | Vanilla | O (toggle) / F (rows) | Open/close 220 ms `--ease-drawer` width+opacity; section expand 180 ms auto-height; rows: no motion |
| Context menus | `base/menu` | Vanilla | O | 150 ms from pointer, exit 100 ms |
| Tooltips / hovers | `base/tooltip` (+ `animate/tooltip` shared-layout glide between adjacent triggers) | Vanilla | F | 600 ms delay, 125 ms fade + 4 px; instant when moving between adjacent tooltips |
| Dialogs (unsaved changes, confirm delete) | `base/alert-dialog`, `base/dialog` | Vanilla | O | 200 ms, scale 0.97 → 1, centered, backdrop 150 ms |
| Toasts / notifications | `community/notification-list` pattern | Vanilla | O | Enter and exit the same edge, 250 ms `--ease-out` |
| Checkbox, switch, radio, toggle (settings, dialogs, tasks) | `base/checkbox` (tick draws), `base/switch` (spring thumb), `radix/radio-group`, `base/toggle` | Vanilla + React | F/O | Tick path 160 ms; thumb spring `{duration:0.35,bounce:0.15}` → `linear()`; press scale 0.97 |
| Markdown task checkbox (Write and Read) | `base/checkbox` | Vanilla (preview script) | F | Tick 140 ms; completed text dims 200 ms (never strike) |
| Code blocks in Read | `buttons/copy` (icon swaps to check), `primitives/animate/code-block` styling (no typing animation) | Vanilla (preview) | O | Icon swap 150 ms |
| Search hits in Read | `effects/highlight` | Vanilla (preview) | O | Highlight sweep 200 ms on jump only |
| Reading progress in Read | Dropped (guide A10) | — | — | — |
| Settings home | `radix/tabs` / `animate/tabs` (sliding indicator), `base/switch`, `radix/radio-group`, `base/accordion` | React webview (Margin settings); JSON/advanced opens the normal editor | O | Tab indicator slide 220 ms spring |
| About | Animated mark + `texts/rolling` version number + `buttons/copy` (copy version info) | React webview | R | Once per open |
| What's new (after update) | `texts/splitting` heading, `effects/fade` list | React webview | R | Once |
| Word count (only if the Extras status line is on) | `texts/sliding-number` | Vanilla | F | 120 ms per digit, only after typing pauses 600 ms |
| Empty page (new draft) | None: a white page and the caret | — | K | Caret fade per guide §2.7 only |
| Product icons on occasional surfaces | Animated Lucide-style icons (Animate UI icons: triggers on hover/focus) ported to Margin's glyphs | Vanilla SVG + CSS | O/R | Hover-only under `(hover:hover) and (pointer:fine)`, 150–300 ms |

## Deliberately not animated (gate verdicts)

| Surface | Verdict |
| --- | --- |
| Command palette, quick open (Ctrl+P), find widget | **K: never animate** (keyboard, 100+ a day). Modern feel comes from spacing, type and instant response. |
| Typing, caret movement, selection, scrolling the document | **K.** The page never moves for style. |
| Shelf rows hover and keyboard navigation | **F: no motion**; hover fill appears instantly. |
| Switching Write / Read / Code | **K**: no character moves (guide M3); instant swap. |
| Terminal output | Functional content; no motion. |

## Rejected from the catalog (fail the gate or the slop list)

`backgrounds/*` (bubble, fireworks, gradient, gravity-stars, hexagon, hole, stars), `buttons/liquid`, `buttons/ripple`, `effects/magnetic`, `effects/tilt`, `effects/particles`, `effects/shine`, `texts/gradient`, `texts/shimmering`, `animate/cursor`, `community/radial-*`, `github-stars*`, `avatar-group`, `user-presence-avatar`. Reasons: decoration without purpose, gradients and glow are on the slop list, and nothing in Margin is social or collaborative. `texts/typing` is allowed only in the launch video, never in the app.

## Build order

1. `kit/easing.ts` (Motion springs → `linear()`), `kit/motion.ts` (thin WAAPI helpers: enter/exit from trigger, respect `prefers-reduced-motion` and `workbench.reduceMotion`), and the kit tokens in the Margin themes.
2. Ports in order of reach: popover + menu (title menu, mode picker, context menus) → tooltip → dialog/alert-dialog → checkbox/switch/radio → sidebar/accordion/files for the shelf → toasts → Read-view pieces.
3. React surfaces: first boot (M3), then Settings home, About, What's new.

Acceptance per port: side-by-side screen recording against the Animate UI docs demo (same anatomy and timing, Margin colors), reduced-motion variant, keyboard path, no layout shift, and 60 fps on the dev build.

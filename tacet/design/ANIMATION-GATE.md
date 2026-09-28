# Animation gate (Tacet)

Owner-supplied reference, 2026-09-27, adapted from the "find-animation-opportunities" skill (based on Emil Kowalski, "You Don't Need Animations", https://emilkowal.ski/ui/you-dont-need-animations). Every motion in Tacet passes this gate. Owner direction on top: the logo and icons animate and Tacet has a quirky personality, spent in the delight budget below.

## The gate (all four, in order)

1. **Frequency.**
   - 100+ times a day (keyboard shortcuts, command palette, core navigation): no animation, ever.
   - Tens a day (hover, list navigation, frequent toggles): none, or near-imperceptible (fast, subtle).
   - Occasional (dialogs, menus, toasts, settings): standard animation.
   - Rare or first-time (first boot, empty states, success, About, launch mark): **the delight budget. Quirk lives here.**
2. **Purpose**, named explicitly: feedback, spatial consistency, state indication, preventing a jarring change, explanation (first boot and marketing only), or delight (rare tier only). "It looks cool" fails.
3. **Speed.** UI under 300 ms: press 100–160 ms; tooltips and small popovers 125–200 ms; menus 150–250 ms; dialogs 200–500 ms; first boot and marketing may be longer.
4. **Function.** Nothing the user is reading or acting on moves for style. The page never moves.

## Rules of craft

- Animate `transform` and `opacity` only. Never scale from 0; enter from `scale(0.95–0.97)` + `opacity: 0`.
- Easing vocabulary: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`, `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)`. Springs for gestures only: `{ type: "spring", duration: 0.5, bounce: 0.2 }` (bounce 0.1–0.3).
- Popovers grow from their trigger (`transform-origin` at the trigger); dialogs stay centered.
- Exit the same way you entered. CSS transitions (retarget smoothly) over keyframes for anything that can be re-triggered.
- Hover motion only under `@media (hover: hover) and (pointer: fine)`.
- Reduced motion: gentler, not necessarily zero (opacity only, no travel); the first boot becomes instant.
- Every proposal lists rejected candidates and why. A short list of high-conviction motion beats a wishlist.

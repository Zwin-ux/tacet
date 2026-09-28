# White, iconic, and precise

## Design thesis

Tacet should look unmistakable at a glance while disappearing behind a paragraph. The identity is a white page with a single blue margin. Premium comes from typography, measured spacing, trustworthy feedback, and a small number of controls. White is a material choice, not permission to use illegible pale-gray text.

Apple-level craft means direct response, predictable placement, clear state, and careful type. Windows conventions govern title-bar controls, shortcuts, dialogs, snapping, accessibility, and installer behavior. Do not copy macOS traffic lights or claim native macOS behavior.

## Tokens

| Token | Light value | Role |
| --- | --- | --- |
| `canvas` | `#FFFFFF` | Main document |
| `chrome` | `#FAFBFC` | Toolbar / low-contrast structural strip |
| `shelf` | `#F6F7F9` | File navigation |
| `ink` | `#22252B` | Primary text |
| `secondary` | `#596272` | Supporting labels with real contrast |
| `muted` | `#737D8B` | Nonessential metadata; verify contrast at actual size |
| `line` | `#E6E9EE` | Subtle structural separation, not sole interactive boundary |
| `control-border` | `#909AA8` | Boundaries where 3:1 contrast is required |
| `accent` | `#2167D5` | Selected/focused/linked state |
| `accent-hover` | `#1756B6` | Hover on filled action |
| `selection` | `#E8EFFB` | Selection background, with dark foreground |
| `warning-surface` | `#FFF8E8` | Recoverable file warning |
| `warning-ink` | `#795314` | Warning text/icon |
| `danger` | `#B32932` | Destructive/error text, never decorative |

Do not use accent as a full-page wash. No product gradients, glows, avatar rings, floating dashboard cards, or decorative status pills. Thin subtle separators may be low contrast only when not needed to identify an interactive control. Contrast is measured on final composited pixels.

## Typography

Use the platform system stack: `Segoe UI Variable`, `Segoe UI`, `system-ui`, sans-serif on Windows. Do not redistribute Apple's fonts. Code: `Cascadia Code`, `Consolas`, monospace, with an available fallback.

| Tier | Size / line height at 100% | Weight / tracking |
| --- | --- | --- |
| App identity | 16 / 22 | 600, slightly tight |
| Toolbar title | 13 / 18 | 600, normal |
| Sidebar row | 13 / 20 | 400–500, normal |
| Supporting label | 12 / 18 | 400, normal; never tiny uppercase gray |
| Document body | 17 / 29 | 400, normal |
| H1 | 34 / 41 | 650–700, `-0.025em` |
| H2 | 24 / 32 | 600–650, `-0.018em` |
| H3 | 19 / 28 | 600, `-0.01em` |
| Code block / source | 14 / 23 | 400, normal |

Document font scale is adjustable. Use relative units, wrap labels, and test 125/150/200% display scaling. Arabic and mixed scripts need appropriate fallback and line height. H1 is a document title, not a 72 px marketing hero. A longer title wraps naturally without colliding with chrome.

Offer Increase/Decrease/Reset Document Text Size commands plus Ctrl+wheel over the document, with an accessible setting to disable wheel zoom. Keep this separate from whole-window zoom. Preserve the reading position and apply the prose preference consistently to Write and Read; Code retains its own font setting. Expose a visible reset to the default 17 px. Rich-view text zoom and high contrast need actual native qualification, given the upstream reports in the research notes.

## Geometry and rhythm

Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64. Default toolbar: 52 logical px; source of flexibility is text wrapping and overflow, not ad hoc shrinking. Sidebar starts at 236 px. Document content is 680 px maximum, 56–72 characters per line depending on font. At wider windows increase surrounding space, not line length.

Initial top document inset: 48 px below the toolbar; bottom breathing room at least 64 px. Paragraph separation: 16 px. Section gap: 32 px. Heading and following paragraph stay visually grouped. Lists use normal document rhythm rather than tall card rows.

Corner tiers: 5 px small control, 8 px selection/palette rows, 12 px popover/modal. Document surface is not a rounded card floating in a gray dashboard. Shadows are restricted to overlapping surfaces, not every panel.

## Icon and identity

Original mark: upright white sheet, folded upper-right corner, one narrow blue line along its left margin. No sparkle, brain, magic wand, robot, or chevron pretending to be a page. The recognizable silhouette must work at 16, 24, 32, 48, 128, 256, and 512 px. At 16 px simplify fold/detail and snap strokes to the pixel grid. App tile and monochrome toolbar mark are separate exports of the same design.

UI icons: use the existing Codicons outline family initially, audit line weight at actual Windows scaling, and replace only where the product requires a custom shape. Aim for visually even 1.5 px strokes around 20 px. A 20 px drawing can have a 32–36 px click target. Touch-adapted surfaces need at least 44 px.

The [supplied SVG](../concepts/tacet-mark.svg) is a design seed, not a finished multi-resolution app icon or signed Windows resource. Final asset production includes ICO, taskbar, installer, association icons, and high-contrast variants.

## Components

**Mode switcher:** three compact equal-height segments, total width about 204 px. Selected segment uses white on a pale track, restrained outline, dark label. Read is always visibly distinct from Write. Buttons expose pressed state and keyboard arrow movement. Programming files display Code with no misleading disabled writing modes.

**File row:** one title, at most one secondary line, one small icon. Selected background is quiet blue. Long filenames ellipsize with full name/path in tooltip and accessibility description. No hover-only essential actions.

**Save status:** stable-width text area. No constant green badge or flashing spinner. Only meaningful transitions announce themselves. Failed save is persistent until resolved; it cannot disappear with a short toast.

**Search palette:** one input, visible scope, list results, brief keyboard hint. Real match highlights; no search suggestion cards. Empty, loading, unavailable, and no-match states share the same frame.

**Notice:** inline region with icon, specific sentence, and relevant actions. Keep document readable. Modal only when a decision must block an irreversible action.

**Formatting:** contextual to selection; accessible via keyboard and menu. Selection-based controls anchor near selection, avoid covering content, and dismiss predictably. No formatting ribbon by default.

## Motion and feedback

Pointer-down responds immediately. Use opacity/color transitions around 100–140 ms. Optional shelf/popover motion can use a critically damped response around 0.3 s, always interruptible. No bounce on a button or file open, no opening splash animation, no artificial delay to show polish.

Reduced motion removes spatial transitions. Reduced transparency uses solid surfaces. High contrast uses system colors and visible boundaries. Do not animate text reflow or caret placement when switching views. Prefer preserving a source anchor to visual theatrics.

## Visual review gates

1. One blank note looks intentional, without filling the space with onboarding.
2. One long unformatted README is readable without hand-curated content.
3. All controls remain usable at 480 px width and 200% text scaling.
4. A keyboard user can always locate focus; no focus ring disappears into the white theme.
5. UI/body typography has clear hierarchy without excessive weight jumps.
6. The sidebar never becomes a second dashboard.
7. No repeated app/document headline competes with the actual first heading.
8. Native Windows chrome, snapping, taskbar identity, and context menus feel consistent.
9. Verify actual dimensions and contrast. Do not copy generated image typography blindly.

## Concept art corrections

The generated concepts establish material, spacing, and identity. They contain intentional/non-authoritative illustration shortcuts: some sidebar entries are grouped incorrectly, source checkboxes appear visually rendered, and the code board has a decorative exterior backdrop. Production must use Drafts/Recent Files/Folders correctly; Code displays literal `[x]`; the app does not generate the desktop wallpaper. Read-time/word-count numbers in art are illustrative. The written contract overrides all image mistakes.

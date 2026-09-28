# Margin Welcome (spike)

First-boot welcome screen for Margin, hosted in a webview. This is the technical
spike that proves Animate UI (React + Tailwind CSS + Motion) renders and animates
inside a Margin dev build.

## Layout

- `src/extension.ts`: extension host side. Command `margin.welcome.show` opens a
  webview panel with a strict CSP (`default-src 'none'`, nonce'd module script,
  `style-src`/`img-src` limited to `webview.cspSource`). On Continue it sets
  `workbench.colorTheme` (Margin Light/Dark, fallback Light/Dark Modern) or, for
  System, `window.autoDetectColorScheme` plus the preferred light/dark themes.
- `webview/`: Vite + React 19 + TypeScript + Tailwind v4 + Motion, shadcn
  (`components.json`) with Animate UI components from `https://animate-ui.com/r/`.
- `media/`: the prebuilt bundle (`welcome.js`, `welcome.css`). It is committed, so
  the product build does not need Vite.

## Rebuild the webview bundle

```sh
cd extensions/margin-welcome/webview
npm install
npm run build        # tsc typecheck + vite build into ../media
```

The build emits one JS file and one CSS file: no code splitting, no hashed names,
no CDN, no remote fonts (the shadcn Geist font import was removed; the page uses
`--vscode-font-family`).

Add more Animate UI components with:

```sh
npx shadcn@latest add "https://animate-ui.com/r/<name>.json"
```

Registry index: `https://animate-ui.com/r/registry.json`.

## Bundle size (2026-09-27)

| File | Raw | Gzip |
| --- | --- | --- |
| `media/welcome.js` | 423 KB | 137 KB |
| `media/welcome.css` | 22 KB | 4.6 KB |

## Verify

`node margin/tools/spike-animate-ui.mjs [--skip-prelaunch] [--reduced-motion]`
launches the dev build with a scratch profile, drives it over CDP only, and writes
`margin/evidence/spike-animate-ui-*.png` and `.json`.

## License note

Animate UI (https://animate-ui.com) is licensed MIT + Commons Clause. Use inside
an application is allowed; selling the components themselves is not. The files in
`webview/src/components/animate-ui/` come from its registry. Keep the Animate UI
copyright and license notice with them if they are redistributed.

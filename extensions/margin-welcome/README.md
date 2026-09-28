# Tacet First Boot

Tacet's first-time setup (design spec: `margin/design/FIRST-BOOT.md`, milestone M3). Four short
pages on the same white page the user will write on: Look (theme, text size), Bring your settings
(copy from VS Code; shown only when a VS Code, VS Code Insiders, VSCodium, Cursor or Windsurf user
folder exists), Where your notes live, Extras (all off). Enter continues, Esc skips, and the setup
ends on a new draft with the caret.

## Behavior

- Runs once, on the first launch without a file or folder argument. The completion flag is
  `margin.firstBoot.completed` in the extension's global state. `Tacet: Show Setup` runs it again.
- Each step writes only its own settings, when the user continues. `Skip setup` keeps what was
  already confirmed, undoes an unconfirmed theme preview, and writes nothing else except the flag.
- Settings written: `window.autoDetectColorScheme`, `workbench.preferredLightColorTheme`,
  `workbench.preferredDarkColorTheme` or `workbench.colorTheme`; `margin.document.fontSize` (only when
  changed); imported settings and keybindings; `margin.notes.folder`; for Extras that are switched on,
  `workbench.statusBar.visible`, `margin.code.lineNumbers`, `margin.terminal.shortcut`,
  `margin.spelling.enabled`. The `margin.*` settings are registered here; their consumers land in
  M4 to M6.
- Import (`src/importer.ts`) only reads the source folder. Settings: an allowlist (`editor.*`,
  `files.*`, `search.*`, a few terminal font keys, language blocks) minus anything AI, account, git,
  debug, tasks, remote, sync or extensions related, minus keys Tacet sets itself, and only keys
  Tacet registers. Keybindings: entries whose command exists in Tacet, appended to Tacet's user
  `keybindings.json`. JSONC with comments and trailing commas is read; a file that cannot be parsed
  is reported, not fatal. `Tacet: Show Import Report` lists what was copied and what was not.
- Notes (`src/notes.ts`): the default is `Documents\Notes` (the real Documents shell folder from the
  registry). If OneDrive syncs Documents, the page says so and offers `%USERPROFILE%\Tacet`.
  The folder is made when setup finishes.
- `MARGIN_FIRST_BOOT=off` in the environment stops the automatic run (for harnesses that open a bare
  window). `MARGIN_FIRSTBOOT_DOCUMENTS` and `MARGIN_FIRSTBOOT_HOME` replace the Documents and home
  folders so tests never read the owner's real folders or registry.

## Layout

- `src/`: extension host side (webview panel with a strict CSP; init data and all strings are
  rendered into the page, so the first frame needs no round trip). Strings use `vscode.l10n`.
- `webview/`: a separate npm project. Vite + React 19 + TypeScript + Tailwind v4 + Motion, with
  Animate UI primitives (`src/components/animate-ui/`) restyled to Tacet tokens. Colors come from
  the host theme's `--vscode-*` variables.
- `media/`: the prebuilt bundle (`welcome.js`, `welcome.css`). It is committed, so the product build
  does not need Vite. Packaging bundles `src/extension.ts` to `dist/extension.js` (`esbuild.mts`).

## Rebuild the webview bundle

The webview has its own dependencies; install them separately from the repo:

```sh
cd extensions/margin-welcome/webview
npm install
npm run build        # tsc typecheck + vite build into ../media
```

Add more Animate UI components with `npx shadcn@latest add "@animate-ui/<name>"` (registry index:
`https://animate-ui.com/r/registry.json`). Keep only the primitives and restyle them in
`webview/src/controls.tsx`; Animate UI's demo look (gradients, spring overshoot, hover scale) is not
used. Import Radix parts from `@radix-ui/react-*`, not the `radix-ui` umbrella.

## Bundle size (2026-09-27)

| File | Raw | Gzip |
| --- | --- | --- |
| `media/welcome.js` | 359 KB | 114 KB |
| `media/welcome.css` | 14 KB | 4 KB |

Down from 423 KB / 137 KB in the spike: per-part Radix packages, no `cn`/tailwind-merge, no lucide,
and Motion through `LazyMotion` + `domAnimation` (`webview/src/lib/motion-lazy.ts`, aliased in
`vite.config.ts`). React DOM is 202 KB of what is left.

## Verify

`node margin/tools/first-boot.mjs [--skip-prelaunch] [--only=a,b,c,d]` launches the dev build with
fresh scratch profiles, drives it over CDP only, and writes `margin/evidence/m3-*.png` and
`m3-first-boot.json`.

## License note

Animate UI (https://animate-ui.com) is licensed MIT + Commons Clause: use inside an application is
allowed; selling or redistributing the components themselves is not. The notice is kept in
`webview/src/components/animate-ui/LICENSE.md`. The registry files there and in `webview/src/hooks/`
and `webview/src/lib/get-strict-context.tsx` are excluded from the repo's copyright-header and
indentation checks (`build/filters.ts`).

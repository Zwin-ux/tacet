# Tacet — notes for coding agents

Tacet is a calm, AI-free writing app built on Code - OSS. The product plan is `tacet/SHIP-PLAN.md`; specs live in `tacet/docs/` and the design system in `tacet/design/`.

- **Never add AI features**, network calls, telemetry, accounts or a marketplace. The product promise depends on it.
- **Text safety first.** Changes near saving, drafts or the Markdown page (`extensions/markdown-language-features`) must keep every byte the user typed. Prove it with the smoke gate.
- Build: `npm ci` (Node from `.nvmrc`), `npm run compile`. Run: `./scripts/code.sh` (macOS) or `scripts\code.bat` (Windows).
- Check: `node tacet/tools/smoke.mjs <tag> --skip-prelaunch` drives the dev build over CDP (no OS-level input) and must pass on the platform you changed.
- Headers: new Tacet files use the Tacet copyright header (see CONTRIBUTING.md); upstream files keep Microsoft's.
- Upstream conventions apply: tabs, layered `src/vs` imports (`common` → `browser`/`node` → `electron-*`), no new `.js` files.

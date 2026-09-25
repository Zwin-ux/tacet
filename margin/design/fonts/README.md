# Bundled fonts

Downloaded 2026-09-24 from the official upstream repositories, unmodified. Both are SIL Open Font License 1.1, which permits bundling and redistribution with software (the license text must ship with the fonts; the fonts may not be sold alone; modified versions may not use the Reserved Font Names).

| Folder | Files | Version / source | License | Reserved Font Name | Use in Margin |
| --- | --- | --- | --- | --- | --- |
| [cascadia-code/](cascadia-code/) | `CascadiaCode.ttf`, `CascadiaCodeItalic.ttf` (variable, wght 200 to 700) | Release 2407.24, https://github.com/microsoft/cascadia-code/releases/tag/v2407.24 | [OFL 1.1](cascadia-code/LICENSE) | Cascadia Code | Code view, terminal, inline code, fences |
| [source-serif-4/](source-serif-4/) | `SourceSerif4Variable-Roman.ttf`, `SourceSerif4Variable-Italic.ttf` (variable, wght + opsz) | `release` branch, https://github.com/adobe-fonts/source-serif (VAR/) | [OFL 1.1](source-serif-4/LICENSE.md) | Source | Optional document typeface (Settings → Typeface → Serif) and print |

Not bundled: **Segoe UI Variable** (UI and default document face). It is a Windows 11 system font, not redistributable, and does not need to be; Windows 10 falls back to Segoe UI. See DESIGN-GUIDE.md §9 for the full decision and the rejected alternatives.

Release checklist: add both fonts to `ThirdPartyNotices.txt` / `cglicenses.json`, ship the license files next to the font files, and keep file names unchanged.

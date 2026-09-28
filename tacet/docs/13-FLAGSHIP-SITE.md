# 13 — Tacet as the flagship on mazenzwin.com

Status: requirements, 2026-09-27. Owner direction 2026-09-28: Tacet replaces Atlas as the "big project" on mazenzwin.com. Nothing in this file has been built or deployed. The site repo, Atlas and hosting were read only.

Inputs: `margin/SHIP-PLAN.md` (Open-source launch, M10, M11), `margin/design/DESIGN-GUIDE.md` (§1, §2, §2.10), `margin/design/CRITICISM.md` (§1.4, §5, §9, C11), `margin/design/assets/README.md`, `margin/design/assets/launch/src/launch.html`, `margin/evidence/m3-*.png`, `margin/tools/smoke.mjs`, `margin/docs/10-REBUILD.md`.

---

## 1. Findings

### 1.1 Where the site lives

| Fact | Value | How I know |
| --- | --- | --- |
| Local source | `%USERPROFILE%\mazenzwin` | Only folder on the machine (outside agent transcripts) that contains `mazenzwin`. `README.md` line 1, `AGENTS.md` line 1. |
| Git remote | `https://github.com/Zwin-ux/mazenzwin.git`, branch `main`, **private** | `git remote -v`; `gh repo view Zwin-ux/mazenzwin` → `PRIVATE`. |
| Local vs remote | `main` = `origin/main` = `3e28f0e` ("Remove the desk game, centre the page, add scroll reveal", 2026-09-27). Only `rive/` is untracked. | `git rev-parse main origin/main`, `git status`. |
| Framework | None. Static `index.html` (242 lines) + `styles.css` (330 lines) + `assets/*.js`. No build step. | `AGENTS.md` "Stack": "Static `index.html` + `styles.css`. Railpack serves the folder." `Staticfile` = `# Railpack static site`. |
| Deploy target | Railway project `mazenzwin` (`0db87b7e-97a8-4bb3-bbf7-53bcbbed9dcb`), service `web`, env `production`. Deployed with `railway up … --service web` from the repo folder. | `AGENTS.md` "Hosting"; `STATE.md` lines 5–8; `.grok/skills/ship-site/SKILL.md`. Whether a GitHub push also auto-deploys was not verified. |
| Domain | `www.mazenzwin.com` is canonical (CNAME to `hq2zkv9m.up.railway.app`). Apex `mazenzwin.com` is a Namecheap URL redirect to www. Registrar Namecheap. | `STATE.md` lines 9–13; `index.html` line 11 (canonical). **Probe 2026-09-27:** `https://www.mazenzwin.com` → 200; `https://mazenzwin.com` timed out once in the headless browser. Recheck the apex redirect before launch. |
| Live = local | The live page text and links match `index.html` at `3e28f0e`. | gstack browse `text` + `links` on www.mazenzwin.com, 2026-09-27. |
| Routes | One page. `/atlas` → 404, `/margin` → 404. `sitemap.xml` lists only `/`. | browse probe; `sitemap.xml`. |
| Design rules | Plain HTML page: white, Times serif 19px, blue underlined links, one centred column, **no project logos, no game** (owner redesign 2026-09-27). Hard stop: no generic SaaS homepage (hero + dual CTAs + mockup + cards). | `DESIGN.md` lines 1–8; `AGENTS.md` "Hard stops". `tests/page.cjs` asserts the page has no `class="mark` (no logos). |

### 1.2 Where Atlas appears

Atlas is **not** the flagship on the current page. Kit is the first and largest entry. Atlas is a one-line footnote below the project list. So "replace Atlas" in practice means: **add Tacet as the new lead entry and retire the Atlas footnote.**

| # | File:line | What | Presentation |
| --- | --- | --- | --- |
| A1 | `mazenzwin/index.html:230-233` | `<p class="also rise">Also building <a href="https://github.com/Zwin-ux/atlas">Atlas</a>, a Census-based map app for ChatGPT.</p>` | The only visible Atlas element. Text only: no image, no logo, no route. Styled by `.also` (`styles.css:245-249`: top rule, 2.6rem gap). The link goes off-site to the public repo `github.com/Zwin-ux/atlas`. |
| A2 | `mazenzwin/index.html:9` | `<meta name="description">` "…building Kit, …, plus Parabola, ScriptLens, and Atlas." | SEO description. |
| A3 | `mazenzwin/index.html:19` | `og:description` "…Kit, Parabola, ScriptLens, and Atlas." | Social card text. |
| A4 | `mazenzwin/index.html:26` | `twitter:description`, same text as A3. | Social card text. |
| A5 | `mazenzwin/AGENTS.md:66` | `- [atlas](https://github.com/Zwin-ux/atlas)` under "Public repos on the desk". | Agent instructions. |
| A6 | `mazenzwin/STATE.md:15` | "Kit / ScriptLens / Atlas marks" | Stale: marks were removed 2026-09-27 (`STATE.md` line 20). |
| A7 | `mazenzwin/DESIGN.md:55` | "Atlas is the census-plate icon." | In the "Earlier direction, kept for history" section. |
| A8 | `mazenzwin/.grok/skills/brand-marks/SKILL.md:3,13` | Skill description and "Atlas: census-plate icon." | Agent skill. |
| A9 | `mazenzwin/assets/logos/README.md:12` + `assets/logos/atlas.svg` | Provenance of the Atlas mark (from `Documents/Atlas/assets/brand/atlas-icon-light-simple.svg`). | File exists; **not referenced by the page**. |
| A10 | `mazenzwin/docs/specs/2026-09-19-desk-demolition-design.md:39` | "Kit / Parabola / ScriptLens articles; Atlas" | History spec. Leave as is. |

No Atlas CSS, image or route is live. `/atlas` has never existed, so **no site URL can break** when Atlas leaves the page. The only outbound link is to the Atlas GitHub repo, which stays public.

Atlas itself: local repo `%USERPROFILE%\Documents\Atlas` (branch `main`, remote `https://github.com/Zwin-ux/atlas.git`, public, description "ChatGPT US Census atlas…"). Related folders: `Documents/Atlas-WebMCP`, `Downloads/Atlas-WebMCP-Codex-Harness`, `atlas-alpha-engine-beta-checkpoint`.

### 1.3 How the current entries are built (patterns to reuse)

- **Kit** (`index.html:145-166`): `<h3>`, a 2-sentence pitch, one 740×270 still (`.kit-shot`), an install line in `<code>`, a `.links` row (GitHub · npm · What's new).
- **Parabola** (`index.html:168-185`): a looping preview clip (`.preview`: webm + mp4 + jpg poster, still image under reduced motion; `styles.css:174-194` and `:317-322`) and one "Play" link.

The Tacet entry uses these two patterns. The desk needs no new component type.

### 1.4 Tacet facts that limit what the site can claim today

| Fact | Evidence | Consequence for the site |
| --- | --- | --- |
| `github.com/Zwin-ux/margin` does not exist. | `gh repo view` → "Could not resolve". SHIP-PLAN line 23: create at M11, owner-confirmed. | No GitHub link, no star badge and no present-tense "open source" claim until M11. |
| No installer, no signing certificate, no release. | SHIP-PLAN M10 "Not started"; owner decisions lines 117–121. | No Download button and no SHA-256 until M10. |
| Current screenshots still say "Code - OSS Dev" in the window title. | `margin/evidence/m3-1-look.png`, title bar "Setup - Code - OSS Dev". Title-bar icons are still VS Code chrome. | Do not publish `m3-*.png` as they are. Recapture after M2 identity lands. |
| Launch and typing budgets are not measured. | CRITICISM R12; SHIP-PLAN M9 "Not started". | No "instant", "fast" or number claims until M9 publishes measurements. The pillar "Instant" in `launch.html:147` must wait. |
| No-network audit not run on a packaged build. | SHIP-PLAN M10, gate G7. | The privacy statement is a goal until M10 and a fact after. |
| The smoke gate exists and is real. | `margin/tools/smoke.mjs` (CDP + Playwright, no OS input; required checks launch, writingLayout, richEditor, typeSave, undo, typingCases, terminal, noGit); `evidence/r1b-finish-*-smoke.json`. | The engineering story can show this now. |
| AI and git are removed at source, not hidden. | `docs/10-REBUILD.md` "What is deleted from source"; `evidence/w1-ai-inventory.md`; commits 1f27c0b7 (W1 AI removal), f00699ee (R1b git removal). | The engineering story can show this now, with links to the diff once public. |

---

## 2. Requirements

Each requirement has an ID and an acceptance check. "Now" = can ship before M10. "M10" and "M11" = gated on that milestone in `SHIP-PLAN.md`.

### 2.1 The desk entry on mazenzwin.com

**FS-1 — Tacet is the first project on the desk.** (Now)
Add `<article class="project rise">` for Tacet as the first child of `<section class="personal">` (`index.html:142`), above Kit. Use the Kit/Parabola markup only. No logo next to the name (`DESIGN.md` rule; the `tests/page.cjs` "no project logos" check must stay green).
*Accept:* the first `<h3>` under "Personal projects" is `Tacet`; `node tests/page.cjs` passes; the entry adds no new CSS class except an optional `.margin-shot` that copies `.kit-shot`.

**FS-2 — Headline and pitch.** (Now)
- Heading: `Tacet` (the name only; no tagline in the `<h3>`).
- Pitch (lead with reading and safety, per CRITICISM C11; "no AI" is a supporting fact, never the first idea):
  > A Windows editor for Markdown and text files. It shows Markdown as a clean page, keeps the source one key away, and never changes your text on its own. No AI, no account.
- Status line directly under the pitch, in the muted color:
  > In progress. Open source at 1.0.

*Accept:* the pitch is at most 3 sentences and 40 words; the first sentence does not contain "AI"; the status line is present while no release exists; no word from the FS-18 banned list.

**FS-3 — The Atlas footnote is retired.** (Now, same commit as FS-1)
Remove `index.html:230-233` (`p.also`), or replace it per the Atlas decision (§4 item 2). Update the meta text at `index.html:9`, `:19` and `:26` to name Tacet first and drop Atlas. Example description: "Mazen Zwin is a software engineer building Tacet, a Windows editor for Markdown and text files, plus Kit, Parabola and ScriptLens."
*Accept:* `grep -i atlas index.html` returns nothing (or only the one "Earlier" line if §4 item 2 option (b) is chosen); all three description strings start their project list with Tacet.

**FS-4 — Visual on the desk.** (Now: still. M10: clip.)
- Now: one still, 740 px wide (the `.kit-shot` slot). Make it from `margin/design/assets/launch/margin-banner-light.png`, cropped to the window only (no wordmark: the desk bans logos), or from a real capture if M2 has landed. The alt text says honestly what it is: "Design of the Tacet window: a white page titled 'A quieter morning' with a task list" (design render) or "Tacet on Windows 11: …" (real capture).
- M10: replace it with a 6–10 s loop captured from the real build over CDP (the Parabola `.preview` pattern: webm + mp4 + jpg poster, still under `prefers-reduced-motion`). Content: double-click a `.md` in Explorer → rendered page with the caret → Ctrl+Alt+3 source view → back. No AI video of the product (SHIP-PLAN line 28).

*Accept:* the still is ≤ 120 KB webp with `width`, `height` and `loading="lazy"`; the clip is ≤ 1.5 MB webm, plays muted inline and stops under reduced motion (same checks as Parabola); no "Code - OSS" text is visible anywhere in the frame.

**FS-5 — "Why I built it" (3–4 sentences, owner voice).** (Now; the owner edits the words)
Draft for the owner to rewrite:
> Notepad added Copilot and a sign-in, then shipped a bug where a Markdown link could run a program (CVE-2026-20841). VS Code users keep asking for an AI switch that stays off. I wanted a Notepad-simple editor with VS Code's text engine, so I forked Code OSS and removed what I did not want from the source.

Placement: the desk keeps only the pitch. This paragraph goes on the landing page (FS-8) and in the README.
*Accept:* every factual claim has a source already listed in `CRITICISM.md` §1.1 or §2.1; the owner signs off on the wording.

**FS-6 — Engineering depth.** (Now: landing page "How it is built" section; one line on the desk)
Desk, one sentence: "A fork of Code OSS 1.139 with AI, git, debugging, remote and the marketplace removed from the source."
Landing page and README show four items, each with evidence:
1. **Removal at source in a very large codebase.** Show a measured size of the pinned tree and the removal diff: files and lines deleted, and the features deleted (list in `10-REBUILD.md` line 20). Do not print "1M+ lines" until it is measured. Measure at the pin `2242ebbb` and at the release tag with one stated command (for example `git ls-files '*.ts' | xargs wc -l`, or `cloc` at a stated version), and print the command next to the number.
2. **Fork discipline.** Pinned upstream tag and commit; stable extension-API shapes kept as inert stubs so built-in extensions still load (`10-REBUILD.md` line 22); Microsoft copyright headers and `ThirdPartyNotices.txt` kept; how upstream fixes are brought in (link to a CONTRIBUTING section).
3. **Test and smoke tooling.** `margin/tools/smoke.mjs` launches a disposable profile, drives the renderer over CDP with Playwright, checks the bytes on disk after type, save and undo, runs a terminal command and asserts that git is gone (`noGit`). Show one real `*-smoke.json` result. Later: M9 fault injection and measured budgets.
4. **First boot as a React webview.** `extensions/margin-welcome`: Animate UI + Motion in a webview, restyled to Tacet tokens, keyboard-complete, reduced motion = instant (SHIP-PLAN line 17; `design/FIRST-BOOT.md`). Show the 4 steps as real captures after M2.

*Accept:* each item links to a file, commit or evidence JSON in the public repo (after M11), or says "source public at 1.0" (before); every number on the page has its command or file next to it.

**FS-7 — Links and status labels.** (Now / M10 / M11)

| Link | Now | M10 | M11 |
| --- | --- | --- | --- |
| Landing page (FS-8) | "About Tacet" | "Download" | "Download" |
| GitHub | none (the repo does not exist) | none | `github.com/Zwin-ux/margin` |
| Docs | none | a docs section on the landing page | repo `README.md` + `DESIGN.md` |
| Release notes | none | the v1.0.0 release notes | same |

Status label values over time: `In progress. Open source at 1.0.` → `1.0 for Windows x64.` → (M11) `Open source. MIT.`
*Accept:* every link on the page returns 200 on the day it ships (browse `links` plus a status probe); no label says "released", "1.0" or "open source" before the matching gate is green in `SHIP-PLAN.md`.

### 2.2 The Tacet landing page

**FS-8 — Landing page location (owner picks one; see §4).**

| Option | URL | For | Against |
| --- | --- | --- | --- |
| A. Route on the desk | `www.mazenzwin.com/margin/` (`margin/index.html` in the site repo) | No new hosting or DNS; same Railway deploy; builds the owner's name; can ship this week. | The desk's plain-HTML look (Times, blue links) and the `AGENTS.md` "no SaaS landing" stop clash with Tacet's own brand. The page needs its own stylesheet (Tacet tokens) in a repo whose rules are about the desk. |
| B. Subdomain | `margin.mazenzwin.com` | Own look; same registrar; a second Railway static service. | One more DNS row and certificate; still tied to the personal domain. |
| C. Own domain | a `margin…` domain (not checked; the trademark check is an open owner item, SHIP-PLAN line 118) | The product stands alone; best for an open-source project that outlives the portfolio. | Cost; the name check comes first; one more renewal. |
| D. GitHub Pages | `zwin-ux.github.io/margin` | Lives with the code; free; contributors can edit it. | Only after M11; weak URL. |

Recommendation: **A now** (a small "in progress" page in Tacet style, linked from the desk). **Move to C or B at M10** after the name check, with `/margin/` redirecting there (migration step 9).
*Accept:* the owner records the choice in `SHIP-PLAN.md` "Owner decisions in force".

**FS-9 — Hero.** (Now: design render. M10: real capture.)
Name + mark (the landing page may use the mark; only the desk bans logos), one line, one visual.
- Line (C11): "Markdown that reads well. Source one key away. Nothing changes your text. No AI."
- Visual now: `launch/margin-banner-light.png` / `-dark.png` in a `<picture>` with `prefers-color-scheme`. At M10: a real capture of the same scene, then the FS-4 clip.

*Accept:* the hero fits a 1440×900 viewport with no scroll; light and dark both render; the LCP image is ≤ 200 KB; no gradient, glow or device frame (DESIGN-GUIDE §1.4 slop list).

**FS-10 — Download with SHA-256.** (M10)
One button, "Download for Windows (x64)", linked to the release asset. Under it, in monospace: file name, size, version and SHA-256, plus a one-line check: `Get-FileHash .\Tacet-Setup-1.0.0-x64.exe -Algorithm SHA256`. Link to `SHA256SUMS`. If signed: the publisher name as Windows shows it. If winget exists: the `winget install` line.
*Accept:* the hash on the page equals the hash in `SHA256SUMS` and the hash of the downloaded file (checked by script, not by hand); the button names the platform; no second CTA competes with it. Before M10 the button is absent (not disabled, not a "coming soon" button).

**FS-11 — Screenshots, light and dark.** (M4 and later)
Four real captures, each light and dark, made by CDP page capture (the `smoke.mjs` method) on a clean profile with fixture text, never personal files: (1) Write view of a Markdown note, (2) Code view of the same file, (3) the Ctrl+P switcher, (4) a safety moment: a blocked `ms-*:` link notice, or a downloaded (Mark of the Web) file opening in Read.
*Accept:* no "Code - OSS", no VS Code activity bar or status bar visible; each image has alt text that says what the user sees; the same scene in both themes; captured from a tagged build (tag in the file name).

**FS-12 — "What's removed and why."** (Now)
A two-column table, *Removed* | *Why*:
- AI and chat — people asked for a switch that stays off (vscode#237819: "We should not have to say no again").
- Git and source control — Tacet is for notes and text; local history replaces it.
- Debugger, tasks, testing, notebooks — IDE features.
- Remote, marketplace, extension installs — network and supply-chain surface.
- Settings sync and accounts — no account, ever.
- Telemetry, experiments, surveys — privacy.

Closing line: "Removed from the source, not hidden behind a setting."
*Accept:* every row matches `10-REBUILD.md` line 20 or an owner decision in `SHIP-PLAN.md`; nothing listed as removed is reachable in the build the page describes (M1 gate).

**FS-13 — Privacy statement.** (Goal wording now; fact wording at M10)
- Now: "Tacet is built to make no network requests unless you open a link or load a remote image. It has no AI, no account and no telemetry."
- M10, after the no-network audit of the packaged build: "Tacet makes no network requests on its own. No AI. No account. No telemetry. How we checked →" The link goes to the audit method and result.

*Accept:* the M10 wording ships only with a linked G7 audit result; the statement names the two user-started exceptions (links, remote images) per CRITICISM R4/R5.

**FS-14 — FAQ.** (Now; 6–8 entries; 1–2 sentence answers)
Required: Is it free? · Does it run on Mac or Linux? (No. Windows x64 first.) · Is it VS Code? (No. It is built from Code OSS. It is not affiliated with Microsoft. "Visual Studio Code" is a Microsoft trademark.) · Can I install extensions? (No. Built-in only.) · Where are my notes? (Plain `.md` and `.txt` files in a folder you choose. Drafts are readable files.) · Why no git? · Can I edit CLAUDE.md, AGENTS.md and skill files? (Yes. Tacet edits them and runs nothing; `design/AGENT-FILES.md`.) · How do I report a security problem? (SECURITY.md.)
*Accept:* every answer is true for the build on the page; the trademark sentence matches SHIP-PLAN line 36.

**FS-15 — Open source and contribute.** (M11)
License (MIT, both copyright lines kept), a build-from-source block copied from the README (Node version, VS 2022 with Spectre libraries, `npm ci`, `npm run compile-client`), and links to CONTRIBUTING, ROADMAP, the good-first-issue label and SECURITY.
*Accept:* a fresh clone on a clean Windows VM builds with only the README steps (the M11 gate); every link returns 200.

### 2.3 Assets

**FS-16 — Asset list.**

| Asset | Exists? | Path / action | Needed by |
| --- | --- | --- | --- |
| App icon, 1024 PNG + SVG | Yes | `design/assets/icon/margin-app-icon.svg`, `margin-app-icon-1024.png` | Landing mark, favicon source |
| Favicon set (ICO, 16/32 PNG, SVG, 180 px touch icon) | Partly | Optical sizes exist (`margin-app-icon-16/24/32.svg`, `margin-mark-16.svg`). Make `favicon.ico` and the 180 px PNG. | Landing (FS-8) |
| README banner light/dark (1440×480) | Yes | `design/assets/launch/margin-banner-{light,dark}.png` | README, landing hero (now) |
| Pillars light/dark (1600×600) | Yes; copy must change | `launch/margin-pillars-*.png`. The "Instant" pillar claims speed before M9. Reorder to lead with reading and safety (C11) and re-render from `launch.html`. | README, landing |
| GitHub social preview 1280×640 | Yes; not usable yet | `launch/margin-social.png` says "Open source" and `github.com/Zwin-ux/margin`. Upload only at M11. Match the tagline to FS-9. | Repo settings (M11) |
| OG image 1200×630 | **No** | Add an `#og` composition to `launch/src/launch.html` (same window and line; no repo URL before M11). | Landing `og:image` |
| Desk still, 740 px | **No** | Crop of the banner window (now) → real capture (after M2). | FS-4 |
| Hero renders (Higgsfield) | Yes; reference only | `design/assets/hero/hero-0{1,2,3,5}*.png` are AI renders. Use as mood or background only, never as a "screenshot". | Optional landing art |
| Real screenshots light/dark (4 scenes) | **No** | CDP capture after M2/M4 (FS-11). | Landing, README |
| Demo clip 6–10 s + poster | **No** | CDP capture of the real build (SHIP-PLAN line 28: not AI video). webm + mp4 + jpg. | Desk (M10), landing, README |
| Animated mark | Yes | `design/assets/animated/margin-mark-draw.svg`, `margin-mark-draw.lottie.json` (880 ms draw, reduced-motion fade) | Landing hero, once per load |
| Motion studies | Yes; reference only | `design/assets/motion/mo-0*.mp4` (Kling / MiniMax). Not product footage. Do not publish as the app. | Internal |
| Launch video (optional) | **No** | Higgsfield for title cards and motion around real captures (SHIP-PLAN line 102). The app itself is always real capture. | M10 launch post |

*Accept:* each published asset has a row in `design/assets/README.md` with its source (hand-authored, CDP capture, or model + job id); no AI render is labelled or captioned as a screenshot.

### 2.4 SEO and social

**FS-17 — Metadata.**

| Field | Desk (`index.html`) | Landing page |
| --- | --- | --- |
| `<title>` | unchanged: `Mazen Zwin – Software Engineer` | `Tacet: a Markdown and text editor for Windows` (≤ 60 characters) |
| description | FS-3 | "Tacet shows Markdown as a clean page, keeps the source one key away and never changes your text. No AI, no account. For Windows x64." (≤ 160 characters) |
| canonical | unchanged | its final URL (FS-8) |
| `og:image` | none (keep `twitter:card` = `summary`) | 1200×630 PNG (FS-16), absolute URL, with `og:image:alt` |
| `twitter:card` | `summary` | `summary_large_image` |
| JSON-LD | `Person`, unchanged | `SoftwareApplication`: `name`, `operatingSystem: "Windows 11"`, `applicationCategory: "UtilitiesApplication"`, `offers.price: 0`; `softwareVersion` and `downloadUrl` only at M10 |
| `sitemap.xml` | add the landing URL (option A) | own sitemap (options B/C) |
| GitHub social preview | — | 1280×640 PNG, under 1 MB, uploaded at M11 |

*Accept:* the browse tool reads the `og:*` tags and the image URL returns 200 as `image/png`; title and description are within limits; `softwareVersion` is absent before M10.

### 2.5 Copy rules

**FS-18 — Copy.**
1. ASD-STE100 style: short sentences (≤ 20 words for steps, ≤ 25 for descriptions), active voice, present tense, one idea per sentence (`DESIGN-GUIDE.md` §2.10).
2. Do not over-explain. Do not narrate what the image shows.
3. Lead with reading and safety. "No AI" is the last item in a list, not the headline (CRITICISM C11). Do not position Tacet as "Notepad but better at everything"; it is the separate app for people who want more than Notepad (CRITICISM §1.4).
4. Banned: revolutionary, seamless, supercharge, unleash, effortless, magic, smart, blazing, reimagined, "built for the future", "your second brain", "Let's", "Oops", emojis, sparkles. No "fast", "instant" or "lightweight" before the M9 numbers exist.
5. Every claim is true for the build the page links to. Goals use "is built to"; facts use the present tense.
6. Describe Tacet as "built from Code OSS", never "a VS Code fork" as its first description (trademark and positioning).

*Accept:* a detect-only pass with the `no-ai-slop` skill finds nothing; a reviewer checks each sentence against rules 1–6 and logs the result.

---

## 3. Migration plan

Atlas has no route, image or CSS on the live site, so nothing needs a redirect. The steps keep the desk free of broken links and false claims at every point.

### Phase 1 — now (before M10)

1. **The owner decides** §4 items 1–5.
2. **Make the desk still** (FS-4): crop the window from `margin-banner-light.png` to a 740 px webp. Record it in `design/assets/README.md`.
3. **One site commit in `%USERPROFILE%\mazenzwin`** (under that repo's `AGENTS.md` rules, not by this lane):
   a. add the Tacet `<article>` first in `section.personal` (FS-1, FS-2, FS-4, the FS-6 one-liner, FS-7 "Now" links);
   b. remove `p.also` at `index.html:230-233`, or replace it per §4 item 2;
   c. update the meta descriptions at `index.html:9`, `:19`, `:26` (FS-3);
   d. update `AGENTS.md:62-66` (public repos list), `STATE.md:15` (stale marks line; add a Tacet line), `.grok/skills/brand-marks/SKILL.md:3,13` (drop Atlas), `assets/logos/README.md:12` (mark `atlas.svg` unused; keep the file);
   e. run `node tests/page.cjs`; open `tests/responsive.html`; check 480 px and 1440 px.
4. **If option A:** add `margin/index.html` as the in-progress landing page: hero (FS-9, banner), removed-and-why (FS-12), privacy in goal wording (FS-13), FAQ (FS-14), how it is built (FS-6), the status line, no download button. Add it to `sitemap.xml`. Give it a small stylesheet with Tacet tokens from `margin/design/tokens.json`.
5. **Deploy** with the site's ship skill (`railway up`, poll until `SUCCESS`). Verify with browse: `/` shows Tacet first; `/margin/` returns 200; every link returns 200; apex `mazenzwin.com` redirects to www.
6. Optional: a short post ("I am building Tacet in the open. Source at 1.0.") that links the landing page. No repo link yet.

### Phase 2 — M10 (release)

7. Replace the desk still with the real capture and clip (FS-4). Status → `1.0 for Windows x64.`
8. Landing page: add the Download block with SHA-256 (FS-10), real screenshots (FS-11), the privacy statement in fact wording with the audit link (FS-13), and `softwareVersion` / `downloadUrl` in JSON-LD.
9. If the landing page moves to its own domain or subdomain: keep `www.mazenzwin.com/margin/` as a permanent 301 to the new URL (a server redirect if Railpack allows it; otherwise a static page with `rel="canonical"` and a meta refresh). Update the desk links and the sitemap.

### Phase 3 — M11 (open source)

10. The owner creates `Zwin-ux/margin` (outward action, owner-confirmed) and uploads the social preview (FS-16).
11. Add the GitHub link to the desk and the landing page (FS-7), add the contribute section (FS-15), and change the status to `Open source. MIT.`
12. Add `Zwin-ux/margin` to `AGENTS.md` "Public repos on the desk". Run the link check again.

---

## 4. Owner decisions needed

1. **Landing location:** A `/margin/` on mazenzwin.com now (recommended), B `margin.mazenzwin.com`, C an own domain (needs the name/trademark check in SHIP-PLAN line 118), or D GitHub Pages after M11.
2. **Atlas:** (a) remove it from the page (the repo stays public), (b) keep one "Earlier:" line under the projects, or (c) keep it as a secondary entry with a short pitch. Recommendation: (b) for one release, then (a).
3. **Order on the desk:** Tacet above Kit? Kit is the only entry with a shipped release today (npm 2.0). Putting an unreleased project above it should be a deliberate choice.
4. **Launch timing:** ship the "in progress" entry now with a design render, or wait until M2 identity lands so the first public image is a real capture with no "Code - OSS".
5. **"Why I built it"** (FS-5): approve or rewrite in your own voice.
6. **Pre-release interest:** none, or a `mailto:` "Tell me when 1.0 ships" link (matches the postcard `mailto` pattern; no form, no backend).
7. Already open in SHIP-PLAN and needed by the site at M10: code-signing certificate and vendor, distribution channel (own site, winget, Store), update mechanism.

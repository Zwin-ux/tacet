# Contributing to Tacet

Thanks for helping. Tacet is small on purpose, so the best contributions make the page calmer, faster or safer.

## Before you start

- Read [`tacet/SHIP-PLAN.md`](tacet/SHIP-PLAN.md) for what is being built and in what order.
- Tacet has **no AI features, no accounts, no sync service and no extension marketplace**. Pull requests that add them will be closed.
- Losing or changing a user's text is the worst bug Tacet can have. Any change near saving, drafts or the Markdown page needs a test or a smoke run that proves text survives.

## Build

See [Build and run](README.md#build-and-run). You need Node from `.nvmrc`.

## Making a change

1. Fork, then branch from `main`.
2. Keep the change focused. One pull request, one idea.
3. Run `npm run compile` and the smoke gate on your platform:
   `node tacet/tools/smoke.mjs <tag> --skip-prelaunch`
4. New files you write carry the Tacet header:
   ```
   /*---------------------------------------------------------------------------------------------
    *  Copyright (c) Mazen Zwin and Tacet contributors. All rights reserved.
    *  Licensed under the MIT License. See License.txt in the project root for license information.
    *--------------------------------------------------------------------------------------------*/
   ```
   Files that come from Code - OSS keep Microsoft's header. Do not remove it.
5. Open a pull request and fill in the template.

## Code style

Tacet follows the upstream Code - OSS conventions: tabs, TypeScript, layered `src/vs` imports. `npm run eslint` and `npm run hygiene` check most of it.

By contributing you agree that your contribution is licensed under the MIT License in [LICENSE.txt](LICENSE.txt).

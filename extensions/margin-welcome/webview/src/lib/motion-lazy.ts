/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Bundle trim: every `import ... from 'motion/react'` (including the Animate UI primitives) resolves
// here (vite.config.ts alias). `motion` becomes the slim `m` component, which gets its features from
// <LazyMotion features={domAnimation}> in main.tsx, so the full feature bundle (layout projection,
// drag) is not shipped. The explicit export below takes precedence over the star export.

// eslint-disable-next-line local/code-import-patterns
export * from 'motion-react-full';
// eslint-disable-next-line local/code-import-patterns
export { m as motion } from 'motion-react-full';

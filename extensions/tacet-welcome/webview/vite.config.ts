import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Single JS + single CSS bundle into ../media for the VS Code webview.
// No code splitting, no hashed names, no remote assets.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(import.meta.dirname, 'src') },
      // Bundle trim: route 'motion/react' through the LazyMotion shim (src/lib/motion-lazy.ts).
      { find: /^motion\/react$/, replacement: path.resolve(import.meta.dirname, 'src/lib/motion-lazy.ts') },
      { find: /^motion-react-full$/, replacement: 'framer-motion' },
    ],
  },
  base: './',
  build: {
    outDir: path.resolve(import.meta.dirname, '../media'),
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    modulePreload: false,
    rollupOptions: {
      input: path.resolve(import.meta.dirname, 'src/main.tsx'),
      output: {
        codeSplitting: false,
        entryFileNames: 'welcome.js',
        assetFileNames: (info) => (info.names?.[0] ?? '').endsWith('.css') ? 'welcome.css' : '[name][extname]',
      },
    },
  },
});

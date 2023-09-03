// @ts-expect-error https://github.com/vitejs/vite/issues/11552

import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.ts',
      formats: ['cjs'],
    },
    minify:
      process.env['MINIFY'] && process.env['MINIFY'] === 'false'
        ? false
        : 'esbuild',
  },
});

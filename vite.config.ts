// @ts-expect-error https://github.com/vitejs/vite/issues/11552

import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      external: ['content-tag'],
    },
    lib: {
      entry: 'src/main.ts',
      formats: ['cjs'],
    },
    minify: false,
  },
});

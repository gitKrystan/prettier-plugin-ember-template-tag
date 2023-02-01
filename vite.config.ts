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

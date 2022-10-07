import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: 'src/main.ts',
      formats: ['cjs']
    },
    commonjsOptions: {
      dynamicRequireTargets: ['node_modules/ember-cli-htmlbars']
    }
  }
});

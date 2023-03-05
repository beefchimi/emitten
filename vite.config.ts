import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'emitten',
      fileName: (format) => `emitten.${format}.js`,
    },
    minify: false,
  },
  plugins: [dts()],
  test: {
    setupFiles: 'config/tests-setup',
  },
});

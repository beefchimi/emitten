import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/guide/build.html#library-mode
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
});

import dts from 'vite-plugin-dts';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'emitten',
      fileName: (format) => `emitten.${format}.js`,
    },
    minify: false,
  },
  plugins: [dts({rollupTypes: true})],
});

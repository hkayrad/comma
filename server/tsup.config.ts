import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  splitting: false,
  sourcemap: true,
  clean: true,
  noExternal: ['@comma/common'],
  minify: false, // Keep it readable for now
  dts: false,    // Server doesn't need type declarations in dist
});

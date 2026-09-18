import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/lib/popover/index.ts',
    dnd: 'src/lib/popover/dnd.tsx',
    store: 'src/lib/popover/store.ts',
    schema: 'src/lib/popover/schema.tsx',
    utils: 'src/lib/popover/utils.ts',
  },
  format: ['cjs', 'esm'],
  dts: false,
  tsconfig: 'tsconfig.lib.json',
  splitting: true,
  sourcemap: true,
  clean: true,
  minify: true,
  treeshake: true,
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    'zustand',
    '@floating-ui/react',
    '@dnd-kit/core',
  ],
});

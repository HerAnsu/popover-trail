import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/lib/popover/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  tsconfig: 'tsconfig.lib.json',
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  treeshake: true,
  external: [
    'react',
    'react-dom',
    'zustand',
    '@floating-ui/react',
    '@dnd-kit/core',
    'fast-deep-equal',
  ],
})

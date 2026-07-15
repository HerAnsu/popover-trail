import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/lib/popover/index.ts', 'src/lib/popover/dnd.tsx'],
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
    'react-focus-lock',
    'fast-deep-equal',
  ],
})

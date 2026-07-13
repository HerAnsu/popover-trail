import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/lib/popover/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  tsconfig: 'tsconfig.lib.json',
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    'zustand',
    '@floating-ui/react',
    'react-focus-lock',
    'fast-deep-equal',
  ],
})

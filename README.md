# popover-trail

[![npm version](https://img.shields.io/npm/v/popover-trail.svg)](https://www.npmjs.com/package/popover-trail)
[![license](https://img.shields.io/npm/l/popover-trail.svg)](LICENSE)

Headless React 19 library for stateful popover trees, floating canvas cards, and background Web Worker data hydration.

Unpinned popovers form a linear trail (`trail`). Pinning a card detaches it into an independent floating window (`floating`) with pointer drag tracking and velocity spring tilt physics.

---

## Quick start

```bash
npm install popover-trail @floating-ui/react zustand
# Optional for drag-and-drop and focus locking
npm install @dnd-kit/core react-focus-lock
```

```tsx
import {
  PopoverProvider,
  PopoverTrail,
  PopoverCard,
  isResolvedEntry,
  createPopoverSchema,
} from 'popover-trail';

// 1. Define typed schema
export const schema = createPopoverSchema({
  userCard: {
    resolver: async (key) => fetch(`/api/users/${key}`).then((r) => r.json()),
    placement: 'right',
  },
});

// 2. Render provider and card container
export function App() {
  return (
    <PopoverProvider schema={schema}>
      <Workspace />
      <PopoverTrail
        renderCard={(entry, index, isPinned) => (
          <PopoverCard key={entry.key} entry={entry} index={index} isPinned={isPinned}>
            {isResolvedEntry(entry) && <div>{entry.data.name}</div>}
          </PopoverCard>
        )}
      />
    </PopoverProvider>
  );
}
```

---

## Technical architecture

- **State model**: An isolated Zustand vanilla store manages `trail` (cascading path) and `floating` (pinned windows).
- **BFS teardown**: Closing a parent popover runs a Breadth-First Search across `trail` and `floating` to unmount all descendant keys and trigger `AbortController` signal cancellation on active requests.
- **Positioning**: `@floating-ui/react` computes relative coordinates. Sub-pixel fractional values are rounded (`Math.round`) to prevent blurry text borders.
- **Physics**: Pointer drag tracking calculates velocity spring tilt via `requestAnimationFrame` on GPU hardware layers (`willChange: transform`).
- **Security**: Built-in prototype pollution guards block `__proto__`, `constructor`, and `prototype` keys during storage hydration, state serialization, and schema resolution.

---

## Documentation index

- **[Master API reference](docs/API.md)**: Full TypeScript signatures, props, hooks, and core engine specs.
- **[Feature guides index](docs/GUIDES.md)**: Manuals for cascading paths, pinning, Web Workers, hover buffers, and focus locking.

### Technical manuals

1. [Cascading paths](docs/guides/01-cascading-paths.md)
2. [Draggable pinning](docs/guides/02-draggable-pinning.md)
3. [Web Worker data hydration](docs/guides/03-data-hydration.md)
4. [Hover triggers and buffers](docs/guides/04-hover-triggers.md)
5. [Stacking and z-index](docs/guides/05-stacking-zindex.md)
6. [Imperative controller](docs/guides/06-imperative-controller.md)
7. [Scoped schema instances](docs/guides/07-scoped-instances.md)
8. [Accessibility and focus](docs/guides/08-accessibility-focus.md)
9. [Development and testing](docs/guides/09-library-development-testing.md)

---

## Commands

```bash
npm run build:lib    # Build ESM, CJS, and DTS distribution bundles via tsup
npm test             # Run Vitest unit and integration test suite
npm run typecheck    # Validate TypeScript types via tsc --noEmit
npm run lint         # Run Oxlint static code analyzer
```

---

## License

[MIT](LICENSE)

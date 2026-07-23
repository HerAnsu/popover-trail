# Popover Trail

[![CI](https://github.com/HerAnsu/popover-trail/actions/workflows/ci.yml/badge.svg)](https://github.com/HerAnsu/popover-trail/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/popover-trail.svg)](https://www.npmjs.com/package/popover-trail)

Headless React 19 library for stateful popover trees, canvas floating windows, and asynchronous Web Worker data hydration.

Popover Trail models popovers as nodes in a tree structure. Unpinned popovers form a single linear path (`trail`). Pinning a node detaches it into an independent floating window (`floating`) with pointer drag tracking and velocity-based spring tilt transformation.

---

## Documentation Index

Explore the complete API reference and detailed feature guides:

### Core Documentation
* **[API Reference](docs/API.md)** — Complete TypeScript signatures, component props, and return types for all exported modules.
* **[Feature Guides Overview](docs/GUIDES.md)** — Comprehensive index of feature guides and developer manuals.

### Technical Guides
* **[01. Cascading Paths](docs/guides/01-cascading-paths.md)** — Tree structures, linear trails, and automatic BFS unmount traversal.
* **[02. Draggable Pinning](docs/guides/02-draggable-pinning.md)** — Floating canvas windows, pointer drag events, spring tilt physics, and sub-pixel text rendering fixes.
* **[03. Web Worker Hydration](docs/guides/03-data-hydration.md)** — Offloading async data fetch and parse tasks to background Web Workers using `createWorkerResolver`.
* **[04. Hover Triggers & Buffers](docs/guides/04-hover-triggers.md)** — Hover intent delays, safe cursor travel buffers, and touch event handling.
* **[05. Stacking & Z-Index](docs/guides/05-stacking-zindex.md)** — Custom stack groups, dynamic z-index calculation, and escaping CSS stacking context traps.
* **[06. Imperative Controller](docs/guides/06-imperative-controller.md)** — Out-of-React state control via `createPopoverController` for WebSockets or external event buses.
* **[07. Scoped Instances](docs/guides/07-scoped-instances.md)** — Type-safe schema bindings and isolated popover subsystems via `createPopoverTrail`.
* **[08. Accessibility & Focus](docs/guides/08-accessibility-focus.md)** — WAI-ARIA dialog attributes, keyboard focus locking, and hotkey handler maps.
* **[09. Development & Testing](docs/guides/09-library-development-testing.md)** — Developer scripts, Vitest test suite setup, Oxlint, Oxfmt, and TypeScript 7 configuration.

---

## Architecture & Technical Design

### State Model & Tree Traversal
The library maintains state outside the React render tree using an isolated Zustand vanilla store:
* **`trail`**: Readonly array representing the active cascading path.
* **`floating`**: Readonly array containing pinned popover entries detached from the linear trail.

Closing a parent node initiates a Breadth-First Search (BFS) algorithm over both `trail` and `floating` arrays to resolve all descendant keys. Active network requests and Web Worker tasks for unmounted descendants are aborted via `AbortController`.

### Layout & Rendering Mechanics
* **Positioning**: Viewport relative positioning is computed via `@floating-ui/react`. Coordinates are rounded (`Math.round`) to integer values to prevent sub-pixel border blur.
* **Physics & Hardware Acceleration**: Dragging uses pointer event capture. Velocity spring tilt is calculated via `requestAnimationFrame` and applied through CSS `transform: translate3d(...)` with `willChange: transform` compositor layers.
* **Unstyled Compound Pattern**: Components inject positioning styles, CSS custom properties (`--popover-x`, `--popover-y`, `--popover-z`), and ARIA attributes without enforcing visual CSS rules.

---

## Core API & Component Specification

### `<PopoverProvider>`
Context provider initializing the Zustand store, data resolver, cache instance, and viewport collision configuration.

```tsx
import { PopoverProvider, SimplePopoverCache } from 'popover-trail';

const cache = new SimplePopoverCache(300000, 50); // 5-minute TTL, 50 items max capacity

const resolveData = async (key: string, parentData?: unknown, context?: unknown, signal?: AbortSignal) => {
  const res = await fetch(`/api/nodes/${key}`, { signal });
  return res.json();
};

export function App() {
  return (
    <PopoverProvider resolveData={resolveData} cache={cache}>
      <Workspace />
      <PopoverTrail renderCard={(entry, index, isPinned) => (
        <Card key={entry.key} entry={entry} index={index} isPinned={isPinned} />
      )} />
    </PopoverProvider>
  );
}
```

### `<PopoverCard>` & Compound Components
Unstyled compound component for popover card layout. Implements polymorphic element rendering via the `as` prop (`as={motion.div}`, `as="section"`, etc.).

```tsx
import { PopoverCard, isResolvedEntry, type TrailEntry } from 'popover-trail';

interface CardProps {
  entry: TrailEntry<{ title: string; body: string }>;
  index: number;
  isPinned: boolean;
}

export function Card({ entry, index, isPinned }: CardProps) {
  return (
    <PopoverCard entry={entry} index={index} isPinned={isPinned} className="popover-card">
      <PopoverCard.Handle className="drag-handle">
        <span>{entry.key}</span>
        <PopoverCard.PinButton />
        <PopoverCard.CloseButton />
      </PopoverCard.Handle>

      <PopoverCard.Content className="card-body">
        {entry.isLoading && <div className="spinner">Loading...</div>}
        {isResolvedEntry(entry) && (
          <div>
            <h3>{entry.data.title}</h3>
            <p>{entry.data.body}</p>
          </div>
        )}
      </PopoverCard.Content>
    </PopoverCard>
  );
}
```

### Web Worker Data Hydration
`createWorkerResolver` offloads data fetching and JSON parsing to a background Web Worker thread:

```tsx
import { PopoverProvider, createWorkerResolver } from 'popover-trail';

const workerResolver = createWorkerResolver(
  async (key: string, parentData?: unknown) => {
    // Executed in Web Worker thread
    const res = await fetch(`/api/nodes/${key}`);
    return res.json();
  },
  { timeoutMs: 10000, autoRestart: true }
);

export function App() {
  return (
    <PopoverProvider resolveData={workerResolver}>
      <Workspace />
    </PopoverProvider>
  );
}
```

---

## Technical Verification & Development

```bash
npm run build:lib   # Build CJS, ESM, and DTS distribution bundles via Tsup
npm test            # Run Vitest test suite (103 unit & integration tests)
npm run typecheck   # Validate TypeScript types via tsc --noEmit
npm run lint        # Run Oxlint static code analyzer
npm run format      # Format codebase via Oxfmt
```

---

## License

[MIT](LICENSE)

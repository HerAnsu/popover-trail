# Popover Trail

[![CI](https://github.com/HerAnsu/popover-trail/actions/workflows/ci.yml/badge.svg)](https://github.com/HerAnsu/popover-trail/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/popover-trail.svg)](https://www.npmjs.com/package/popover-trail)
[![license](https://img.shields.io/npm/l/popover-trail.svg)](LICENSE)
[![React 19](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-blue.svg)](https://www.typescriptlang.org)

Headless React 19 library for cascading popover paths, draggable floating windows, and background Web Worker data fetching.

Popover Trail treats popovers as nodes in a tree. Open unpinned cards stay in a single linear trail. Pin any card to detach it onto the viewport canvas as an independent window with spring tilt physics and drag handlers.

---

## 📚 Documentation

Detailed API signatures and step-by-step guides live right here in the repository:

* 📖 **[API Reference](docs/API.md)**: TypeScript types, props tables, and return values for all components, hooks, and helpers.
* 🚀 **[Guides & Manuals](docs/GUIDES.md)**: Deep dives into specific use cases:
  * 🔗 [01. Cascading Paths Guide](docs/guides/01-cascading-paths.md): Managing popover trees and BFS tree cleanup.
  * 📌 [02. Draggable Pinning & Physics](docs/guides/02-draggable-pinning.md): Canvas drag, spring tilt, and boundary clamping.
  * ⚡ [03. Web Worker Data Hydration](docs/guides/03-data-hydration.md): Offloading fetch and parse tasks to background threads.
  * 🎯 [04. Hover Triggers & Buffers](docs/guides/04-hover-triggers.md): Hover delays, safe triangles, and touch events.
  * 📚 [05. Stacking & Z-Index Control](docs/guides/05-stacking-zindex.md): Custom stack groups and depth layers.
  * 🎮 [06. Imperative Controller](docs/guides/06-imperative-controller.md): Controlling popovers from Redux, WebSockets, or Vanilla DOM.
  * 📦 [07. Scoped Typed Instances](docs/guides/07-scoped-instances.md): Pre-typed factory hooks via `createPopoverTrail`.
  * ♿ [08. Accessibility & Focus Lock](docs/guides/08-accessibility-focus.md): WAI-ARIA dialog roles and keyboard navigation.

---

## Why Popover Trail?

* **Unstyled by design.** Zero bundled CSS. Style cards with Tailwind, CSS Modules, or whatever you use.
* **Framer Motion friendly.** Pass `as={motion.div}` to `<PopoverCard>` and animate entry/exit states.
* **Background Worker thread.** Resolve heavy data off the main thread using `createWorkerResolver`.
* **Automatic request cancellation.** Closing a parent popover triggers BFS cleanup, aborting pending network and worker tasks via `AbortSignal`.
* **Compound components or hooks.** Pick `<PopoverCard>` compound subcomponents or drop down to `usePopoverCard` hooks when you need raw control.

---

## Quick Start

### 1. Install

```bash
npm install popover-trail
```

### 2. Wrap your app in PopoverProvider

Add `PopoverProvider` around your layout and render `PopoverTrail` to mount portals:

```tsx
import { PopoverProvider, PopoverTrail, SimplePopoverCache } from 'popover-trail';

// Data resolver called when a card opens
const resolveData = async (key: string, parentData?: unknown, context?: unknown, signal?: AbortSignal) => {
  const res = await fetch(`/api/items/${key}`, { signal });
  return res.json();
};

const cache = new SimplePopoverCache(300000, 50); // 5-minute TTL, 50 items max

export function App() {
  return (
    <PopoverProvider resolveData={resolveData} cache={cache}>
      <Workspace />

      {/* Renders active trail and floating popovers into DOM portals */}
      <PopoverTrail
        renderCard={(entry, index, isPinned) => (
          <Card key={entry.key} entry={entry} index={index} isPinned={isPinned} />
        )}
      />
    </PopoverProvider>
  );
}
```

### 3. Build popover cards

Use compound components for clean JSX:

```tsx
import { PopoverCard, isResolvedEntry, type TrailEntry } from 'popover-trail';

interface CardProps {
  entry: TrailEntry<{ title: string; description: string }>;
  index: number;
  isPinned: boolean;
}

export function Card({ entry, index, isPinned }: CardProps) {
  return (
    <PopoverCard entry={entry} index={index} isPinned={isPinned} className="popover-card">
      <PopoverCard.Handle className="drag-handle">
        <span>{entry.key}</span>
        <PopoverCard.PinButton className="btn-pin" />
        <PopoverCard.CloseButton className="btn-close" />
      </PopoverCard.Handle>

      <PopoverCard.Content className="card-body">
        {entry.isLoading && <div className="spinner">Loading...</div>}
        {isResolvedEntry(entry) && (
          <div>
            <h3>{entry.data.title}</h3>
            <p>{entry.data.description}</p>
          </div>
        )}
      </PopoverCard.Content>
    </PopoverCard>
  );
}
```

---

## Web Worker Hydration

Fetch and process data off the main UI thread:

```tsx
import { PopoverProvider, createWorkerResolver } from 'popover-trail';

const workerResolver = createWorkerResolver(
  async (key, parentData) => {
    // Runs inside a Web Worker thread
    const res = await fetch(`/api/data/${key}`);
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

## Development

```bash
npm run build:lib   # Build ESM, CJS, and DTS outputs with Tsup
npm test            # Run Vitest test suite (103 tests)
npm run typecheck   # Check TypeScript types
npm run lint        # Check code with Oxlint
npm run format      # Format with Oxfmt
```

---

## License

[MIT](LICENSE)

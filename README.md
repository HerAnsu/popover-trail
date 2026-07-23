# Popover Trail

[![CI](https://github.com/HerAnsu/popover-trail/actions/workflows/ci.yml/badge.svg)](https://github.com/HerAnsu/popover-trail/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/popover-trail.svg)](https://www.npmjs.com/package/popover-trail)
[![license](https://img.shields.io/npm/l/popover-trail.svg)](LICENSE)
![React 19](https://img.shields.io/badge/React-19-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-blue.svg)

Headless React 19 library for managing **cascading popover paths**, **draggable floating windows**, and **async Web Worker data hydration**.

Popover Trail structures popovers as nodes in a tree hierarchy. Unpinned popovers form a single linear path. Pinning a popover detaches it into an independent floating window with physics-based drag interactions and spring tilt.

---

## 📚 Documentation & Guides

Comprehensive guides and complete TypeScript API signatures are available in the repository documentation:

* 📖 **[API Reference](docs/API.md)** — Full TypeScript signatures, props tables, and return values for all exported components, hooks, type guards, and utilities.
* 🚀 **[Feature Guides & Manuals](docs/GUIDES.md)** — Step-by-step guides for advanced use cases:
  * 🔗 [01. Cascading Paths Guide](docs/guides/01-cascading-paths.md) — Managing nested popover trees & BFS unmounting.
  * 📌 [02. Draggable Pinning & Physics](docs/guides/02-draggable-pinning.md) — Floating canvas, spring tilt, and boundary collision.
  * ⚡ [03. Web Worker Data Hydration](docs/guides/03-data-hydration.md) — Offloading data resolution with `createWorkerResolver`.
  * 🎯 [04. Hover Triggers & Buffers](docs/guides/04-hover-triggers.md) — Hover intent delays, safe triangles, and touch support.
  * 📚 [05. Stacking & Z-Index Control](docs/guides/05-stacking-zindex.md) — Custom stacking groups, modal overlays, and depth layers.
  * 🎮 [06. Imperative Controller](docs/guides/06-imperative-controller.md) — Controlling popovers from Redux, WebSockets, or Vanilla JS.
  * 📦 [07. Scoped Typed Instances](docs/guides/07-scoped-instances.md) — Pre-typed factory hooks via `createPopoverTrail`.
  * ♿ [08. Accessibility & Focus Lock](docs/guides/08-accessibility-focus.md) — WAI-ARIA dialog roles and keyboard navigation.

---

## 🌟 Highlights & Features

* 🎨 **100% Unstyled Headless API**: Zero forced CSS or pre-made themes. Compatible with **Tailwind CSS**, **CSS Modules**, or **Styled Components**.
* 🎭 **Polymorphic `as` Prop**: Works natively with **Framer Motion** (`as={motion.div}`), custom HTML tags, or React components.
* ⚡ **Off-Main-Thread Web Workers**: Offload heavy data resolution to background Web Workers via `createWorkerResolver` with zero-copy transfers.
* 🛑 **Automatic BFS Cancellation**: Closing a parent popover performs a breadth-first search (BFS) tree cleanup, aborting pending network and worker tasks via `AbortSignal`.
* 📦 **Compound Components & Hooks**: Choose between high-level declarative `<PopoverCard>` compound elements or low-level `usePopoverCard` hooks.

---

## 🚀 Quick Start

### 1. Installation

```bash
npm install popover-trail
```

### 2. Configure PopoverProvider & PopoverTrail

Wrap your component tree with `PopoverProvider` and add the `PopoverTrail` portal renderer:

```tsx
import { PopoverProvider, PopoverTrail, SimplePopoverCache } from 'popover-trail';

// Async data resolver function
const resolveData = async (key: string, parentData?: unknown, context?: unknown, signal?: AbortSignal) => {
  const response = await fetch(`/api/items/${key}`, { signal });
  return response.json();
};

const cache = new SimplePopoverCache(300000, 50); // 5-minute TTL, max 50 items

export function App() {
  return (
    <PopoverProvider resolveData={resolveData} cache={cache}>
      <YourAppWorkspace />

      {/* Renders active cascading trail and floating popovers into DOM portal */}
      <PopoverTrail
        renderCard={(entry, index, isPinned) => (
          <Card key={entry.key} entry={entry} index={index} isPinned={isPinned} />
        )}
      />
    </PopoverProvider>
  );
}
```

### 3. Build Unstyled Popover Cards

Use compound components for clean, declarative popover cards without manual hook wiring:

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

## ⚡ Web Worker Hydration Example

Keep the main UI thread at 60-120 FPS by resolving popover data in a background Web Worker:

```tsx
import { PopoverProvider, createWorkerResolver } from 'popover-trail';

const workerResolver = createWorkerResolver(
  async (key, parentData) => {
    // Executed in a background Web Worker thread
    const response = await fetch(`/api/data/${key}`);
    return response.json();
  },
  { timeoutMs: 10000, autoRestart: true }
);

export function App() {
  return (
    <PopoverProvider resolveData={workerResolver}>
      <YourAppWorkspace />
    </PopoverProvider>
  );
}
```

---

## 🛠️ Development & Verification

```bash
npm run build:lib   # Build ESM, CJS, and DTS bundles via Tsup
npm test            # Run 103 Vitest unit & integration tests
npm run typecheck   # Typecheck TypeScript code without emitting
npm run lint        # Check code quality via Oxlint
npm run format      # Format codebase via Oxfmt
```

---

## 📄 License

[MIT](LICENSE)

# Popover Trail

Headless React 19 library for managing cascading popover paths, draggable floating windows, and async data hydration.

Popover Trail structures popovers as nodes in a tree hierarchy. Unpinned popovers form a single linear path. Pinning a popover detaches it into an independent floating window with physics-based drag interactions and spring tilt.

---

## Features

- **Zero forced CSS**: 100% unstyled headless components (`PopoverCard`, `PopoverTrail`, `PopoverTrigger`). Use Tailwind CSS, CSS Modules, or Styled Components.
- **Polymorphic `as` prop**: Works natively with Framer Motion (`as={motion.div}`), custom HTML tags, or React components.
- **Off-main-thread hydration**: Offload data fetching and parsing to Web Workers via `createWorkerResolver` with zero-copy array buffer transfers.
- **Automatic cancellation**: Closing a parent popover triggers breadth-first search (BFS) cleanup, aborting pending network and worker tasks via `AbortSignal`.
- **Compound components & hooks**: Use high-level `<PopoverCard>` compound elements or low-level `usePopoverCard` hooks.

---

## Quick Start

### 1. Installation

```bash
npm install popover-trail
```

### 2. Configure PopoverProvider

Wrap your component tree and supply a data resolver function:

```tsx
import { PopoverProvider, SimplePopoverCache } from 'popover-trail';

const resolveData = async (key: string, parentData?: unknown, context?: unknown, signal?: AbortSignal) => {
  const response = await fetch(`/api/items/${key}`, { signal });
  return response.json();
};

const cache = new SimplePopoverCache(300000, 50); // 5-minute TTL, 50 items max

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

### 3. Render Headless Popover Cards

Use compound components for clean, declarative cards without manual hook wiring:

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
        <PopoverCard.PinButton className="btn" />
        <PopoverCard.CloseButton className="btn" />
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

## Architecture

Popover Trail manages state via a dual-stack Zustand store:
* **trail**: Linear stack representing the active cascading path.
* **floating**: Array of pinned popovers floating independently on the viewport.

Closing a parent popover performs a breadth-first search (BFS) traversal over `trail` and `floating` to unmount all child popovers. Active async requests for unmounted popovers are cancelled using `AbortController` signals.

---

## Headless Compound Components

### `<PopoverCard>`
Root container for popover cards. Binds Floating UI coordinates, CSS variables (`--popover-x`, `--popover-y`, `--popover-z`), and accessibility attributes (`role="dialog"`, `data-state`, `data-pinned`).

Supports polymorphic rendering via the `as` prop:

```tsx
<PopoverCard as={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} entry={entry} index={index} isPinned={isPinned}>
  <PopoverCard.Content>Card Body</PopoverCard.Content>
</PopoverCard>
```

#### Compound Sub-Components:
- **`<PopoverCard.Handle>`**: Drag handle header area for pointer interactions.
- **`<PopoverCard.PinButton>`**: Toggles pinned status for floating windows.
- **`<PopoverCard.CloseButton>`**: Closes the popover by key.
- **`<PopoverCard.Content>`**: Container for card content.

---

## Web Worker Hydration

Offload data resolution to a background Web Worker to keep the main UI thread responsive:

```tsx
import { PopoverProvider, createWorkerResolver } from 'popover-trail';

const workerResolver = createWorkerResolver(async (key, parentData) => {
  // Executed inside a Web Worker thread
  const res = await fetch(`/api/data/${key}`);
  return res.json();
}, { timeoutMs: 10000, autoRestart: true });

export function App() {
  return (
    <PopoverProvider resolveData={workerResolver}>
      <Workspace />
    </PopoverProvider>
  );
}
```

---

## API Summary

### Components & Context
- `<PopoverProvider>`: Store and context provider.
- `<PopoverCard>`: Headless unstyled compound card container.
- `<PopoverTrail>`: High-level portal renderer for trail and floating stacks.
- `<PopoverTrigger>`: Wrapper attaching click/hover handlers to trigger elements.
- `<PopoverPortal>`: Low-level portal renderer mounting elements to `document.body`.

### Hooks
- `usePopoverCard`: Hook combining Floating UI positioning, velocity spring tilt, and drag handling.
- `usePopover`: Key-bound hook returning state and trigger props.
- `usePopoverActions`: Returns store dispatch methods (`closeByKey`, `togglePin`, `clear`, `retryPopover`).
- `usePopoverStore`: Subscribes to custom Zustand store slices.
- `usePopoverGeometry`: Computes layout coordinates, collision boundaries, and cascade offsets.
- `usePopoverDragAndDrop`: Manages drag interaction physics and tilt damping.

---

## Development & Verification

```bash
npm run build:lib   # Build ESM, CJS, and DTS bundles via Tsup
npm test            # Run 103 Vitest unit & integration tests
npm run lint        # Check code quality via Oxlint (0 warnings, 0 errors)
npm run format      # Format codebase via Oxfmt
```

---

## License
MIT

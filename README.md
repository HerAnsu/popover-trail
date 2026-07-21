# Popover Trail

Headless React 19 library for managing cascading popover paths, draggable pinned windows, and async data hydration.

Popover Trail structures popovers as nodes in a tree hierarchy. Unpinned popovers form a single linear path. Any popover can be pinned to float independently on the viewport canvas with physics-based drag interactions.

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
    </PopoverProvider>
  );
}
```

### 3. Render Popover Cards

```tsx
import { usePopoverCard, isResolvedEntry, type TrailEntry } from 'popover-trail';

interface CardProps {
  entry: TrailEntry<{ title: string; description: string }>;
  index: number;
  isPinned: boolean;
}

export function PopoverCard({ entry, index, isPinned }: CardProps) {
  const { ref, style, dragHandleProps, handlePinToggle } = usePopoverCard({
    entry,
    index,
    isPinned,
    placement: 'bottom-start',
  });

  return (
    <div ref={ref} style={style} className="popover-card">
      <div className="drag-handle" {...dragHandleProps}>
        <span>{entry.key}</span>
        <button onClick={handlePinToggle}>{isPinned ? 'Unpin' : 'Pin'}</button>
      </div>

      {entry.isLoading && <div className="spinner">Loading...</div>}
      {isResolvedEntry(entry) && (
        <div className="content">
          <h3>{entry.data.title}</h3>
          <p>{entry.data.description}</p>
        </div>
      )}
    </div>
  );
}
```

---

## Architecture

Popover Trail manages state via a dual-stack Zustand store:
* **trail**: Linear stack for the active cascading path.
* **floating**: Array of pinned popovers detached from the active trail stack.

Closing a parent popover performs a breadth-first search (BFS) traversal over `trail` and `floating` to unmount all recursive child popovers. Active async requests for unmounted popovers are cancelled immediately using `AbortController` signals.

---

## Documentation & Guides

> For exhaustive documentation, see the dedicated manuals:
> * **[API Reference](docs/API.md)**: Full TypeScript signatures, parameter tables, and return values for all 47 exported items.
> * **[Feature Guides & Manuals](docs/guides/README.md)**: Step-by-step feature manuals for cascading paths, draggable pinning, async hydration, Web Workers, and accessibility recipes.

## API Reference

### Components and Context

#### `<PopoverProvider>`
Main context container component. Initializes the Zustand store, data resolver, cache, and collision settings.

#### `<PopoverPortal>`
Render-prop component that mounts active and floating popover entries into DOM portals.

#### `<PopoverTrigger>`
Declarative trigger component that attaches click/hover handlers and ARIA attributes to a child element.

#### `PopoverCardContext`
React context providing `{ entry, index, isPinned }` state to nested card subcomponents.

---

### Core Hooks

#### `usePopoverCard(options)`
Primary hook for popover card components. Integrates Floating UI positioning, drag-and-drop mechanics, velocity spring tilt, and pin toggling.

#### `usePopover(key, options?)`
High-level hook for controlling a specific popover by key. Returns entry state, trigger props, pin state, and actions.

#### `usePopoverTrigger(popoverKey, options?)`
Generates event handlers and ARIA accessibility attributes for opening root popovers.

#### `usePopoverNestedTrigger(popoverKey, parentKey, options?)`
Generates event handlers for opening child popovers from inside an active card.

#### `usePopoverActions()`
Returns memoized store action methods (`closeByKey`, `togglePin`, `retryPopover`, `closeAll`, `openRootWithResolver`, `openNestedWithResolver`).

#### `usePopoverGeometry(options)`
Calculates Floating UI positioning coordinates, viewport collision boundaries, sub-pixel rounding, and cascade offsets.

#### `usePopoverDragAndDrop(options)`
Manages pointer drag interactions, RAF-based velocity spring tilt animation, and viewport coordinate clamping.

---

### State and Helper Hooks

#### `usePopoverStore(selector)`
Subscribes to a slice of the internal Zustand store state.

#### `usePopoverStoreApi()`
Returns the raw Zustand `StoreApi` instance for imperative updates outside React rendering loops.

#### `usePopoverTrail()`
Subscribes to the array of active unpinned popovers in the linear trail.

#### `usePopoverFloating()`
Subscribes to the array of pinned popovers floating independently on the viewport.

#### `usePopoverOffsets()`
Subscribes to drag offset coordinates for all pinned popovers.

#### `usePopoverEntry(key)`
Subscribes to a single popover entry by key.

#### `useIsPopoverPinned(key)`
Returns `true` if the specified popover is pinned.

#### `useIsPopoverOpen(key)`
Returns `true` if the specified popover is open in `trail` or `floating`.

#### `usePopoverZIndex(index, isPinned, baseZIndex?)`
Calculates z-index depth based on stacking index and pinning status.

#### `useIsPopoverTopMost(key)`
Returns `true` if the specified popover sits at the top of the stack.

#### `usePopoverOffset(key)`
Returns the `{ x, y }` drag offset vector for a pinned popover.

#### `usePopoverContext()`
Accesses external application context passed to `PopoverProvider`.

#### `usePopoverHydration(key)`
Subscribes to entry loading, error, and resolved data hydration state.

#### `useEventListener(target, eventName, handler, options?)`
Utility hook for attaching DOM event listeners with automatic cleanup on unmount.

---

### Factories

#### `createPopoverTrail<TData, TContext, TPopoverKey>()`
Creates isolated, type-safe versions of `PopoverProvider`, `PopoverTrigger`, `PopoverPortal`, and hooks bound to specific TypeScript schemas.

#### `createPopoverStore(initialState?)`
Low-level factory for creating independent Zustand store instances.

---

### Type Guards and Utilities

#### `isResolvedEntry(entry)`
Narrows `TrailEntry` to resolved state with valid `data`.

#### `isLoadingEntry(entry)`
Narrows `TrailEntry` to loading state.

#### `isErrorEntry(entry)`
Narrows `TrailEntry` to error state with `error` payload.

#### `getEntryState(entry)`
Returns `'loading' | 'resolved' | 'error'`.

#### `createPopoverKey(key)`
Brands a string as a typed `PopoverKey`.

#### `createPopoverResolver(fn)`
Wraps a data resolver function with type checks.

#### `createVirtualElement(rect)`
Converts a `DOMRect` into a Floating UI `VirtualElement`.

#### `isOpenRootEvent(event)`, `isPushNestedEvent(event)`, `isCloseEvent(event)`, `isPinEvent(event)`, `isResolveErrorEvent(event)`
Event type guard functions for store event logging.

---

### Utilities and Caching

#### `SimplePopoverCache<TData>(ttlMs?, maxSize?)`
In-memory cache class implementing TTL expiration and capacity eviction.

#### `createWorkerResolver(workerOrFn, options?)`
Offloads heavy data resolution to a background Web Worker.

#### `createPopoverController(store)`
Imperative API controller for managing popovers outside React trees (WebSockets, Redux, DOM handlers).

#### `clampDragCoordinates(coords, bounds)`
Clamps `{ x, y }` drag coordinates within defined boundary boxes.

#### `computeTiltMatrix(velocityX, maxTiltAngle, sensitivity)`
Calculates CSS `matrix3d` transform string for velocity spring tilt.

#### `applyDragFriction(delta, damping)`
Applies damping friction factor to drag vectors.

#### `getPopoverStyles(options)`
Generates inline CSS style objects combining placement, transform, and z-index.

#### `invariant(condition, message)`
Asserts runtime conditions and throws styled Error on failure.

---

## Development Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite dev server with example workspace application |
| `npm run build:lib` | Builds distribution bundles (ESM, CJS, d.ts) via Tsup |
| `npm run test` | Runs unit test suite using Vitest |
| `npm run lint` | Runs code quality checks using Oxlint |
| `npm run format` | Formats codebase using Oxfmt |

---

## License
MIT

# Popover Trail

A headless React library for managing cascading popover paths, draggable pinned windows, and async data hydration.

Instead of rendering isolated dropdowns, Popover Trail structures popovers as nodes in a tree hierarchy. Unpinned popovers form a single linear path. Any popover can be pinned to float independently on the viewport canvas with physics-based drag interactions.

## Architecture

```mermaid
graph TD
    Trigger[Trigger Click] --> ResolverCheck{Cache Check}
    ResolverCheck -- Sync Hit --> InstantMount[Render with Data, isLoading: false]
    ResolverCheck -- Miss/Async --> LoadingMount[Render Loading State, isLoading: true]
    LoadingMount --> Fetch[Await Resolver Promise]
    Fetch --> DataLoaded[Update TrailEntry Data]
    
    InstantMount --> ActiveTrail[Trail Stack]
    DataLoaded --> ActiveTrail
    
    ActiveTrail -- Pin Action --> PinnedList[Floating Array]
    PinnedList -- Dragging --> Physics[RAF Spring Rotation]
    
    ActiveTrail -- Close Parent --> BFS[BFS Tree Traversal]
    BFS --> CleanState[Aborted Signals & Purged Keys]
```

### Dual-stack state management
The core store (built with Zustand) uses two primary arrays:
* `trail`: A linear stack for the active cascading path. Only one unpinned trail branch exists at a time.
* `floating`: An array of pinned popovers detached from the active trail stack.

Clicking a trigger resolves data and pushes a `TrailEntry` onto `trail`. Pinning a popover removes it from `trail` and appends it to `floating`. Unpinning moves it back to the `trail` stack at its original hierarchical position.

### Tree traversal and cleanup
Each `TrailEntry` tracks `parentKey` and `originalParentKey`.
* **Branch unmounting**: Closing a parent popover runs a breadth-first search (BFS) over `trail` and `floating` to unmount all recursive child popovers.
* **Request cancellation**: Active async requests for unmounted popovers are cancelled immediately through their associated `AbortController` signals.
* **Pinned child handling**: By default (`closePinnedDescendants: false`), pinned cards remain open when their parent closes. When `closePinnedDescendants: true`, closing a parent also closes its pinned descendants.

### Positioning and pixel rounding
Popover Trail handles position calculations while leaving DOM rendering to your components.
* **Virtual anchors**: Trigger bounding rects (`DOMRect`) are captured on click and converted into Floating UI virtual elements.
* **Coordinate formula**: `Final Position = Floating UI Placement + Drag Offset + Drag Translation`.
* **Sub-pixel rounding**: All coordinates are rounded with `Math.round()` prior to applying CSS transforms or position styles to avoid blurry text on standard-DPI screens.

### Drag inertia physics
When dragging a pinned card, `usePopoverDragAndDrop` tracks horizontal velocity ($\Delta x / \Delta t$). A `requestAnimationFrame` loop calculates a spring rotation angle scaled to velocity. When released, rotation decays back to zero:

$$\text{Angle}_{t} = \text{Angle}_{t-1} \times 0.82$$

The animation loop stops automatically once rotation drops below $0.05^\circ$.

## Core Concepts

* **Draggable pinning**: Popovers move between relative alignment (anchored to trigger buttons) and absolute viewport positions (draggable cards).
* **Synchronous cache resolution**: If data is cached synchronously, the component mounts immediately in the same render frame with `isLoading: false`, avoiding loading state flicker.
* **Viewport collision boundaries**: Boundary options merge global viewport settings with per-trigger overrides. A custom DOM getter (`() => HTMLElement`) can constrain cards inside specific scrollable panels.
* **Request hydration tracking**: Each nested path maintains a hydration counter. Rapid clicks discard responses from out-of-order promises if their counter does not match current state.

## Installation

```bash
npm install popover-trail
```

### Peer Dependencies

```json
{
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.0",
    "@floating-ui/react": "^0.27.0",
    "@dnd-kit/core": "^6.3.0"
  }
}
```

## Usage

### 1. Configure PopoverProvider
Wrap your component tree and supply a data resolver function:

```tsx
import { PopoverProvider, SimplePopoverCache } from 'popover-trail';

const dataResolver = async (key: string, parentData?: unknown, context?: unknown, signal?: AbortSignal) => {
  const res = await fetch(`/api/items/${key}`, { signal });
  return res.json();
};

const cache = new SimplePopoverCache(300000, 50); // 5-minute TTL, 50 items max

export function App() {
  return (
    <PopoverProvider resolveData={dataResolver} cache={cache}>
      <Workspace />
    </PopoverProvider>
  );
}
```

### 2. Attach triggers
You can attach triggers using hooks (`usePopoverTrigger`, `usePopoverNestedTrigger`) or using the declarative `<PopoverTrigger>` component:

```tsx
import { usePopoverTrigger, usePopoverNestedTrigger, PopoverTrigger } from 'popover-trail';

// Hook trigger for root entry
export function HookRootTrigger() {
  const triggerProps = usePopoverTrigger('item-101');
  return <button {...triggerProps}>Inspect Item</button>;
}

// Declarative trigger wrapper
export function DeclarativeTrigger() {
  return (
    <PopoverTrigger popoverKey="item-102" placement="right-start">
      <button>Inspect Item 102</button>
    </PopoverTrigger>
  );
}

// Nested trigger inside a card
export function NestedTrigger({ parentKey }: { parentKey: string }) {
  const triggerProps = usePopoverNestedTrigger('item-101-details', parentKey);
  return <button {...triggerProps}>View Details</button>;
}
```

### 3. Hover triggers
Pass `hover` options to enable hover-driven opening and closing:

```tsx
const triggerProps = usePopoverTrigger('preview-card', {
  hover: {
    enabled: true,
    openDelay: 150,
    closeDelay: 250,
    closeOnMouseLeave: true,
  },
});
```

### 4. Render cards with usePopoverCard and isResolvedEntry
Use `usePopoverCard` to get positioning styles and `isResolvedEntry` for type-safe data rendering:

```tsx
import { usePopoverCard, usePopoverActions, isResolvedEntry, type TrailEntry } from 'popover-trail';

interface CardProps {
  entry: TrailEntry<{ title: string; description: string }>;
  index: number;
  isPinned: boolean;
}

export function PopoverCard({ entry, index, isPinned }: CardProps) {
  const { closeByKey, retryPopover } = usePopoverActions();
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
        <button onClick={() => closeByKey(entry.key)}>Close</button>
      </div>

      {entry.isLoading && <div className="spinner">Loading...</div>}

      {entry.error && (
        <div className="error-box">
          <p>Failed to load data.</p>
          <button onClick={() => retryPopover(entry.key)}>Retry</button>
        </div>
      )}

      {isResolvedEntry(entry) && (
        <div className="content">
          <h4>{entry.data.title}</h4>
          <p>{entry.data.description}</p>
        </div>
      )}
    </div>
  );
}
```

## Custom Caching

The library exports `SimplePopoverCache`, an in-memory cache supporting TTL expiration and maximum capacity eviction:

```typescript
import { SimplePopoverCache } from 'popover-trail';

// TTL in ms (default: infinity), maxSize (default: 100)
const cache = new SimplePopoverCache<unknown>(60000, 20);
```

You can also implement a custom cache by adhering to the `PopoverCache` interface:

```typescript
export interface PopoverCache<TData = unknown> {
  get(key: string): TData | undefined;
  set(key: string, data: TData): void;
  has(key: string): boolean;
  delete(key: string): void;
  clear(): void;
}
```

## Isolated Context Factory

If your application requires multiple independent popover trees, create scoped instances using `createPopoverTrail`:

```tsx
import { createPopoverTrail } from 'popover-trail';

interface CustomData {
  id: string;
  label: string;
}

export const ScopeTrail = createPopoverTrail<CustomData>();

// Usage in components
export function ScopedApp() {
  return (
    <ScopeTrail.PopoverProvider resolveData={async (key) => ({ id: key, label: 'Custom' })}>
      <ScopeTrail.PopoverTrigger popoverKey="scoped-1">
        <button>Open Scoped</button>
      </ScopeTrail.PopoverTrigger>
    </ScopeTrail.PopoverProvider>
  );
}
```

## Stacking and Accessibility

### Layering and z-index management
Popovers automatically calculate z-index depth based on stacking index and base z-index settings. Use helper hooks inside cards for custom overlay logic:

```tsx
import { usePopoverZIndex, useIsPopoverTopMost } from 'popover-trail';

const zIndex = usePopoverZIndex(index, isPinned, 1000);
const isTopMost = useIsPopoverTopMost(entry.key);
```

### ARIA compliance
Trigger hooks automatically attach accessibility attributes:
* `aria-expanded`: Set to `true` when the popover is open.
* `aria-haspopup`: Set to `"dialog"`.
* `aria-describedby`: Linked when `ariaDescribedby` option is specified.

## API Reference

### usePopoverCard options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `entry` | `TrailEntry` | *Required* | Popover state entry node. |
| `index` | `number` | *Required* | Stacking depth index. |
| `isPinned` | `boolean` | *Required* | Whether the popover is currently pinned. |
| `placement` | `PopoverPlacement` | `'bottom'` | Default layout placement relative to anchor. |
| `enableDrag` | `boolean` | `true` | Enables drag interactions when pinned. |
| `enableTilt` | `boolean` | `true` | Enables velocity spring tilt during drag. |
| `maxTiltAngle` | `number` | `5` | Maximum tilt angle in degrees. |
| `tiltSensitivity` | `number` | `8` | Velocity to rotation scaling factor. |

### usePopoverActions actions

| Action | Parameters | Description |
| :--- | :--- | :--- |
| `closeByKey` | `(key: string)` | Closes the specified popover and its child branch. |
| `togglePin` | `(key: string)` | Toggles pinned state between trail stack and floating array. |
| `retryPopover` | `(key: string)` | Retries data resolution for a failed popover entry. |
| `closeAll` | `()` | Closes all open popovers (trail and floating). |
| `openRootWithResolver` | `(key: string, anchor, options?)` | Opens a root popover programmatically. |
| `openNestedWithResolver`| `(key: string, parentKey, anchor, options?)` | Opens a child popover programmatically. |

### CollisionConfig interface

```typescript
interface CollisionConfig {
  /** Element or callback returning the boundary element (default: 'clippingAncestors') */
  boundary?: 'clippingAncestors' | HTMLElement | HTMLElement[] | (() => HTMLElement | HTMLElement[] | null);
  /** Safety margins around the boundary in pixels */
  padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
}
```

### HoverConfig interface

```typescript
interface HoverConfig {
  /** Enables hover trigger behavior */
  enabled: boolean;
  /** Delay before opening in milliseconds (default: 200) */
  openDelay?: number;
  /** Delay before closing in milliseconds (default: 300) */
  closeDelay?: number;
  /** Set false to keep popover open when cursor leaves card (default: true) */
  closeOnMouseLeave?: boolean;
}
```

## Development and Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite dev server with example workspace application. |
| `npm run build:lib` | Builds library distribution formats (ESM, CJS, d.ts) via Tsup. |
| `npm run test` | Runs unit test suite using Vitest. |
| `npm run lint` | Runs code quality checks using Oxlint. |
| `npm run format` | Formats codebase using Oxfmt. |

## License
MIT

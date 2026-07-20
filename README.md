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
The core store (built with Zustand) uses two arrays:
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

const cache = new SimplePopoverCache();

export function App() {
  return (
    <PopoverProvider resolveData={dataResolver} cache={cache}>
      <Workspace />
    </PopoverProvider>
  );
}
```

### 2. Attach triggers
Use `usePopoverTrigger` for root popovers and `usePopoverNestedTrigger` for child popovers inside an existing card:

```tsx
import { usePopoverTrigger, usePopoverNestedTrigger } from 'popover-trail';

export function RootTrigger() {
  const triggerProps = usePopoverTrigger('item-101');
  return <button {...triggerProps}>Inspect Item</button>;
}

export function NestedTrigger({ parentKey }: { parentKey: string }) {
  const triggerProps = usePopoverNestedTrigger('item-101-details', parentKey);
  return <button {...triggerProps}>View Details</button>;
}
```

### 3. Render cards with usePopoverCard
Use `usePopoverCard` to get positioning styles, ref bindings, and drag handle props:

```tsx
import { usePopoverCard, usePopoverActions, type TrailEntry } from 'popover-trail';

interface CardProps {
  entry: TrailEntry;
  index: number;
  isPinned: boolean;
}

export function PopoverCard({ entry, index, isPinned }: CardProps) {
  const { closeByKey } = usePopoverActions();
  const { ref, style, dragHandleProps, handlePinToggle } = usePopoverCard({
    entry,
    index,
    isPinned,
    placement: 'bottom-start'
  });

  return (
    <div ref={ref} style={style} className="popover-card">
      <div className="drag-handle" {...dragHandleProps}>
        <span>{entry.data ? (entry.data as { title: string }).title : 'Loading...'}</span>
        <button onClick={handlePinToggle}>{isPinned ? 'Unpin' : 'Pin'}</button>
        <button onClick={() => closeByKey(entry.key)}>Close</button>
      </div>
      <div className="content">
        {entry.data ? (entry.data as { description: string }).description : null}
      </div>
    </div>
  );
}
```

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

### CollisionConfig interface

```typescript
interface CollisionConfig {
  /** Element or callback returning the boundary element (default: 'clippingAncestors') */
  boundary?: 'clippingAncestors' | HTMLElement | HTMLElement[] | (() => HTMLElement | HTMLElement[] | null);
  /** Safety margins around the boundary in pixels */
  padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
}
```

## License
MIT

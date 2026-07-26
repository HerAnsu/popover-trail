# Popover Trail: Detailed API Reference Specification

Exhaustive API documentation for components, compound subcomponents, hooks, schemas, state machine reducers, DAG algorithms, spatial partitioning indexes, and diagnostic error validators in `popover-trail`.

> Looking for step-by-step usage guides? Read [Feature Guides & Manuals](GUIDES.md).

---

## Table of Contents

1. [Typed Schema Builder & Unified Factory](#1-typed-schema-builder--unified-factory)
   - [createPopoverSchema](#createpopoverschema)
   - [createPopoverTrail](#createpopovertrail)
2. [Components & Compound Layouts](#2-components--compound-layouts)
   - [PopoverProvider](#popoverprovider)
   - [PopoverCard & Compound Subcomponents](#popovercard--compound-subcomponents)
   - [PopoverTrail](#popovertrail)
   - [PopoverTimeline & Timeline Subcomponents](#popovertimeline--timeline-subcomponents)
   - [PopoverPortal](#popoverportal)
   - [PopoverTrigger](#popovertrigger)
3. [Hooks & Selectors](#3-hooks--selectors)
   - [usePopover](#usepopover)
   - [usePopoverData](#usepopoverdata)
   - [usePopoverTimeline](#usepopovertimeline)
   - [usePopoverCard](#usepopovercard)
   - [usePopoverActions](#usepopoveractions)
   - [usePopoverGeometry](#usepopovergeometry)
   - [usePopoverDragAndDrop](#usepopoverdraganddrop)
   - [usePopoverHydration](#usepopoverhydration)
   - [useIsPopoverOpen & State Selectors](#useispopoveropen--state-selectors)
4. [Advanced Core Engines](#4-advanced-core-engines)
   - [FSM Statechart Engine (popoverFSMReducer & createPopoverFSM)](#fsm-statechart-engine-popoverfsmreducer--createpopoverfsm)
   - [DAG Cascading Graph (PopoverDAG)](#dag-cascading-graph-popoverdag)
   - [QuadTree 2D Spatial Partitioning Index](#quadtree-2d-spatial-partitioning-index)
   - [PopoverSnapshotManager (BroadcastChannel Sync)](#popoversnapshotmanager-broadcastchannel-sync)
5. [Type Definitions & Data Interfaces](#5-type-definitions--data-interfaces)
   - [TrailEntry](#trailentry)
   - [PopoverStore](#popoverstore)
   - [PopoverActions](#popoveractions)
   - [PopoverDisplayOptions & Config Interfaces](#popoverdisplayoptions--config-interfaces)
6. [Complete Guardrail Warnings Registry (PT-101 to PT-125)](#6-complete-guardrail-warnings-registry-pt-101-to-pt-125)

---

## 1. Typed Schema Builder & Unified Factory

### `createPopoverSchema(definition)`

Factory function creating a strongly typed schema instance. Consolidates data resolvers, placement defaults, key unions, typed triggers, and typed hooks into a single declaration.

```tsx
import { createPopoverSchema } from 'popover-trail';

export const appSchema = createPopoverSchema({
  userProfile: {
    resolver: async (key, parentData, context) => {
      const response = await fetch(`/api/users/${key}`);
      return response.json();
    },
    placement: 'right',
    offset: 12,
    hover: { openDelay: 200, closeDelay: 300 },
  },
  userStats: {
    resolver: async (key, parentData: { id: string }) => {
      const response = await fetch(`/api/users/${parentData.id}/stats`);
      return response.json();
    },
    placement: 'bottom',
  },
});
```

#### Node Options (`PopoverSchemaNode<TData, TParentData, TContext>`)

- `resolver`: Async or synchronous data fetcher function `(key, parentData?, context?) => TData | Promise<TData>`.
- `placement`: Default alignment placement (`'top'`, `'bottom'`, `'left'`, `'right'`, `'auto'`, or aligned variants like `'bottom-start'`).
- `offset`: Gap distance in pixels between the trigger element and card container.
- `collision`: Boundary collision settings object `{ boundary?, padding?, flip?, shift?, size? }`.
- `hover`: Hover trigger configuration `{ openDelay?: number, closeDelay?: number, closeOnMouseLeave?: boolean }`.
- `allowDragWhenPinned`: Allow mouse dragging when card is pinned (default: `true`).
- `allowDragWhenUnpinned`: Allow mouse dragging when card is in trailing stack (default: `true`).

#### Schema Instance Properties (`PopoverSchemaInstance<TSchema>`)

- `definition`: Raw input definition object.
- `keys`: Auto-completing map of schema key strings (e.g. `appSchema.keys.userProfile`).
- `createResolver()`: Factory function generating the unified `resolveData` callback passed to `<PopoverProvider schema={appSchema}>`.
- `Trigger`: Typed trigger component `<appSchema.Trigger popoverKey="userProfile">`.
- `useData(key)`: Hook returning typed data payload for the specified key.
- `useEntry(key)`: Hook returning full `TrailEntry<TData>` for the specified key.
- `useActions()`: Hook returning store dispatch methods pre-bound to schema keys.

---

### `createPopoverTrail(definition?)`

Overloaded factory function supporting both schema-driven definitions and generic type bindings.

```tsx
// 1. Schema Mode (Recommended):
const schemaInstance = createPopoverTrail({
  accountCard: {
    resolver: (key) => fetchAccount(key),
  },
});

// 2. Generic Mode:
const trailHelpers = createPopoverTrail<UserData, GlobalContextType>();
const { PopoverProvider, PopoverTrigger, usePopover } = trailHelpers;
```

---

## 2. Components & Compound Layouts

### `<PopoverProvider>`

Instantiates the Zustand store, injects context into the React tree, and manages global event listeners for Escape key handling and click-outside dismissal.

```tsx
<PopoverProvider
  schema={appSchema}
  clickOutside={{ enabled: true, ignoreSelectors: ['.modal-backdrop'] }}
  baseZIndex={1000}
  cascadeOffsetStep={12}
  exitTransitionDuration={200}
>
  <MainLayout />
  <PopoverTrail />
</PopoverProvider>
```

#### Provider Properties (`PopoverProviderProps<TData, TContext>`)

| Prop | Type | Default | Description |
|---|---|---|---|
| `schema` | `PopoverSchemaInstance` | `undefined` | Typed schema instance generated by `createPopoverSchema`. |
| `resolveData` | `PopoverResolver` | `undefined` | Custom data resolver function `(key, parentData, context, signal) => TData \| Promise<TData>`. |
| `initialContext` | `TContext` | `undefined` | Initial global shared context object passed to all resolvers. |
| `clickOutside` | `ClickOutsideConfig` | `{ enabled: true }` | Configuration object for click-outside auto-closing. |
| `enableKeyboardClose` | `boolean` | `true` | Close topmost popover when Escape key is pressed. |
| `closePinnedDescendants` | `boolean` | `false` | Close pinned floating child popovers when a parent closes. |
| `baseZIndex` | `number` | `1000` | Base z-index depth factor. |
| `cascadeOffsetStep` | `number` | `8` | Pixel offset shift added per level of nesting. |
| `exitTransitionDuration` | `number` | `0` | Unmount delay in milliseconds for CSS exit animations. |
| `defaultOffset` | `number` | `8` | Default gap offset distance in pixels. |
| `responsiveMode` | `'auto' \| 'popover' \| 'bottom-sheet' \| 'modal'` | `'auto'` | Responsive layout transformation mode. |
| `mobileBreakpoint` | `number` | `640` | Viewport width threshold in pixels for mobile layout transformation. |

---

### `<PopoverCard>` & Compound Subcomponents

Polymorphic container element for popover cards. Binds coordinates, accessibility attributes (`role="dialog"`), data attributes (`data-state`, `data-pinned`, `data-key`), and CSS custom variables automatically.

```tsx
<PopoverCard entry={entry} index={index} isPinned={isPinned} className="card-container">
  <PopoverCard.Handle className="drag-handle">
    <span>Drag Card</span>
  </PopoverCard.Handle>
  <PopoverCard.Content>
    <h3>{entry.data?.title}</h3>
  </PopoverCard.Content>
  <PopoverCard.PinButton className="pin-btn" />
  <PopoverCard.CloseButton className="close-btn" />
</PopoverCard>
```

#### Card Properties (`PopoverCardProps<E, TData>`)

- `as`: HTML element tag or React component type (default: `'div'`).
- `entry`: Active `TrailEntry<TData>` represented by this card.
- `index`: Virtual depth index of the card.
- `isPinned`: True if card is modelessly pinned to the canvas.
- `placement`: Preferred placement alignment direction relative to anchor.

#### Compound Subcomponents

- `<PopoverCard.Handle>`: Drag handle element. Attaches ARIA role attributes and drag event listeners.
- `<PopoverCard.PinButton>`: Toggle button for modeless pinning. Invokes `actions.togglePin(key)`.
- `<PopoverCard.CloseButton>`: Close button. Invokes `actions.closeByKey(key)`.
- `<PopoverCard.Content>`: Wrapper container for card content.

---

### `<PopoverTrail>`

Headless list renderer iterating through active popover cards in sequence.

```tsx
<PopoverTrail
  renderCard={(entry, index, isPinned) => (
    <PopoverCard key={entry.key} entry={entry} index={index} isPinned={isPinned}>
      <CardBody data={entry.data} />
    </PopoverCard>
  )}
/>
```

---

### `<PopoverTimeline>` & Timeline Subcomponents

Compound component rendering interactive visual breadcrumb steps and history undo/redo controls.

```tsx
<PopoverTimeline className="timeline-container">
  <PopoverTimeline.UndoButton className="btn-undo">Undo</PopoverTimeline.UndoButton>
  <PopoverTimeline.RedoButton className="btn-redo">Redo</PopoverTimeline.RedoButton>
  <PopoverTimeline.StepList>
    {(item, active) => (
      <PopoverTimeline.Step stepIndex={item.stepIndex} active={active}>
        {item.primaryKey}
      </PopoverTimeline.Step>
    )}
  </PopoverTimeline.StepList>
</PopoverTimeline>
```

#### Timeline Subcomponents

- `<PopoverTimeline.StepList>`: Renders the list of history steps using a render prop function `(item, active) => ReactNode`.
- `<PopoverTimeline.Step>`: Individual breadcrumb step item. Supports keyboard focus and click navigation.
- `<PopoverTimeline.UndoButton>`: Button triggering history undo.
- `<PopoverTimeline.RedoButton>`: Button triggering history redo.

---

### `<PopoverPortal>`

Renders children into `document.body` or a specified DOM target container via `ReactDOM.createPortal`.

---

### `<PopoverTrigger>`

Anchor component attaching click and hover event listeners to open popovers. Clones its single child element and attaches `aria-haspopup="dialog"` and `aria-expanded` attributes.

```tsx
<PopoverTrigger popoverKey="userStats" placement="bottom" offset={10}>
  <button type="button">View Statistics</button>
</PopoverTrigger>
```

---

## 3. Hooks & Selectors

### `usePopover<TData>(key)`

Unified facade hook providing data, status flags, layout coordinates, and actions for a popover key.

```tsx
const {
  data,
  error,
  isLoading,
  isOpen,
  isPinned,
  isTop,
  zIndex,
  offset,
  entry,
  close,
  pin,
  bringToFront,
  updateOffset,
} = usePopover<UserData>('userProfile');
```

#### Return Properties (`UsePopoverResult<TData>`)

- `data`: Resolved data payload, or `undefined` if pending or missing.
- `error`: Error object if data fetching failed, or `null`.
- `isLoading`: True if data fetching is currently in progress.
- `isOpen`: True if popover is active in trail or floating list.
- `isPinned`: True if popover is pinned to floating canvas.
- `isTop`: True if popover is topmost in the z-index depth stack.
- `zIndex`: 0-based depth index in the z-index stack.
- `offset`: `{ x: number, y: number }` drag coordinate offset vector.
- `entry`: Raw `TrailEntry<TData>` object, or `undefined`.
- `close()`: Callback closing the popover with exit transitions.
- `pin(rect?)`: Callback toggling pinned state with bounding rect coordinates.
- `bringToFront()`: Callback moving popover to topmost z-index.
- `updateOffset(x, y)`: Callback updating coordinate offset vector.

---

### `usePopoverData<TData>(key)`

Data selector hook. Leverages React 19 `use(promise)` for native Suspense support when `entry.dataPromise` is pending.

```tsx
function UserCard() {
  const data = usePopoverData<UserData>('userProfile');
  return <div>{data?.name}</div>;
}
```

---

### `usePopoverTimeline()`

Hook for interacting with timeline history state and navigation controls.

```tsx
const { history, currentIndex, canUndo, canRedo, undo, redo, jumpToStep } = usePopoverTimeline();
```

---

### `usePopoverCard(options)`

Low-level card positioning and interaction hook. Integrates Floating UI geometry, ARIA focus locking, keyboard arrow navigation, and state machine transition states.

---

### `usePopoverActions()`

Returns all store dispatcher methods (`closeByKey`, `togglePin`, `retryPopover`, `bringToFront`, `updateOffset`, `undo`, `redo`).

---

### `usePopoverGeometry(options)`

Calculates absolute coordinates (`top`, `left`). Accepts `enableSpatialCollision: true` to enable 2D QuadTree spatial collision resolution.

---

### `usePopoverDragAndDrop(options)`

Calculates 3D Euler rotation tilt angles (`rotationX`, `rotationY`, `rotationZ`) and drag offsets based on mouse movement velocity.

---

### `usePopoverHydration(key)`

Tracks async data loading status (`isLoading`, `error`) and provides a `reload()` callback.

```tsx
const { isLoading, error, reload } = usePopoverHydration('userProfile');
```

---

### `useIsPopoverOpen & State Selectors`

- `useIsPopoverOpen(key)`: Returns `true` if key is active in trail or floating list.
- `useIsPopoverPinned(key)`: Returns `true` if key is pinned.
- `usePopoverEntry(key)`: Returns `TrailEntry<TData> | undefined`.
- `usePopoverZIndex(key)`: Returns 0-based z-index depth index.
- `useIsPopoverTopMost(key)`: Returns `true` if key is topmost in stack.

---

## 4. Advanced Core Engines

### FSM Statechart Engine (`popoverFSMReducer` & `createPopoverFSM`)

Deterministic state machine reducer with a static $O(1)$ transition lookup table.

```ts
import { popoverFSMReducer, createPopoverFSM } from 'popover-trail';

// Pure reducer call:
const nextState = popoverFSMReducer(currentState, { type: 'TOGGLE_PIN' });

// Interpreter instance:
const fsm = createPopoverFSM('userProfile');
fsm.send({ type: 'RESOLVE_SUCCESS', data: { id: '123' } });
```

#### Valid FSM States (`PopoverStateValue`)

- `Idle`: Initial state before activation.
- `Hydrating`: Async data resolution in progress.
- `Resolved.Trailing`: Active in cascade trail.
- `Resolved.Pinned`: Modelessly pinned to canvas.
- `Error`: Data resolution failed.
- `Unmounting`: Exit transition animation active.

---

### DAG Cascading Graph (`PopoverDAG`)

Directed Acyclic Graph algorithm for querying topological ancestor and descendant paths.

```ts
import { PopoverDAG } from 'popover-trail';

const dag = new PopoverDAG();
dag.addEdge('parentCard', 'childCard');
const descendants = dag.getDescendants('parentCard');
const ancestors = dag.getAncestors('childCard');
const hasCycle = dag.detectCycle();
```

---

### QuadTree 2D Spatial Partitioning Index

2D spatial index for querying bounding box overlaps in $O(\log N)$ time.

```ts
import { QuadTree } from 'popover-trail';

const tree = new QuadTree({ x: 0, y: 0, width: 1920, height: 1080 });
tree.insert({ id: 'card1', bounds: { x: 100, y: 100, width: 300, height: 200 } });
const collisions = tree.retrieve([], { x: 120, y: 120, width: 300, height: 200 });
```

---

### PopoverSnapshotManager (BroadcastChannel Sync)

Cross-tab state persistence and synchronization engine via `BroadcastChannel` and `localStorage`.

```ts
import { PopoverSnapshotManager } from 'popover-trail';

const manager = new PopoverSnapshotManager('my-app-storage-key');
manager.saveSnapshot(currentState);
manager.subscribe((restoredState) => console.log('State updated from another tab:', restoredState));
```

---

## 5. Type Definitions & Data Interfaces

### `TrailEntry<TData = unknown>`

```ts
export interface TrailEntry<TData = unknown> {
  key: string;
  parentKey?: string;
  originalParentKey?: string;
  data?: TData;
  isLoading?: boolean;
  error?: Error | null;
  transitionStatus?: 'mounting' | 'mounted' | 'unmounting';
  rect?: DOMRect | null;
  pinnedLayoutPos?: { top: number; left: number };
  placement?: PopoverPlacement;
  offset?: number;
  hover?: HoverConfig;
  responsiveMode?: 'auto' | 'popover' | 'bottom-sheet' | 'modal';
  layoutStrategy?: 'floating-ui' | 'docked-bottom' | 'docked-top' | 'fixed-center';
  exitTransitionDuration?: number;
  baseZIndex?: number;
  cascadeOffsetStep?: number;
  cascadeOffsetDirection?: 'right' | 'left' | 'top' | 'bottom';
  ariaDescribedby?: string;
}
```

---

## 6. Complete Guardrail Warnings Registry (PT-101 to PT-125)

In non-production environments, `popover-trail` logs structured diagnostic warnings formatted as `[popover-trail warning PT-XXX]: <message>`.

| Code | Validator Name | Trigger Description |
|---|---|---|
| **PT-101** | `validatePopoverKey` | Popover key is missing, null, or consists entirely of whitespace. |
| **PT-102** | `validatePlacement` | Invalid layout placement string provided. |
| **PT-103** | `validateHoverDelays` | Open hover delay is outside valid range (0ms to 30000ms). |
| **PT-104** | `validateHoverDelays` | Close hover delay is outside valid range (0ms to 30000ms). |
| **PT-105** | `validateCascadeAncestry` | Circular cascade loop detected (popoverKey equals parentKey). |
| **PT-106** | `validateCardSubComponentScope` | `<PopoverCard>` subcomponent rendered outside `<PopoverCard>` container. |
| **PT-107** | `validateTimelineSubComponentScope` | `<PopoverTimeline>` subcomponent rendered outside `<PopoverTimeline>` container. |
| **PT-108** | `validateSchemaKey` | Key requested is not defined in the schema. |
| **PT-109** | `validateCascadeStep` | Cascade offset step is outside valid range (0px to 200px). |
| **PT-110** | `validateDefaultOffset` | Default gap offset is outside valid range (0px to 500px). |
| **PT-111** | `validateBaseZIndex` | Base z-index is invalid or negative. |
| **PT-112** | `validateExitDuration` | Exit duration is outside valid range (0ms to 10000ms). |
| **PT-113** | `validateProviderResolver` | `<PopoverProvider>` initialized without resolver callback or schema. |
| **PT-114** | `validateDragOffset` | Drag offset coordinates are NaN or out of bounds. |
| **PT-115** | `validateCascadeDepth` | Deep cascade stack detected (depth > 10). |
| **PT-116** | `validateStackGroup` | Stack group ID filter is an empty string. |
| **PT-117** | `validateHistoryCapacity` | Max history capacity is outside valid range (1 to 500). |
| **PT-118** | `validateTriggerEvent` | Trigger action dispatch called without valid anchor event. |
| **PT-119** | `validateSharedMemorySupport` | `useSharedMemory` requested but `SharedArrayBuffer` is unsupported. |
| **PT-120** | `validateHydrationError` | Data resolution promise rejected with error. |
| **PT-121** | `validatePinDragState` | Drag attempted on unpinned card that disables unpinned dragging. |
| **PT-122** | `validateStorageKey` | Storage key is empty or invalid. |
| **PT-123** | `validateQuadTreeBounds` | QuadTree dimensions non-positive or NaN. |
| **PT-124** | `validateFSMTransitionEvent` | FSM reducer received invalid transition event type. |
| **PT-125** | `validatePortalContainer` | `<PopoverPortal>` container DOM node is null or unmounted. |

---

## License

[MIT](LICENSE)

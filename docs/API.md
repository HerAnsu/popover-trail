# Popover Trail: Complete API Reference

Full specification for all components, hooks, schemas, state machine reducers, DAG algorithms, spatial indexes, and error validators in `popover-trail`.

> Looking for guides and examples? Read [Feature Guides & Manuals](GUIDES.md).

---

## Table of Contents

1. [Schema Builder & Unified Factory](#1-schema-builder--unified-factory)
   - [createPopoverSchema](#createpopoverschema)
   - [createPopoverTrail](#createpopovertrail)
2. [Components & Compound Layouts](#2-components--compound-layouts)
   - [PopoverProvider](#popoverprovider)
   - [PopoverCard](#popovercard)
   - [PopoverCard Subcomponents](#popovercard-subcomponents)
   - [PopoverTrail](#popovertrail)
   - [PopoverTimeline](#popovertimeline)
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
4. [Advanced Core Engines](#4-advanced-core-engines)
   - [FSM Statechart Engine (popoverFSMReducer & createPopoverFSM)](#fsm-statechart-engine-popoverfsmreducer--createpopoverfsm)
   - [DAG Cascading Graph (PopoverDAG)](#dag-cascading-graph-popoverdag)
   - [QuadTree Spatial Partitioning Index](#quadtree-spatial-partitioning-index)
   - [PopoverSnapshotManager (BroadcastChannel Sync)](#popoversnapshotmanager-broadcastchannel-sync)
5. [Type Definitions & Data Structures](#5-type-definitions--data-structures)
   - [TrailEntry](#trailentry)
   - [PopoverStore](#popoverstore)
   - [PopoverActions](#popoveractions)
   - [PopoverDisplayOptions](#popoverdisplayoptions)
6. [Development Guardrail Warnings (PT-101 to PT-125)](#6-development-guardrail-warnings-pt-101-to-pt-125)

---

## 1. Schema Builder & Unified Factory

### `createPopoverSchema(definition)`

Builds a type-safe popover schema with key autocompletion, typed hooks, typed triggers, and a unified resolver.

```tsx
import { createPopoverSchema } from 'popover-trail';

export const appSchema = createPopoverSchema({
  userProfile: {
    resolver: async (key, parentData) => fetchUser(key),
    placement: 'right',
    offset: 12,
  },
  userStats: {
    resolver: async (key, parentData: { id: string }) => fetchStats(parentData.id),
    placement: 'bottom',
  },
});
```

#### Return Object Properties

- `definition`: Raw schema definition map.
- `keys`: Strongly-typed map of auto-completing string keys (`appSchema.keys.userProfile`).
- `createResolver()`: Factory generating the unified `resolveData` callback for `<PopoverProvider schema={appSchema}>`.
- `Trigger`: Typed trigger component pre-bound to valid schema keys (`<appSchema.Trigger popoverKey="userProfile">`).
- `useData(key)`: Hook returning typed data for the schema node.
- `useEntry(key)`: Hook returning the full `TrailEntry<TData>` for the schema node.
- `useActions()`: Hook returning store dispatch methods pre-bound to schema keys.

---

### `createPopoverTrail(definition?)`

Overloaded factory function. When called with a schema definition object, it delegates directly to `createPopoverSchema`. When called without arguments, it returns generic typed helpers for custom context wrapping.

```tsx
// Schema mode (Recommended):
const schemaInstance = createPopoverTrail({
  cardKey: {
    resolver: (key) => ({ id: key }),
  },
});

// Generic mode:
const customTrail = createPopoverTrail<MyDataType, MyContextType>();
```

---

## 2. Components & Compound Layouts

### `<PopoverProvider>`

Instantiates the Zustand store instance, manages global event listeners (Escape key, click-outside), and provides context.

```tsx
<PopoverProvider
  schema={appSchema}
  clickOutside={{ enabled: true }}
  baseZIndex={1000}
  cascadeOffsetStep={12}
>
  <App />
  <PopoverTrail />
</PopoverProvider>
```

#### Key Props

- `schema`: Popover schema instance returned by `createPopoverSchema`.
- `resolveData`: Custom async resolver function `(key, parentData, context, signal) => TData | Promise<TData>`.
- `initialContext`: Initial shared global context object.
- `clickOutside`: Object configuring click-outside auto-close behavior `{ enabled: boolean, ignoreSelectors?: string[] }`.
- `enableKeyboardClose`: Close topmost popover on `Escape` key (default: `true`).
- `baseZIndex`: Base z-index depth (default: `1000`).
- `cascadeOffsetStep`: Pixel offset step per nesting level (default: `8`).
- `exitTransitionDuration`: Unmount delay in milliseconds for CSS exit animations (default: `0`).

---

### `<PopoverCard>`

Polymorphic container element for individual popover cards. Binds coordinates, accessibility attributes, and CSS variables automatically.

```tsx
<PopoverCard entry={entry} index={index} isPinned={isPinned} className="my-popover">
  <PopoverCard.Handle>Drag Handle</PopoverCard.Handle>
  <PopoverCard.Content>{entry.data?.text}</PopoverCard.Content>
  <PopoverCard.PinButton />
  <PopoverCard.CloseButton />
</PopoverCard>
```

#### Compound Subcomponents

- `<PopoverCard.Handle>`: Drag handle region for moving pinned cards.
- `<PopoverCard.PinButton>`: Toggle button for modeless pinning.
- `<PopoverCard.CloseButton>`: Close action button.
- `<PopoverCard.Content>`: Wrapper container for card content.

---

### `<PopoverTrail>`

Headless list renderer that renders active popover cards in sequence.

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

### `<PopoverTimeline>`

Visual breadcrumb and history timeline component supporting undo, redo, and step jumping.

```tsx
<PopoverTimeline className="my-timeline">
  <PopoverTimeline.UndoButton />
  <PopoverTimeline.RedoButton />
  <PopoverTimeline.StepList>
    {(item, active) => (
      <PopoverTimeline.Step stepIndex={item.stepIndex} active={active}>
        {item.primaryKey}
      </PopoverTimeline.Step>
    )}
  </PopoverTimeline.StepList>
</PopoverTimeline>
```

---

### `<PopoverPortal>`

Renders children into `document.body` or a specified DOM target container via `ReactDOM.createPortal`.

---

### `<PopoverTrigger>`

Interactive anchor element binding click and hover event listeners to open popovers. Automatically sets WAI-ARIA `aria-haspopup="dialog"` and `aria-expanded` attributes.

```tsx
<PopoverTrigger popoverKey="userProfile" placement="right">
  <button type="button">Open Profile</button>
</PopoverTrigger>
```

---

## 3. Hooks & Selectors

### `usePopover<TData>(key)`

Unified facade hook returning data, status flags, layout coordinates, and actions for a popover key.

```tsx
const { data, isOpen, isPinned, isTop, zIndex, close, pin, updateOffset } = usePopover<UserData>('userProfile');
```

---

### `usePopoverData<TData>(key)`

Data selector hook. Supports React 19 Suspense when `entry.dataPromise` is pending.

```tsx
const data = usePopoverData<UserData>('userProfile');
```

---

### `usePopoverTimeline()`

Hook for reading timeline history state and triggering navigation actions.

```tsx
const { history, canUndo, canRedo, undo, redo, jumpToStep } = usePopoverTimeline();
```

---

### `usePopoverCard(options)`

Low-level card lifecycle hook. Connects Floating UI geometry calculations, ARIA focus locking, keyboard shortcuts, and state machine transition states.

---

### `usePopoverActions()`

Returns all store action dispatchers (`closeByKey`, `togglePin`, `retryPopover`, `bringToFront`, `updateOffset`, `undo`, `redo`).

---

### `usePopoverGeometry(options)`

Computes absolute placement coordinates (`top`, `left`). Supports Floating UI middleware and optional QuadTree 2D spatial collision resolution.

---

### `usePopoverDragAndDrop(options)`

Calculates 3D Euler tilt angles (`rotationX`, `rotationY`, `rotationZ`) and drag coordinates based on drag velocity.

---

### `usePopoverHydration(key)`

Tracks async data loading status (`isLoading`, `error`) and provides a `reload()` callback.

---

## 4. Advanced Core Engines

### FSM Statechart Engine (`popoverFSMReducer` & `createPopoverFSM`)

Static $O(1)$ lookup table state machine reducer ensuring zero invalid state transitions.

```ts
import { popoverFSMReducer } from 'popover-trail';

const nextState = popoverFSMReducer(currentState, { type: 'TOGGLE_PIN' });
```

---

### DAG Cascading Graph (`PopoverDAG`)

Directed Acyclic Graph algorithm for querying topological ancestor and descendant paths.

```ts
import { PopoverDAG } from 'popover-trail';

const dag = new PopoverDAG();
dag.addEdge('parentCard', 'childCard');
const descendants = dag.getDescendants('parentCard');
```

---

### QuadTree Spatial Partitioning Index

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

## 5. Type Definitions & Data Structures

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
}
```

---

## 6. Development Guardrail Warnings (PT-101 to PT-125)

In non-production environments, `popover-trail` logs structured diagnostic warnings formatted as `[popover-trail warning PT-XXX]: <message>`.

| Code | Validator Name | Description |
|---|---|---|
| **PT-101** | `validatePopoverKey` | Popover key is missing, null, or whitespace. |
| **PT-102** | `validatePlacement` | Invalid layout placement string provided. |
| **PT-103** | `validateHoverDelays` | Open hover delay is outside valid range (0ms to 30000ms). |
| **PT-104** | `validateHoverDelays` | Close hover delay is outside valid range (0ms to 30000ms). |
| **PT-105** | `validateCascadeAncestry` | Circular cascade loop detected (key equals parentKey). |
| **PT-106** | `validateCardSubComponentScope` | `<PopoverCard>` subcomponent rendered outside parent container. |
| **PT-107** | `validateTimelineSubComponentScope` | `<PopoverTimeline>` subcomponent rendered outside parent container. |
| **PT-108** | `validateSchemaKey` | Key requested is not defined in the schema. |
| **PT-109** | `validateCascadeStep` | Cascade offset step outside range (0px to 200px). |
| **PT-110** | `validateDefaultOffset` | Default gap offset outside range (0px to 500px). |
| **PT-111** | `validateBaseZIndex` | Base z-index is invalid or negative. |
| **PT-112** | `validateExitDuration` | Exit duration outside range (0ms to 10000ms). |
| **PT-113** | `validateProviderResolver` | Provider initialized without resolver callback or schema. |
| **PT-114** | `validateDragOffset` | Drag offset coordinates NaN or out of bounds. |
| **PT-115** | `validateCascadeDepth` | Deep cascade stack detected (depth > 10). |
| **PT-116** | `validateStackGroup` | Stack group ID is an empty string. |
| **PT-117** | `validateHistoryCapacity` | Max history capacity out of range (1 to 500). |
| **PT-118** | `validateTriggerEvent` | Trigger dispatch called without anchor event. |
| **PT-119** | `validateSharedMemorySupport` | SharedArrayBuffer missing in environment. |
| **PT-120** | `validateHydrationError` | Data resolution promise rejected with error. |
| **PT-121** | `validatePinDragState` | Drag attempted on unpinned card that disables unpinned dragging. |
| **PT-122** | `validateStorageKey` | Storage key is empty or invalid. |
| **PT-123** | `validateQuadTreeBounds` | QuadTree dimensions non-positive or NaN. |
| **PT-124** | `validateFSMTransitionEvent` | Invalid FSM transition event type. |
| **PT-125** | `validatePortalContainer` | Portal container DOM node is null or unmounted. |

---

## License

[MIT](LICENSE)

# Popover Trail API reference

Complete technical specification for components, hooks, schema builders, core engines, type definitions, and diagnostic validators in `popover-trail`.

---

## Table of contents

1. [Typed schema builder and factory](#1-typed-schema-builder-and-factory)
   - [createPopoverSchema](#createpopoverschema)
   - [createPopoverTrail](#createpopovertrail)
   - [definePopoverContext](#definepopovercontext)
2. [Components and compound layouts](#2-components-and-compound-layouts)
   - [PopoverProvider](#popoverprovider)
   - [PopoverCard and compound subcomponents](#popovercard-and-compound-subcomponents)
   - [PopoverTrail](#popovertrail)
   - [PopoverTimeline and subcomponents](#popovertimeline-and-subcomponents)
   - [PopoverPortal](#popoverportal)
   - [PopoverTrigger](#popovertrigger)
3. [Hooks and selectors](#3-hooks-and-selectors)
   - [usePopover](#usepopover)
   - [usePopoverData](#usepopoverdata)
   - [usePopoverTimeline](#usepopovertimeline)
   - [usePopoverCard](#usepopovercard)
   - [usePopoverActions](#usepopoveractions)
   - [usePopoverGeometry](#usepopovergeometry)
   - [usePopoverDragAndDrop](#usepopoverdraganddrop)
   - [usePopoverHydration](#usepopoverhydration)
   - [useIsPopoverOpen and state selectors](#useispopoveropen-and-state-selectors)
4. [DND sub-package (popover-trail/dnd)](#4-dnd-sub-package-popover-traildnd)
   - [PopoverCanvas](#popovercanvas)
   - [usePopoverDraggableCard](#usepopoverdraggablecard)
5. [Core engines](#5-core-engines)
   - [FSM statechart engine](#fsm-statechart-engine)
   - [DAG cascading graph](#dag-cascading-graph)
   - [QuadTree 2D spatial partitioning index](#quadtree-2d-spatial-partitioning-index)
   - [PopoverSnapshotManager](#popoversnapshotmanager)
6. [Types and discriminated unions](#6-types-and-discriminated-unions)
   - [TrailEntry](#trailentry)
   - [PopoverFSMState](#popoverfsmstate)
   - [PopoverTimelineStep](#popovertimelinestep)
   - [PopoverEntryDiscriminatedState](#popoverentrydiscriminatedstate)
   - [PolymorphicPropsWithRef](#polymorphicpropswithref)
   - [TypedMiddlewarePatch](#typedmiddlewarepatch)
7. [Type guards and helper utilities](#7-type-guards-and-helper-utilities)
   - [Entry type guards](#entry-type-guards)
   - [Anchor type guards](#anchor-type-guards)
   - [Store event type guards](#store-event-type-guards)
   - [Type-safe builder helpers](#type-safe-builder-helpers)
8. [Utilities, caching, and controllers](#8-utilities-caching-and-controllers)
   - [SimplePopoverCache](#simplepopovercache)
   - [createWorkerResolver](#createworkerresolver)
   - [createPopoverController](#createpopovercontroller)
9. [Guardrail warnings registry (PT-101 to PT-127)](#9-guardrail-warnings-registry)

---

## 1. Typed schema builder and factory

### `createPopoverSchema(definition)`

Factory function creating a typed schema instance. Consolidates data resolvers, placement defaults, key unions, typed triggers, and typed hooks into a single declaration.

```tsx
import { createPopoverSchema } from 'popover-trail';

export const appSchema = createPopoverSchema({
  userProfile: {
    resolver: async (key) => {
      const res = await fetch(`/api/users/${key}`);
      return res.json();
    },
    placement: 'right',
    offset: 12,
    hover: { openDelay: 200, closeDelay: 300 },
  },
  userStats: {
    resolver: async (key, parentData: { id: string }) => {
      const res = await fetch(`/api/users/${parentData.id}/stats`);
      return res.json();
    },
    placement: 'bottom',
  },
});
```

#### Node options (`PopoverSchemaNode<TData, TParentData, TContext>`)

- `resolver`: Async or synchronous data fetcher function `(key, parentData?, context?) => TData | Promise<TData>`.
- `placement`: Default alignment placement (`'top'`, `'bottom'`, `'left'`, `'right'`, `'auto'`, or aligned variants like `'bottom-start'`).
- `offset`: Gap distance in pixels between trigger element and card container.
- `collision`: Boundary collision settings object `{ boundary?, padding?, flip?, shift?, size? }`.
- `hover`: Hover trigger configuration `{ openDelay?: number, closeDelay?: number, closeOnMouseLeave?: boolean }`.
- `allowDragWhenPinned`: Allow mouse dragging when card is pinned (default: `true`).
- `allowDragWhenUnpinned`: Allow mouse dragging when card is in trailing stack (default: `true`).

#### Schema instance properties (`PopoverSchemaInstance<TSchema>`)

- `definition`: Raw input definition object.
- `keys`: Map of schema key strings (e.g. `appSchema.keys.userProfile`).
- `createResolver()`: Factory function generating the unified `resolveData` callback for `<PopoverProvider schema={appSchema}>`.
- `Trigger`: Typed trigger component `<appSchema.Trigger popoverKey="userProfile">`.
- `useData(key)`: Hook returning typed data payload for the specified key.
- `useEntry(key)`: Hook returning full `TrailEntry<TData>` for the specified key.
- `useActions()`: Hook returning store dispatch methods bound to schema keys.

---

### `createPopoverTrail(definition?)`

Overloaded factory supporting schema-driven definitions and generic type bindings.

```tsx
// 1. Schema Mode:
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

### `definePopoverContext<TContext>()`

Factory function generating pre-bound React Context hooks and provider components typed for a specific global `TContext` structure. Eliminates repeating generic parameter types across application components.

```tsx
import { definePopoverContext } from 'popover-trail';

export interface AppContext {
  userId: string;
  theme: 'light' | 'dark';
}

export const { Provider, useContext, useActions, useStoreApi } = definePopoverContext<AppContext>();
```

---

## 2. Components and compound layouts

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

#### Provider properties (`PopoverProviderProps<TData, TContext>`)

| Prop | Type | Default | Description |
|---|---|---|---|
| `schema` | `PopoverSchemaInstance` | `undefined` | Typed schema instance generated by `createPopoverSchema`. |
| `resolveData` | `PopoverResolver` | `undefined` | Custom data resolver function `(key, parentData, context, signal) => TData \| Promise<TData>`. |
| `initialContext` | `TContext` | `undefined` | Initial global shared context object passed to all resolvers. |
| `clickOutside` | `ClickOutsideConfig` | `{ enabled: true }` | Configuration object for click-outside auto-closing. |
| `enableKeyboardClose` | `boolean` | `true` | Close topmost popover when Escape key is pressed. |
| `enableArrowNavigation` | `boolean` | `true` | Enable keyboard arrow key navigation between active popovers. |
| `closePinnedDescendants` | `boolean` | `false` | Close pinned floating child popovers when a parent closes. |
| `allowDragWhenPinned` | `boolean` | `true` | Allow mouse/touch dragging when card is pinned/floating. |
| `allowDragWhenUnpinned` | `boolean` | `true` | Allow mouse/touch dragging when card is unpinned/trailing. |
| `cache` | `PopoverCache<TData>` | `undefined` | Custom synchronous or asynchronous data cache implementation. |
| `collision` | `CollisionConfig` | `undefined` | Global boundary collision configuration. |
| `baseZIndex` | `number` | `1000` | Base z-index depth factor. |
| `cascadeOffsetStep` | `number` | `8` | Pixel offset shift added per level of nesting. |
| `exitTransitionDuration` | `number` | `0` | Unmount delay in milliseconds for CSS exit animations. |
| `defaultOffset` | `number` | `8` | Default gap offset distance in pixels. |
| `responsiveMode` | `'auto' \| 'popover' \| 'bottom-sheet' \| 'modal'` | `'auto'` | Responsive layout transformation mode. |
| `mobileBreakpoint` | `number` | `640` | Viewport width threshold in pixels for mobile layout transformation. |
| `stackGroup` | `string \| null` | `null` | Active stack group zone ID filter. |
| `focusLockOptions` | `FocusLockOptions` | `undefined` | Focus trap configuration options. |
| `components` | `PopoverSlotComponents` | `undefined` | Custom UI slot component overrides. |
| `zIndexBaseMap` | `ZIndexBaseMap` | `undefined` | Per-stack-group base z-index mapping. |
| `debug` | `boolean` | `false` | Log Zustand state mutations to console. |

---

### `<PopoverCard>` and compound subcomponents

Polymorphic container element for popover cards. Binds coordinates, accessibility attributes (`role="dialog"`), data attributes (`data-state`, `data-pinned`, `data-key`), and CSS custom variables automatically. Supports full polymorphic `ref` inference via `PolymorphicPropsWithRef<E, P>`.

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

#### Card properties (`PopoverCardProps<E, TData>`)

- `as`: HTML element tag or React component type (default: `'div'`).
- `entry`: Active `TrailEntry<TData>` represented by this card.
- `index`: Virtual depth index of the card.
- `isPinned`: True if card is pinned to the canvas.
- `placement`: Preferred placement alignment direction relative to anchor.

#### Compound subcomponents

- `<PopoverCard.Handle>`: Drag handle element. Attaches ARIA role attributes and drag event listeners.
- `<PopoverCard.PinButton>`: Toggle button for pinning. Invokes `actions.togglePin(key)`.
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

### `<PopoverTimeline>` and subcomponents

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

---

### `<PopoverPortal>`

Renders children into `document.body` or a specified DOM target container via `ReactDOM.createPortal`. Validates target DOM node presence before rendering.

---

### `<PopoverTrigger>`

Anchor component attaching click and hover event listeners to open popovers. Clones its single child element and attaches `aria-haspopup="dialog"` and `aria-expanded` attributes.

```tsx
<PopoverTrigger popoverKey="userStats" placement="bottom" offset={10}>
  <button type="button">View Statistics</button>
</PopoverTrigger>
```

---

## 3. Hooks and selectors

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

Card positioning and interaction hook. Integrates Floating UI geometry, ARIA focus locking, keyboard arrow navigation, and transition state updates.

---

### `usePopoverActions()`

Returns all store dispatcher methods (`closeByKey`, `togglePin`, `retryPopover`, `bringToFront`, `updateOffset`, `undo`, `redo`).

---

### `usePopoverGeometry(options)`

Calculates absolute layout coordinates (`top`, `left`). Accepts `enableSpatialCollision: true` to enable 2D QuadTree spatial collision resolution.

---

### `usePopoverDragAndDrop(options)`

Calculates 3D Euler rotation tilt angles (`rotationX`, `rotationY`, `rotationZ`) and drag offsets based on mouse movement velocity.

---

### `usePopoverHydration(key)`

Tracks async data loading status (`isLoading`, `error`) and provides a `reload()` callback.

---

### `useIsPopoverOpen` and state selectors

Fine-grained selector hooks exported from `usePopoverSelectors`:

- `useIsPopoverOpen(key)`: Returns `true` if key is active in trail or floating list.
- `useIsPopoverPinned(key)`: Returns `true` if key is pinned.
- `usePopoverEntry(key)`: Returns `TrailEntry<TData> | undefined`.
- `usePopoverZIndex(key)`: Returns 0-based z-index depth.
- `useIsPopoverTopMost(key)`: Returns `true` if key is topmost in stack.
- `usePopoverTrail()`: Returns active trailing cascade array.
- `usePopoverFloating()`: Returns active floating card array.
- `usePopoverOffsets()`: Returns record of all card drag offsets.
- `usePopoverContext<TContext>()`: Returns current global context.

---

## 4. DND sub-package (`popover-trail/dnd`)

Separate export entry point providing drag-and-drop canvas capabilities powered by `@dnd-kit/core`.

```tsx
import { PopoverCanvas, PopoverCard } from 'popover-trail/dnd';
```

#### `<PopoverCanvas>`

Drag-and-drop context container for floating cards.

```tsx
<PopoverCanvas restrictToWindow={true} restrictToContainer={false}>
  {({ entry, index, isPinned }) => (
    <PopoverCard entry={entry} index={index} isPinned={isPinned}>
      <CardContent entry={entry} />
    </PopoverCard>
  )}
</PopoverCanvas>
```

#### `usePopoverDraggableCard(options)`

Hook attaching `@dnd-kit` drag handles and spring tilt physics to a card component.

---

## 5. Core engines

### FSM statechart engine

Deterministic state machine reducer with static O(1) transition lookup table (`popoverFSMReducer` & `createPopoverFSM`). `PopoverFSMState<TData>` is a 6-state discriminated union allowing zero-assertion narrowing:

- `IdleFSMState` (`value: 'Idle'`)
- `HydratingFSMState` (`value: 'Hydrating'`)
- `ResolvedTrailingFSMState` (`value: 'Resolved.Trailing'`, narrows `context.data` to `TData`)
- `ResolvedPinnedFSMState` (`value: 'Resolved.Pinned'`, narrows `context.data` to `TData`)
- `ErrorFSMState` (`value: 'Error'`, narrows `context.error` to `Error`)
- `UnmountingFSMState` (`value: 'Unmounting'`)

```ts
import { popoverFSMReducer, createPopoverFSM } from 'popover-trail';

const fsmState = fsm.getState();
if (fsmState.value === 'Resolved.Trailing') {
  console.log(fsmState.context.data); // Narrowed to TData safely
}
```

---

### DAG cascading graph

`PopoverDAG` class for querying topological ancestor and descendant paths. Capped at 500 traversal nodes to prevent circular loops.

```ts
import { PopoverDAG } from 'popover-trail';

const dag = new PopoverDAG();
dag.addNode('parentCard');
dag.addNode('childCard', 'parentCard');
const descendants = dag.getDescendantKeys('parentCard');
```

---

### QuadTree 2D spatial partitioning index

2D spatial index for querying bounding box overlaps in O(log N) time.

```ts
import { QuadTree } from 'popover-trail';

const tree = new QuadTree({ x: 0, y: 0, width: 1920, height: 1080 });
tree.insert({ id: 'card1', bounds: { x: 100, y: 100, width: 300, height: 200 } });
const collisions = tree.retrieve([], { x: 120, y: 120, width: 300, height: 200 });
```

---

### PopoverSnapshotManager

Cross-tab state persistence and synchronization engine via `BroadcastChannel` and `localStorage`. Sanitizes keys against prototype pollution attacks before restoration.

```ts
import { PopoverSnapshotManager } from 'popover-trail';

const manager = new PopoverSnapshotManager({ storageKey: 'my-app-storage', enableBroadcastChannel: true });
manager.saveSnapshot(snapshot);
```

---

## 6. Types and discriminated unions

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

### `PopoverTimelineStep<TData>`

Discriminated union type representing navigation steps in popover timeline history:

```ts
export type PopoverTimelineStep<TData = unknown> =
  | ActiveTimelineStep<TData>
  | UndoneTimelineStep<TData>;

export interface ActiveTimelineStep<TData = unknown> {
  status: 'active';
  stepIndex: number;
  trailKeys: string[];
  pinnedKeys: string[];
  primaryKey: string;
  timestamp?: number;
  payload?: TData;
  canUndo: boolean;
  canRedo: boolean;
}

export interface UndoneTimelineStep<TData = unknown> {
  status: 'undone';
  stepIndex: number;
  trailKeys: string[];
  pinnedKeys: string[];
  primaryKey: string;
  timestamp?: number;
  payload?: TData;
  canUndo: false;
  canRedo: true;
}
```

---

### `PopoverEntryDiscriminatedState<TData>`

Discriminated union for asynchronous resolution state pattern matching:

```ts
export type PopoverEntryDiscriminatedState<TData = unknown> =
  | { status: 'loading'; isLoading: true; data: undefined; error: null }
  | { status: 'error'; isLoading: false; data: undefined; error: Error }
  | { status: 'success'; isLoading: false; data: TData; error: null };
```

---

### `PolymorphicPropsWithRef<E, P>`

Helper utility for building custom polymorphic popover card components with element ref inference:

```ts
export type PolymorphicRef<E extends React.ElementType> =
  React.ComponentPropsWithRef<E>['ref'];

export type PolymorphicPropsWithRef<
  E extends React.ElementType,
  P = {},
> = P & { as?: E } & Omit<React.ComponentPropsWithoutRef<E>, keyof P | 'as'> & {
    ref?: PolymorphicRef<E>;
  };
```

---

### `TypedMiddlewarePatch<TData, TContext, TPopoverKey>`

Strongly typed state patch signature returned by store middleware interceptors:

```ts
export type TypedMiddlewarePatch<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = Partial<PopoverStateData<TData, TContext>>;
```

---

## 7. Type guards and helper utilities

All executable type guards and helper converters are exported from `utils/typeGuards`:

### Entry type guards

- `isResolvedEntry(entry)`: Narrows `entry.data` to `TData`.
- `isLoadingEntry(entry)`: Narrows `entry.isLoading` to `true`.
- `isErrorEntry(entry)`: Narrows `entry.error` to `Error`.
- `getEntryState(entry)`: Extracts `PopoverEntryDiscriminatedState<TData>`.

### Anchor type guards

- `isVirtualElementAnchor(source)`: Narrows `AnchorEventLike` to Floating UI `VirtualElement`.
- `isEventAnchor(source)`: Narrows `AnchorEventLike` to DOM event with `currentTarget`.
- `toValidatedAnchorRef(source)`: Converts event source into guaranteed `ValidatedAnchorRef`.
- `createVirtualElement(x, y, w, h)`: Creates a `VirtualElement` positioning anchor from coordinates.

### Store event type guards

- `isStoreEvent(event, type)`: Generic discriminator guard for `PopoverStoreEvent<TData>`.
- `isOpenRootEvent(event)`, `isPushNestedEvent(event)`, `isCloseEvent(event)`, `isPinEvent(event)`, `isUnpinEvent(event)`, `isResolveStartEvent(event)`, `isResolveSuccessEvent(event)`, `isResolveErrorEvent(event)`, `isClearEvent(event)`.

### Type-safe builder helpers

- `createPopoverKey(key)`: Returns branded `PopoverKey<T>` instance.
- `definePopoverResolver(resolver)` / `createPopoverResolver(resolver)`: Infers typed `PopoverResolver<TData, TContext>`.
- `definePopoverConfig(config)`: Type-safe display configuration builder.
- `definePopoverMiddleware(mw)`: Type-safe middleware definition builder.
- `toViewportX(x)` / `toViewportY(y)`: Converts number into branded `ViewportX` / `ViewportY` coordinate.

---

## 8. Utilities, caching, and controllers

### `SimplePopoverCache`

Generic in-memory cache implementation with TTL record expiration, maximum size eviction, background garbage collection, and hit/miss statistics.

```ts
import { SimplePopoverCache } from 'popover-trail';

const cache = new SimplePopoverCache(300000, 50); // 5-minute TTL, max 50 items
cache.set('userProfile', userData);
const data = cache.get('userProfile');
```

---

### `createWorkerResolver`

Offloads data resolution tasks to a background Web Worker thread. Supports inline resolver functions, worker script URLs, and worker instances.

```ts
import { createWorkerResolver } from 'popover-trail';

const workerResolver = createWorkerResolver(
  async (key: string, parentData?: unknown) => {
    const res = await fetch(`/api/nodes/${key}`);
    return res.json();
  },
  { timeoutMs: 10000, autoRestart: true }
);
```

---

### `createPopoverController`

Imperative controller for inspecting and dispatching popover actions outside of React component trees (e.g. Redux actions, WebSocket handlers, or Vanilla JS modules).

```ts
import { createPopoverController } from 'popover-trail';

const controller = createPopoverController(storeApi);
controller.openRoot('owner-id', { key: 'userProfile' });
```

---

## 9. Guardrail warnings registry

In development mode (`NODE_ENV !== 'production'`), `popover-trail` logs structured diagnostic warnings formatted as `[popover-trail warning PT-XXX]: <message>`.

| Code | Validator name | Trigger description |
|---|---|---|
| **PT-101** | `validatePopoverKey` | Popover key is missing, null, empty, or uses reserved JS property names (`__proto__`, `constructor`, `prototype`). |
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
| **PT-126** | `validateFactoryPlacement` | `createPopoverTrail()` invoked inside React render pass instead of top-level scope. |
| **PT-127** | `validateStoreControllerInstance` | `createPopoverController()` received invalid Zustand store instance. |

---

## License

[MIT](LICENSE)

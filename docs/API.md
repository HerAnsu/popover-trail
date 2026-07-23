# Popover Trail: API Reference (Master Specification)

Exhaustive, master-level API documentation for all components, compound subcomponents, hooks, type definitions, type guards, factories, utilities, and `popover-trail/dnd` canvas extensions.

> Looking for step-by-step feature guides and usage tutorials? Check out [Feature Guides & Manuals](GUIDES.md).

---

## Table of Contents

1. [Type Definitions & Data Interfaces](#1-type-definitions--data-interfaces)
   - [TrailEntry](#trailentry)
   - [PopoverStore](#popoverstore)
   - [PopoverActions](#popoveractions)
   - [PopoverDisplayOptions](#popoverdisplayoptions)
   - [HoverConfig](#hoverconfig)
   - [FocusLockOptions](#focuslockoptions)
   - [ZIndexBaseMap](#zindexbasemap)
   - [PopoverSlotComponents](#popoverslotcomponents)
   - [PopoverPlacement & Layout Strategy](#popoverplacement--layout-strategy)
   - [PopoverTransitionStatus](#popovertransitionstatus)
   - [KeyboardShortcutMap](#keyboardshortcutmap)
   - [PopoverEntryDiscriminatedState](#popoverentrydiscriminatedstate)
2. [Components & Context](#2-components--context)
   - [PopoverProvider](#popoverprovider)
   - [PopoverCard](#popovercard)
   - [PopoverCard Subcomponents](#popovercard-subcomponents)
   - [PopoverTrail](#popovertrail)
   - [PopoverPortal](#popoverportal)
   - [PopoverTrigger](#popovertrigger)
   - [PopoverCardContext & usePopoverCardContext](#popovercardcontext--usepopovercardcontext)
3. [Core Hooks](#3-core-hooks)
   - [usePopoverCard](#usepopovercard)
   - [usePopover](#usepopover)
   - [usePopoverTrigger](#usepopovertrigger)
   - [usePopoverNestedTrigger](#usepopovernestedtrigger)
   - [usePopoverActions](#usepopoveractions)
   - [usePopoverGeometry](#usepopovergeometry)
   - [usePopoverDragAndDrop](#usepopoverdraganddrop)
4. [State & Helper Hooks](#4-state--helper-hooks)
   - [usePopoverStore](#usepopoverstore)
   - [usePopoverStoreApi](#usepopoverstoreapi)
   - [usePopoverTrail](#usepopovertrail)
   - [usePopoverFloating](#usepopoverfloating)
   - [usePopoverOffsets](#usepopoveroffsets)
   - [usePopoverEntry](#usepopoverentry)
   - [useIsPopoverPinned](#useispopoverpinned)
   - [useIsPopoverOpen](#useispopoveropen)
   - [usePopoverZIndex](#usepopoverzindex)
   - [useIsPopoverTopMost](#useispopovertopmost)
   - [usePopoverOffset](#usepopoveroffset)
   - [usePopoverContext](#usepopovercontext)
   - [usePopoverHydration](#usepopoverhydration)
   - [useEventListener](#useeventlistener)
5. [DND Sub-package (`popover-trail/dnd`)](#5-dnd-sub-package-popover-traildnd)
   - [PopoverCanvas](#popovercanvas)
   - [usePopoverDraggableCard](#usepopoverdraggablecard)
   - [PopoverCard (DND version)](#popovercard-dnd-version)
6. [Factories & Store Initialization](#6-factories--store-initialization)
   - [createPopoverTrail](#createpopovertrail)
   - [createPopoverStore](#createpopoverstore)
7. [Type Guards & Event Predicates](#7-type-guards--event-predicates)
   - [isResolvedEntry](#isresolvedentry)
   - [isLoadingEntry](#isloadingentry)
   - [isErrorEntry](#iserrorentry)
   - [getEntryState](#getentrystate)
   - [createPopoverKey](#createpopoverkey)
   - [createPopoverResolver](#createpopoverresolver)
   - [createVirtualElement](#createvirtualelement)
   - [isOpenRootEvent](#isopenrootevent)
   - [isPushNestedEvent](#ispushnestedevent)
   - [isCloseEvent](#iscloseevent)
   - [isPinEvent](#ispinevent)
   - [isResolveErrorEvent](#isresolveerrorevent)
8. [Utilities, Caching, & Controller](#8-utilities-caching--controller)
   - [SimplePopoverCache](#simplepopovercache)
   - [createWorkerResolver](#createworkerresolver)
   - [createPopoverController](#createpopovercontroller)
   - [clampDragCoordinates](#clampdragcoordinates)
   - [computeTiltMatrix](#computetiltmatrix)
   - [applyDragFriction](#applydragfriction)
   - [getPopoverStyles](#getpopoverstyles)
   - [invariant](#invariant)

---

## 1. Type Definitions & Data Interfaces

### `TrailEntry<TData = unknown>`

Internal node structure representing an active popover card in the trail or floating array.

```ts
export interface TrailEntry<TData = unknown> {
  /** Unique key identifier for the popover card. */
  key: string;
  /** Key of the parent popover if this entry is nested; undefined for root entries. */
  parentKey?: string;
  /** Resolved data payload object once fetching completes. */
  data?: TData;
  /** True if data fetching is currently in progress. */
  isLoading?: boolean;
  /** Error object if data fetching failed. */
  error?: Error;
  /** True if the card has been pinned to the floating canvas. */
  isPinned?: boolean;
  /** Relative alignment placement preference. */
  placement?: PopoverPlacement;
  /** Pixel offset distance from anchor element. */
  offset?: number;
  /** Hover configuration options. */
  hover?: HoverConfig;
  /** Keyboard shortcuts handler map. */
  keyboardShortcuts?: KeyboardShortcutMap;
  /** Focus trapping options. */
  focusLockOptions?: FocusLockOptions;
  /** Dragging constraint axis ('x' | 'y' | 'both'). */
  dragAxis?: DragAxis;
  /** Allow dragging when pinned (default: true). */
  allowDragWhenPinned?: boolean;
  /** Allow dragging when unpinned (default: true). */
  allowDragWhenUnpinned?: boolean;
  /** Enable physical velocity spring tilt (default: true). */
  enableTilt?: boolean;
  /** Maximum spring tilt angle in degrees. */
  maxTiltAngle?: number;
  /** Sensitivity multiplier for drag velocity to tilt angle. */
  tiltSensitivity?: number;
  /** Tilt rotation friction damping factor. */
  tiltFriction?: number;
  /** Tilt rotation decay coefficient. */
  tiltDecay?: number;
  /** Exit transition duration in milliseconds. */
  exitTransitionDuration?: number;
  /** ARIA description string for screen readers. */
  ariaDescribedby?: string;
}
```

---

### `PopoverStore<TData = unknown, TContext = unknown>`

Complete Zustand state shape of the popover system.

```ts
export interface PopoverStore<TData = unknown, TContext = unknown> {
  /** Linear stack of active unpinned popover entries. */
  trail: TrailEntry<TData>[];
  /** Array of pinned floating popover entries. */
  floating: TrailEntry<TData>[];
  /** Dictionary of drag offset vectors keyed by popover key. */
  offsets: Record<string, { x: number; y: number }>;
  /** Custom z-index stack ordering array of keys. */
  zIndexOrder: string[];
  /** External context passed down from PopoverProvider. */
  context?: TContext;
  /** Viewport collision boundary element or selector. */
  collisionBoundary?: Boundary | HTMLElement | Element[];
  /** Set true to close pinned child popovers when parent closes. */
  closePinnedDescendants?: boolean;
  /** Direction for cascade offset shifting ('right' | 'left' | 'down' | 'up'). */
  cascadeDirection?: CascadeOffsetDirection;
  /** Maximum allowed depth for popover chains. */
  maxDepth?: number;
}
```

---

### `PopoverActions<TData = unknown, TContext = unknown>`

Dispatcher action methods for updating popover state.

```ts
export interface PopoverActions<TData = unknown, TContext = unknown> {
  /** Closes target popover and recursively unmounts its child branch via BFS. */
  closeByKey: (key: string) => void;
  /** Toggles target popover between trail stack and floating array. */
  togglePin: (key: string, rect?: DOMRect) => void;
  /** Resets error state and re-executes data resolver for target key. */
  retryPopover: (key: string) => void;
  /** Closes all open popovers across both trail and floating states. */
  closeAll: () => void;
  /** Moves target popover to the top of the z-index stack. */
  bringToFront: (key: string) => void;
  /** Updates drag offset vector coordinates for target key. */
  updateOffset: (key: string, x: number, y: number) => void;
  /** Resets drag offset vector coordinates to zero. */
  resetOffset: (key: string) => void;
  /** Opens a root popover entry programmatically. */
  openRoot: (ownerId: string, entry: TrailEntry<TData>) => void;
  /** Opens a nested child popover entry programmatically. */
  openNested: (index: number, entry: TrailEntry<TData>) => void;
  /** Reverts the last state change. */
  undo: () => void;
  /** Restores the last undone state change. */
  redo: () => void;
  /** True if an undo action is available. */
  canUndo: boolean;
  /** True if a redo action is available. */
  canRedo: boolean;
}
```

---

### `PopoverDisplayOptions`

Display, positioning, and behavior configuration options.

```ts
export interface PopoverDisplayOptions {
  placement?: PopoverPlacement;
  offset?: number;
  hover?: HoverConfig;
  focusLockOptions?: FocusLockOptions;
  keyboardShortcuts?: KeyboardShortcutMap;
  dragAxis?: DragAxis;
  allowDragWhenPinned?: boolean;
  allowDragWhenUnpinned?: boolean;
  enableTilt?: boolean;
  maxTiltAngle?: number;
  tiltSensitivity?: number;
  tiltFriction?: number;
  tiltDecay?: number;
  exitTransitionDuration?: number;
  ariaDescribedby?: string;
}
```

---

### `HoverConfig`

Hover trigger delay settings.

```ts
export interface HoverConfig {
  /** Enable hover trigger interactions. */
  enabled: boolean;
  /** Delay buffer in milliseconds before opening on hover (default: 200). */
  openDelay?: number;
  /** Delay buffer in milliseconds before closing on mouse leave (default: 300). */
  closeDelay?: number;
  /** Set false to keep popover open when mouse leaves trigger (default: true). */
  closeOnMouseLeave?: boolean;
}
```

---

### `FocusLockOptions`

Keyboard focus trapping options.

```ts
export interface FocusLockOptions {
  /** Enable focus trapping inside popover card (default: false). */
  enabled?: boolean;
  /** Restore focus to trigger element on close (default: true). */
  returnFocus?: boolean;
  /** Prevent background body scrolling (default: false). */
  lockScroll?: boolean;
  /** Target element to receive initial focus upon mount. */
  autoFocusElement?: string | (() => HTMLElement);
}
```

---

### `ZIndexBaseMap`

Map defining base z-index layering per stack group zone.

```ts
export type ZIndexBaseMap = Record<string, number>;
```

---

### `PopoverSlotComponents`

Custom UI slot component overrides.

```ts
export interface PopoverSlotComponents {
  PinButton?: React.ComponentType<{ isPinned: boolean; onClick: () => void }>;
  CloseButton?: React.ComponentType<{ onClick: () => void }>;
  LoadingSpinner?: React.ComponentType;
}
```

---

### `PopoverPlacement` & Layout Strategy

Allowed alignment positions relative to trigger element:

```ts
export type PopoverPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'left'
  | 'left-start'
  | 'left-end';
```

---

### `PopoverTransitionStatus`

Lifecycle transition status for animated popovers:

```ts
export type PopoverTransitionStatus = 'mounting' | 'mounted' | 'unmounting';
```

---

### `KeyboardShortcutMap`

Map of key combinations to action handlers:

```ts
export type KeyboardShortcutMap = Record<string, (key: string) => void>;
```

---

### `PopoverEntryDiscriminatedState`

Discriminated union for type-safe state handling:

```ts
export type PopoverEntryDiscriminatedState<TData = unknown> =
  | { state: 'loading'; data?: undefined; error?: undefined }
  | { state: 'resolved'; data: TData; error?: undefined }
  | { state: 'error'; data?: undefined; error: Error };
```

---

## 2. Components & Context

### `<PopoverProvider>`

Main context container. Initializes the Zustand store, data resolver, caching layer, and collision configuration.

#### Props (`PopoverProviderProps<TData, TContext>`)
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `resolveData` | `PopoverResolver<TData, TContext>` | `undefined` | Async resolver function `(key, parentData, context, signal)`. |
| `cache` | `PopoverCache<TData>` | `undefined` | Cache instance (e.g. `SimplePopoverCache`). |
| `context` | `TContext` | `undefined` | External context passed to `resolveData`. |
| `collisionBoundary` | `Boundary \| HTMLElement \| Element[]` | `'clippingAncestors'` | Viewport collision boundary element or selector. |
| `closePinnedDescendants` | `boolean` | `false` | When `true`, closing a parent automatically closes its pinned descendant popovers. |
| `cascadeDirection` | `'right' \| 'left' \| 'down' \| 'up'` | `'right'` | Cascade offset direction for nested popovers. |
| `maxDepth` | `number` | `Infinity` | Maximum depth limit for cascading chains. |
| `initialState` | `Partial<PopoverStore>` | `undefined` | Initial store state for SSR or state hydration. |
| `zIndexBaseMap` | `ZIndexBaseMap` | `undefined` | Custom z-index base map per group zone. |
| `children` | `ReactNode` | Required | Application workspace tree. |

---

### `<PopoverCard>`

Headless, unstyled compound component for popover card containers. Binds positioning coordinates, CSS custom properties (`--popover-x`, `--popover-y`, `--popover-z`), and ARIA attributes (`role="dialog"`, `data-state`, `data-pinned`).

Supports polymorphic rendering via the `as` prop (`as={motion.div}`, `as="section"`, etc.).

#### Props (`PopoverCardProps<E extends ElementType, TData = unknown>`)
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `entry` | `TrailEntry<TData>` | Required | Popover trail entry item. |
| `index` | `number` | Required | Virtual rendering stack index. |
| `isPinned` | `boolean` | Required | True if card is pinned/floating. |
| `as` | `E` | `'div'` | Polymorphic element tag or component. |
| `placement` | `PopoverPlacement` | `'bottom'` | Anchor layout placement preference. |
| `enableDrag` | `boolean` | `true` | Enables pointer dragging when pinned. |
| `enableTilt` | `boolean` | `true` | Enables velocity spring tilt animation. |
| `maxTiltAngle` | `number` | `5` | Maximum spring tilt angle in degrees. |
| `className` | `string` | `undefined` | Optional CSS class name. |
| `children` | `ReactNode` | Required | Card subcomponents and content. |

---

### `<PopoverCard>` Subcomponents

- **`<PopoverCard.Handle>`**: Drag handle header area. Automatically binds pointer capture event handlers.
- **`<PopoverCard.PinButton>`**: Pin toggle button. Toggles target card between trail and floating states.
- **`<PopoverCard.CloseButton>`**: Close button. Closes popover entry by key on click.
- **`<PopoverCard.Content>`**: Card content body container.

---

### `<PopoverTrail>`

High-level portal component that tracks active popover trail entries and handles portal mounting with a `renderCard` prop callback.

```tsx
<PopoverTrail renderCard={(entry, index, isPinned) => (
  <PopoverCard key={entry.key} entry={entry} index={index} isPinned={isPinned} />
)} />
```

---

### `<PopoverPortal>`

Render-prop component for mounting active popover entries into DOM portals.

---

### `<PopoverTrigger>`

Declarative wrapper attaching click events, hover listeners, and ARIA attributes to a trigger element.

---

### `PopoverCardContext` & `usePopoverCardContext`

React Context and hook exposing `{ entry, index, isPinned, card, actions }` scope state to internal card subcomponents.

```tsx
import { usePopoverCardContext } from 'popover-trail';

function CustomCardHeader() {
  const { entry, index, isPinned, actions } = usePopoverCardContext();
  return (
    <div>
      <span>Card: {entry.key}</span>
      <button onClick={() => actions.togglePin(entry.key)}>{isPinned ? 'Unpin' : 'Pin'}</button>
    </div>
  );
}
```

---

## 3. Core Hooks

### `usePopoverCard(options)`

Primary hook combining Floating UI positioning, pointer drag handling, velocity spring tilt, and pin state toggles.

```ts
function usePopoverCard<TData = unknown>(
  options: UsePopoverCardOptions<TData>
): UsePopoverCardResult
```

---

### `usePopover(key, options?)`

High-level hook for managing a specific popover card by key.

```ts
function usePopover<TData = unknown, TContext = unknown>(
  key: string,
  options?: PopoverDisplayOptions
): UsePopoverResult<TData>
```

---

### `usePopoverTrigger(key, options?)`

Returns event handlers and ARIA attributes for root triggers.

```ts
function usePopoverTrigger(
  popoverKey: string,
  options?: PopoverDisplayOptions & { hover?: HoverConfig }
): PopoverTriggerPropsResult
```

---

### `usePopoverNestedTrigger(key, parentKey, options?)`

Returns event handlers for nested child triggers.

```ts
function usePopoverNestedTrigger(
  popoverKey: string,
  parentKey: string,
  options?: PopoverDisplayOptions
): PopoverTriggerPropsResult
```

---

### `usePopoverActions()`

Returns memoized store action dispatcher methods:

```ts
function usePopoverActions<TData = unknown, TContext = unknown>(): PopoverActions<TData, TContext>
```

---

### `usePopoverGeometry(options)`

Calculates layout positioning and viewport collision bounds:

```ts
function usePopoverGeometry(options: UsePopoverGeometryOptions): UsePopoverGeometryResult
```

---

### `usePopoverDragAndDrop(options)`

Handles pointer drag tracking and spring tilt physics:

```ts
function usePopoverDragAndDrop(options: UsePopoverDragAndDropOptions): UsePopoverDragAndDropResult
```

---

## 4. State & Helper Hooks

- `usePopoverStore(selector)`: Subscribes to custom Zustand store slices.
- `usePopoverStoreApi()`: Returns raw `StoreApi<PopoverStore>` reference.
- `usePopoverTrail()`: Subscribes to unpinned `TrailEntry[]` array.
- `usePopoverFloating()`: Subscribes to pinned `TrailEntry[]` array.
- `usePopoverOffsets()`: Subscribes to dictionary of drag offset vectors.
- `usePopoverEntry(key)`: Subscribes to single `TrailEntry | undefined` by key.
- `useIsPopoverPinned(key)`: Returns `true` if target card is pinned.
- `useIsPopoverOpen(key)`: Returns `true` if target card is open.
- `usePopoverZIndex(index, isPinned, baseZIndex = 1000)`: Computes z-index depth value.
- `useIsPopoverTopMost(key)`: Returns `true` if card sits on top of visual stack.
- `usePopoverOffset(key)`: Returns drag offset vector `{ x, y }` for target key.
- `usePopoverContext()`: Accesses external context passed to `PopoverProvider`.
- `usePopoverHydration(key)`: Subscribes to data hydration status `{ isLoading, error, data, retry }`.
- `useEventListener(target, eventName, handler, options?)`: Attaches DOM event listener with auto-cleanup.

---

## 5. DND Sub-package (`popover-trail/dnd`)

### `<PopoverCanvas>`

Canvas container managing `@dnd-kit/core` drag context, viewport collision bounds, and z-index ordering for floating cards.

```tsx
import { PopoverCanvas, PopoverCard } from 'popover-trail/dnd';

export function CanvasApp() {
  return (
    <PopoverCanvas restrictToWindow={true}>
      {({ entry, index, isPinned }) => (
        <PopoverCard key={entry.key} entry={entry} index={index} isPinned={isPinned}>
          <h3>{entry.key}</h3>
        </PopoverCard>
      )}
    </PopoverCanvas>
  );
}
```

#### Props (`PopoverCanvasProps<TData>`)
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `children` | `(props: { entry: TrailEntry<TData>; index: number; isPinned: boolean }) => ReactNode` | Required | Render prop for each active card. |
| `modifiers` | `Modifier[]` | `undefined` | Custom `@dnd-kit/core` drag modifiers. |
| `restrictToWindow` | `boolean` | `false` | Lock drag coordinates to window viewport bounds. |
| `restrictToContainer` | `boolean` | `false` | Lock drag coordinates to container element bounds. |

---

### `usePopoverDraggableCard(options)`

Composite hook integrating `@dnd-kit/core` drag handles, pointer event listeners, and physical spring tilt.

```ts
function usePopoverDraggableCard(
  options: UsePopoverDraggableCardOptions
): UsePopoverDraggableCardResult
```

---

### `PopoverCard` (DND version)

High-level pre-bound PopoverCard component that handles hooks, refs, styles, dragging physics, focus locks, and event bindings automatically.

```tsx
import { PopoverCard } from 'popover-trail/dnd';

<PopoverCard entry={entry} index={index} isPinned={isPinned} enableFocusLock={true}>
  <h3>Card Content</h3>
</PopoverCard>
```

---

## 6. Factories & Store Initialization

### `createPopoverTrail<TData, TContext, TPopoverKey>()`

Creates pre-typed, schema-bound components and hooks.

```tsx
import { createPopoverTrail } from 'popover-trail';

export interface DocNode { id: string; title: string; }
export type DocKeys = 'doc-1' | 'doc-2';

export const DocScope = createPopoverTrail<DocNode, { theme: string }, DocKeys>();
```

---

### `createPopoverStore(initialState?)`

Creates low-level Zustand store instance for independent state trees.

```ts
import { createPopoverStore } from 'popover-trail';

const customStore = createPopoverStore({
  maxDepth: 5,
  closePinnedDescendants: true,
});
```

---

## 7. Type Guards & Event Predicates

- `isResolvedEntry(entry)`: Narrows `TrailEntry` to resolved state with `data`.
- `isLoadingEntry(entry)`: Narrows `TrailEntry` to loading state.
- `isErrorEntry(entry)`: Narrows `TrailEntry` to error state with `error`.
- `getEntryState(entry)`: Returns `'loading' | 'resolved' | 'error'`.
- `createPopoverKey(key)`: Brands string as typed `PopoverKey`.
- `createPopoverResolver(fn)`: Type-wraps resolver function.
- `createVirtualElement(rect)`: Converts `DOMRect` to Floating UI `VirtualElement`.
- `isOpenRootEvent(event)`: Type guard for open root event objects.
- `isPushNestedEvent(event)`: Type guard for push nested event objects.
- `isCloseEvent(event)`: Type guard for close event objects.
- `isPinEvent(event)`: Type guard for pin toggle event objects.
- `isResolveErrorEvent(event)`: Type guard for resolution error event objects.

---

## 8. Utilities, Caching, & Controller

### `SimplePopoverCache<TData>`

In-memory cache supporting TTL expiration, capacity eviction, and hit/miss statistics.

```ts
class SimplePopoverCache<TData = unknown> implements PopoverCache<TData> {
  constructor(ttlMs?: number, maxSize?: number);
  get(key: string): TData | undefined;
  set(key: string, data: TData): void;
  has(key: string): boolean;
  delete(key: string): void;
  clear(): void;
  stats(): { hits: number; misses: number; hitRatio: number; size: number };
}
```

---

### `createWorkerResolver(workerOrFn, options?)`

Offloads data resolution to a background Web Worker.

```ts
function createWorkerResolver<TData = unknown, TContext = unknown>(
  workerOrFn: Worker | string | ((key: string, parentData?: unknown, context?: TContext) => TData | Promise<TData>),
  options?: WorkerResolverOptions
): PopoverResolver<TData, TContext>
```

#### Options (`WorkerResolverOptions`)
| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `timeoutMs` | `number` | `30000` | Task execution timeout in milliseconds. |
| `autoRestart` | `boolean` | `true` | Automatically restart worker on unhandled error. |
| `onWorkerError` | `(err: Error) => void` | `undefined` | Error callback handler. |

---

### `createPopoverController(store)`

Imperative controller for managing popovers outside React component trees.

```ts
function createPopoverController<TData = unknown, TContext = unknown>(
  store: StoreApi<PopoverStore<TData, TContext>>
): PopoverController<TData, TContext>
```

---

### `clampDragCoordinates(coords, bounds)`

Clamps `{ x, y }` coordinates within specified boundary box.

---

### `computeTiltMatrix(velocityX, maxTiltAngle, sensitivity)`

Calculates CSS `matrix3d` transform string for velocity spring tilt.

---

### `applyDragFriction(delta, damping)`

Calculates drag offset delta scaled by damping friction coefficient.

---

### `getPopoverStyles(options)`

Generates inline CSS style object combining placement, transform, and z-index properties.

---

### `invariant(condition, message)`

Asserts runtime condition and throws Error with message when condition evaluates to `false`.

```ts
invariant(Boolean(key), 'Key is required');
```

---

## License

[MIT](LICENSE)

# Popover Trail: API Reference

Complete API reference for all components, hooks, type guards, factories, and utilities exported by `popover-trail`.

> Looking for feature guides and usage tutorials? Check out [Feature Guides & Manual](GUIDES.md).

---

## Table of Contents

1. [Components and Context](#1-components-and-context)
   - [PopoverProvider](#popoverprovider)
   - [PopoverCard](#popovercard)
   - [PopoverTrail](#popovertrail)
   - [PopoverPortal](#popoverportal)
   - [PopoverTrigger](#popovertrigger)
   - [PopoverCardContext](#popovercardcontext)
2. [Core Hooks](#2-core-hooks)
   - [usePopoverCard](#usepopovercard)
   - [usePopover](#usepopover)
   - [usePopoverTrigger](#usepopovertrigger)
   - [usePopoverNestedTrigger](#usepopovernestedtrigger)
   - [usePopoverActions](#usepopoveractions)
   - [usePopoverGeometry](#usepopovergeometry)
   - [usePopoverDragAndDrop](#usepopoverdraganddrop)
3. [State and Helper Hooks](#3-state-and-helper-hooks)
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
4. [Factories](#4-factories)
   - [createPopoverTrail](#createpopovertrail)
   - [createPopoverStore](#createpopoverstore)
5. [Type Guards and Predicates](#5-type-guards-and-predicates)
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
6. [Utilities, Caching, and Controller](#6-utilities-caching-and-controller)
   - [SimplePopoverCache](#simplepopovercache)
   - [createWorkerResolver](#createworkerresolver)
   - [createPopoverController](#createpopovercontroller)
   - [clampDragCoordinates](#clampdragcoordinates)
   - [computeTiltMatrix](#computetiltmatrix)
   - [applyDragFriction](#applydragfriction)
   - [getPopoverStyles](#getpopoverstyles)
   - [invariant](#invariant)

---

## 1. Components and Context

### `<PopoverProvider>`

Main context container. Initializes the Zustand store, data resolver, caching layer, and collision configuration.

#### Signature
```tsx
function PopoverProvider<TData = unknown, TContext = unknown>(
  props: PopoverProviderProps<TData, TContext>
): React.JSX.Element
```

#### Props (`PopoverProviderProps`)
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `resolveData` | `PopoverResolver<TData, TContext>` | `undefined` | Data fetching resolver function. Receives `(key, parentData, context, signal)`. |
| `cache` | `PopoverCache<TData>` | `undefined` | Cache instance (e.g. `SimplePopoverCache`). |
| `context` | `TContext` | `undefined` | External application context available inside `resolveData`. |
| `collisionBoundary` | `Boundary \| HTMLElement \| ...` | `'clippingAncestors'` | DOM element or selector defining viewport collision boundaries. |
| `closePinnedDescendants` | `boolean` | `false` | When `true`, closing a parent automatically closes its pinned descendant popovers. |
| `cascadeDirection` | `'right' \| 'left' \| 'down' \| 'up'` | `'right'` | Cascade offset shift direction for nested popovers. |
| `maxDepth` | `number` | `Infinity` | Maximum depth for cascading popover chains. |
| `initialState` | `Partial<PopoverStore>` | `undefined` | Initial store state for SSR or hydration. |
| `slotComponents` | `PopoverSlotComponents` | `undefined` | Custom UI slot overrides for pin buttons, close buttons, and loading spinners. |

#### Usage Example
```tsx
import { PopoverProvider, SimplePopoverCache } from 'popover-trail';

const cache = new SimplePopoverCache(60000, 20);

export function App() {
  return (
    <PopoverProvider
      resolveData={async (key, parentData, context, signal) => {
        const res = await fetch(`/api/nodes/${key}`, { signal });
        return res.json();
      }}
      cache={cache}
      closePinnedDescendants={true}
    >
      <MainLayout />
    </PopoverProvider>
  );
}
```

---

### `<PopoverCard>`

Headless, unstyled compound component for popover card containers. Binds positioning coordinates, CSS variables (`--popover-x`, `--popover-y`, `--popover-z`), and accessibility attributes (`role="dialog"`, `data-state`, `data-pinned`).

Supports polymorphic rendering via the `as` prop (`as={motion.div}`, `as="section"`, etc.).

#### Sub-Components:
- `PopoverCard.Handle`: Drag handle area for pointer interaction.
- `PopoverCard.PinButton`: Toggles pinned status for floating windows.
- `PopoverCard.CloseButton`: Closes popover card by key.
- `PopoverCard.Content`: Card body content wrapper.

#### Props (`PopoverCardProps`)
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `entry` | `TrailEntry<TData>` | Required | Popover trail entry item. |
| `index` | `number` | Required | Virtual rendering stack index. |
| `isPinned` | `boolean` | Required | True if card is floating/pinned. |
| `as` | `ElementType` | `'div'` | Polymorphic element tag or component. |
| `placement` | `PopoverPlacement` | `'bottom'` | Layout placement preference. |

#### Usage Example
```tsx
import { PopoverCard } from 'popover-trail';

export function Card({ entry, index, isPinned }) {
  return (
    <PopoverCard entry={entry} index={index} isPinned={isPinned} className="card">
      <PopoverCard.Handle className="card-header">
        <span>{entry.key}</span>
        <PopoverCard.PinButton />
        <PopoverCard.CloseButton />
      </PopoverCard.Handle>
      <PopoverCard.Content className="card-body">
        <p>Card Content</p>
      </PopoverCard.Content>
    </PopoverCard>
  );
}
```

---

### `<PopoverTrail>`

High-level portal component that tracks active popover trail entries and handles portal mounting with a `renderCard` prop callback.

#### Props (`PopoverTrailProps`)
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `renderCard` | `(entry: TrailEntry, index: number, isPinned: boolean) => ReactNode` | Required | Render function called for each active popover card. |
| `filter` | `(entry: TrailEntry, index: number) => boolean` | `undefined` | Filter predicate to select which entries to render. |
| `container` | `HTMLElement \| null` | `document.body` | DOM container element for portal. |

#### Usage Example
```tsx
<PopoverTrail renderCard={(entry, index, isPinned) => (
  <Card key={entry.key} entry={entry} index={index} isPinned={isPinned} />
)} />
```

---

### `<PopoverPortal>`

Render-prop component for mounting active popovers into DOM portals.

#### Signature
```tsx
function PopoverPortal<TData = unknown, TContext = unknown>(
  props: PopoverPortalProps<TData, TContext>
): React.ReactPortal | null
```

#### Props (`PopoverPortalProps`)
| Prop | Type | Description |
| :--- | :--- | :--- |
| `children` | `(entries: TrailEntry<TData>[], actions: PopoverActions<TData, TContext>) => ReactNode` | Render function receiving all active entries (`trail` + `floating`). |
| `container` | `HTMLElement \| null` | Target DOM container element for portal mounting. Defaults to `document.body`. |

#### Usage Example
```tsx
<PopoverPortal>
  {(entries) =>
    entries.map((entry, index) => (
      <PopoverCard key={entry.key} entry={entry} index={index} isPinned={entry.isPinned} />
    ))
  }
</PopoverPortal>
```

---

### `<PopoverTrigger>`

Declarative wrapper that attaches click events, hover listeners, and ARIA attributes to a child element.

#### Signature
```tsx
function PopoverTrigger<TPopoverKey extends string = string>(
  props: PopoverTriggerProps<TPopoverKey>
): React.ReactElement
```

#### Props (`PopoverTriggerProps`)
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `popoverKey` | `TPopoverKey` | *required* | Target popover identifier. |
| `parentKey` | `string` | `undefined` | Parent popover key if trigger is nested inside an existing card. |
| `placement` | `PopoverPlacement` | `'bottom'` | Preferred placement relative to trigger. |
| `hover` | `HoverConfig` | `undefined` | Hover trigger settings (`openDelay`, `closeDelay`). |
| `disabled` | `boolean` | `false` | Disables trigger interactions. |
| `asChild` | `boolean` | `false` | Clones event handlers directly onto the single child element. |

#### Usage Example
```tsx
<PopoverTrigger popoverKey="user-profile-12" placement="right-start">
  <button className="avatar-btn">View Profile</button>
</PopoverTrigger>
```

---

### `PopoverCardContext`

React Context exposing `{ entry, index, isPinned }` state to card subcomponents.

```tsx
import { PopoverCardContext } from 'popover-trail';

function CustomCardHeader() {
  const { entry, index, isPinned } = React.useContext(PopoverCardContext);
  return <div>Card: {entry.key} (Depth: {index})</div>;
}
```

---

## 2. Core Hooks

### `usePopoverCard(options)`

Primary hook for constructing popover card elements. Combines Floating UI layout calculations, pointer drag-and-drop mechanics, velocity spring tilt animation, and pin state toggles.

#### Signature
```ts
function usePopoverCard<TData = unknown>(
  options: UsePopoverCardOptions<TData>
): UsePopoverCardResult
```

#### Options (`UsePopoverCardOptions`)
| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `entry` | `TrailEntry<TData>` | *required* | Popover state entry. |
| `index` | `number` | *required* | Stacking depth index. |
| `isPinned` | `boolean` | *required* | Whether the card is pinned/floating. |
| `placement` | `PopoverPlacement` | `'bottom'` | Anchor layout alignment placement. |
| `enableDrag` | `boolean` | `true` | Enables drag interactions when pinned. |
| `enableTilt` | `boolean` | `true` | Enables velocity spring tilt during drag. |
| `maxTiltAngle` | `number` | `5` | Maximum tilt angle limit in degrees. |

#### Return Object (`UsePopoverCardResult`)
* `ref`: `(node: HTMLElement | null) => void` - Callback ref for binding to floating card element.
* `style`: `React.CSSProperties` - Calculated CSS inline styles (`position`, `left`, `top`, `transform`, `zIndex`).
* `dragHandleProps`: `{ onPointerDown: (e: React.PointerEvent) => void }` - Pointer handlers for drag handle element.
* `handlePinToggle`: `() => void` - Toggles popover between linear trail and floating array.
* `isDragging`: `boolean` - Active drag state flag.

#### Usage Example
```tsx
export function MyCard({ entry, index, isPinned }: { entry: TrailEntry; index: number; isPinned: boolean }) {
  const { ref, style, dragHandleProps, handlePinToggle } = usePopoverCard({
    entry,
    index,
    isPinned,
  });

  return (
    <div ref={ref} style={style} className="popover-card">
      <header {...dragHandleProps}>
        <span>Key: {entry.key}</span>
        <button onClick={handlePinToggle}>{isPinned ? 'Unpin' : 'Pin'}</button>
      </header>
    </div>
  );
}
```

---

### `usePopover(key, options?)`

High-level hook for managing a specific popover card by key.

#### Signature
```ts
function usePopover<TData = unknown, TContext = unknown>(
  key: string,
  options?: PopoverDisplayOptions
): UsePopoverResult<TData>
```

#### Return Object (`UsePopoverResult`)
* `entry`: `TrailEntry<TData> | undefined` - Popover entry state node.
* `isOpen`: `boolean` - Whether popover is currently open.
* `isPinned`: `boolean` - Whether popover is pinned/floating.
* `triggerProps`: `PopoverTriggerPropsResult` - Event props for trigger button.
* `togglePin`: `() => void` - Toggles pinning state.
* `close`: `() => void` - Closes popover.
* `retry`: `() => void` - Retries failed data fetch.

---

### `usePopoverTrigger(popoverKey, options?)`

Returns event handlers and ARIA attributes for opening root popovers.

#### Signature
```ts
function usePopoverTrigger(
  popoverKey: string,
  options?: PopoverDisplayOptions & { hover?: HoverConfig }
): PopoverTriggerPropsResult
```

#### Return Object (`PopoverTriggerPropsResult`)
```ts
interface PopoverTriggerPropsResult {
  onClick: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
  'aria-expanded': boolean;
  'aria-haspopup': 'dialog';
  'aria-describedby'?: string;
}
```

---

### `usePopoverNestedTrigger(popoverKey, parentKey, options?)`

Returns event handlers for opening child popovers from inside an active card.

#### Signature
```ts
function usePopoverNestedTrigger(
  popoverKey: string,
  parentKey: string,
  options?: PopoverDisplayOptions
): PopoverTriggerPropsResult
```

---

### `usePopoverActions()`

Returns memoized store action dispatcher methods.

#### Signature
```ts
function usePopoverActions<TData = unknown, TContext = unknown>(): PopoverActions<TData, TContext>
```

#### Actions (`PopoverActions`)
* `closeByKey(key: string)`: Closes target popover and its child descendants.
* `togglePin(key: string)`: Toggles popover between `trail` stack and `floating` array.
* `retryPopover(key: string)`: Resets error status and re-executes `resolveData`.
* `closeAll()`: Closes all open popovers across trail and floating states.
* `openRootWithResolver(key, anchor, options?)`: Opens root popover programmatically.
* `openNestedWithResolver(key, parentKey, anchor, options?)`: Opens nested popover programmatically.

---

### `usePopoverGeometry(options)`

Calculates Floating UI positioning, checks screen collision boundaries, and calculates cascade offsets.

#### Signature
```ts
function usePopoverGeometry(options: UsePopoverGeometryOptions): UsePopoverGeometryResult
```

#### Return Object (`UsePopoverGeometryResult`)
* `x`: `number` - Rounded X screen coordinate.
* `y`: `number` - Rounded Y screen coordinate.
* `strategy`: `'absolute' | 'fixed'` - Positioning layout strategy.
* `refs`: `{ setReference: (node: HTMLElement | null) => void; setFloating: (node: HTMLElement | null) => void }`

---

### `usePopoverDragAndDrop(options)`

Handles mouse and touch pointer dragging, velocity calculations, and RAF spring tilt decay.

#### Signature
```ts
function usePopoverDragAndDrop(options: UsePopoverDragAndDropOptions): UsePopoverDragAndDropResult
```

#### Return Object (`UsePopoverDragAndDropResult`)
* `dragHandleProps`: Pointer event props for binding to drag handle element.
* `isDragging`: Active drag state flag.
* `tiltTransform`: Formatted CSS `matrix3d` transform string.

---

## 3. State and Helper Hooks

### `usePopoverStore(selector)`
Subscribes to a slice of Zustand store state.
```ts
const trailLength = usePopoverStore((state) => state.trail.length);
```

### `usePopoverStoreApi()`
Returns raw `StoreApi<PopoverStore>` instance for imperative access outside React rendering loops.
```ts
const store = usePopoverStoreApi();
const currentState = store.getState();
```

### `usePopoverTrail()`
Subscribes to array of active unpinned `TrailEntry[]` nodes in linear path.

### `usePopoverFloating()`
Subscribes to array of pinned `TrailEntry[]` floating cards.

### `usePopoverOffsets()`
Subscribes to dictionary `Record<string, { x: number; y: number }>` storing drag offsets.

### `usePopoverEntry(key)`
Subscribes to single `TrailEntry | undefined` by key.

### `useIsPopoverPinned(key)`
Returns `true` if popover is in pinned/floating state.

### `useIsPopoverOpen(key)`
Returns `true` if popover is open in `trail` or `floating`.

### `usePopoverZIndex(index, isPinned, baseZIndex = 1000)`
Calculates z-index depth value based on stacking depth index and pinning status.

### `useIsPopoverTopMost(key)`
Returns `true` if popover sits at the top of the stack.

### `usePopoverOffset(key)`
Returns `{ x: number; y: number }` drag offset vector for target popover.

### `usePopoverContext()`
Accesses external application context passed to `PopoverProvider`.

### `usePopoverHydration(key)`
Subscribes to data hydration status for target popover.
```ts
const { isLoading, error, data, retry } = usePopoverHydration<MyData>('card-101');
```

### `useEventListener(target, eventName, handler, options?)`
Utility hook for attaching DOM event listeners with automatic cleanup on unmount.

---

## 4. Factories

### `createPopoverTrail<TData, TContext, TPopoverKey>()`

Creates pre-typed set of components and hooks bound to specific TypeScript schemas.

#### Signature
```ts
function createPopoverTrail<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string
>(): {
  PopoverProvider: React.ComponentType<PopoverProviderProps<TData, TContext>>;
  PopoverPortal: React.ComponentType<PopoverPortalProps<TData, TContext>>;
  PopoverTrigger: React.ComponentType<PopoverTriggerProps<TPopoverKey>>;
  usePopover: (key: TPopoverKey) => UsePopoverResult<TData>;
  usePopoverActions: () => PopoverActions<TData, TContext>;
  usePopoverContext: () => TContext;
}
```

#### Usage Example
```tsx
import { createPopoverTrail } from 'popover-trail';

export interface UserNode {
  id: string;
  name: string;
}

export type ValidKeys = 'user-main' | 'user-details' | 'user-settings';

export const MyTrail = createPopoverTrail<UserNode, { theme: string }, ValidKeys>();

export function ScopedApp() {
  return (
    <MyTrail.PopoverProvider resolveData={async (key) => ({ id: key, name: 'Anna' })}>
      <MyTrail.PopoverTrigger popoverKey="user-main">
        <button>Open Profile</button>
      </MyTrail.PopoverTrigger>
    </MyTrail.PopoverProvider>
  );
}
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

## 5. Type Guards and Predicates

### `isResolvedEntry(entry)`
Narrows `TrailEntry` to resolved state with valid `data`.
```ts
if (isResolvedEntry(entry)) {
  console.log(entry.data.name); // data is typed
}
```

### `isLoadingEntry(entry)`
Narrows `TrailEntry` to loading state.
```ts
if (isLoadingEntry(entry)) {
  return <Spinner />;
}
```

### `isErrorEntry(entry)`
Narrows `TrailEntry` to error state with `error` payload.
```ts
if (isErrorEntry(entry)) {
  console.error(entry.error.message);
}
```

### `getEntryState(entry)`
Returns current state string: `'loading' | 'resolved' | 'error'`.

### `createPopoverKey(key)`
Validates and brands string as a typed `PopoverKey`.

### `createPopoverResolver(fn)`
Wraps data resolver function with type checks.

### `createVirtualElement(rect)`
Converts `DOMRect` into Floating UI `VirtualElement`.

### `isOpenRootEvent(event)`
Type guard for open root event objects.

### `isPushNestedEvent(event)`
Type guard for push nested event objects.

### `isCloseEvent(event)`
Type guard for close event objects.

### `isPinEvent(event)`
Type guard for pin toggle event objects.

### `isResolveErrorEvent(event)`
Type guard for resolution error event objects.

---

## 6. Utilities, Caching, and Controller

### `SimplePopoverCache<TData>`

In-memory cache class supporting TTL expiration and capacity eviction.

#### Signature
```ts
class SimplePopoverCache<TData = unknown> implements PopoverCache<TData> {
  constructor(ttlMs?: number, maxSize?: number);
  get(key: string): TData | undefined;
  set(key: string, data: TData): void;
  has(key: string): boolean;
  delete(key: string): void;
  clear(): void;
}
```

#### Usage Example
```ts
const cache = new SimplePopoverCache<UserData>(300000, 100); // 5-min TTL, 100 max capacity
```

---

### `createWorkerResolver(workerOrFn, options?)`

Offloads data resolution to a background Web Worker.

#### Signature
```ts
function createWorkerResolver<TData = unknown, TContext = unknown>(
  workerOrFn: Worker | string | ((key: string, parentData?: unknown, context?: TContext) => TData | Promise<TData>),
  options?: WorkerResolverOptions
): PopoverResolver<TData, TContext>
```

#### Options (`WorkerResolverOptions`)
* `timeoutMs`: Task execution timeout in milliseconds (default: `30000`).

#### Usage Example
```ts
const workerResolver = createWorkerResolver(
  (key) => {
    // Runs inside background Web Worker thread
    return { id: key, computed: Math.random() };
  },
  { timeoutMs: 10000 }
);
```

---

### `createPopoverController(store)`

Imperative controller for managing popovers outside React component trees (WebSockets, Redux, DOM handlers).

#### Signature
```ts
function createPopoverController<TData = unknown, TContext = unknown>(
  store: StoreApi<PopoverStore<TData, TContext>>
): PopoverController<TData, TContext>
```

#### Methods (`PopoverController`)
* `openRoot(ownerId, entry)`
* `openNested(index, entry)`
* `closeByKey(key)`
* `togglePin(key)`
* `clear()`
* `getState()`

---

### `clampDragCoordinates(coords, bounds)`

Clamps `{ x, y }` coordinates within specified boundary box.

```ts
const safeCoords = clampDragCoordinates({ x: 500, y: -20 }, { minX: 0, maxX: 1000, minY: 0, maxY: 800 });
```

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

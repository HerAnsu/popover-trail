# Popover Trail: API Reference

Complete API reference for all components, compound subcomponents, hooks, type guards, factories, and utilities exported by `popover-trail` and `popover-trail/dnd`.

> Looking for feature guides and usage tutorials? Check out [Feature Guides & Manuals](GUIDES.md).

---

## Table of Contents

1. [Components & Context](#1-components--context)
   - [PopoverProvider](#popoverprovider)
   - [PopoverCard](#popovercard)
   - [PopoverCard Subcomponents](#popovercard-subcomponents)
   - [PopoverTrail](#popovertrail)
   - [PopoverPortal](#popoverportal)
   - [PopoverTrigger](#popovertrigger)
   - [PopoverCardContext & usePopoverCardContext](#popovercardcontext--usepopovercardcontext)
2. [Core Hooks](#2-core-hooks)
   - [usePopoverCard](#usepopovercard)
   - [usePopover](#usepopover)
   - [usePopoverTrigger](#usepopovertrigger)
   - [usePopoverNestedTrigger](#usepopovernestedtrigger)
   - [usePopoverActions](#usepopoveractions)
   - [usePopoverGeometry](#usepopovergeometry)
   - [usePopoverDragAndDrop](#usepopoverdraganddrop)
3. [State & Helper Hooks](#3-state--helper-hooks)
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
5. [Type Guards & Predicates](#5-type-guards--predicates)
   - [isResolvedEntry](#isresolvedentry)
   - [isLoadingEntry](#isloadingentry)
   - [isErrorEntry](#iserrorentry)
   - [getEntryState](#getentrystate)
   - [createPopoverKey](#createpopoverkey)
   - [createPopoverResolver](#createpopoverresolver)
   - [createVirtualElement](#createvirtualelement)
6. [Utilities, Caching, & Controller](#6-utilities-caching--controller)
   - [SimplePopoverCache](#simplepopovercache)
   - [createWorkerResolver](#createworkerresolver)
   - [createPopoverController](#createpopovercontroller)
   - [clampDragCoordinates](#clampdragcoordinates)
   - [computeTiltMatrix](#computetiltmatrix)
   - [applyDragFriction](#applydragfriction)
   - [getPopoverStyles](#getpopoverstyles)
   - [invariant](#invariant)

---

## 1. Components & Context

### `<PopoverProvider>`

Main context container. Initializes the Zustand store, data resolver, caching layer, and collision configuration.

#### Signature
```tsx
function PopoverProvider<TData = unknown, TContext = unknown>(
  props: PopoverProviderProps<TData, TContext>
): React.JSX.Element
```

#### Props (`PopoverProviderProps<TData, TContext>`)
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `resolveData` | `PopoverResolver<TData, TContext>` | `undefined` | Async resolver function `(key, parentData, context, signal)`. |
| `cache` | `PopoverCache<TData>` | `undefined` | Cache instance (e.g. `SimplePopoverCache`). |
| `context` | `TContext` | `undefined` | External application context passed to `resolveData`. |
| `collisionBoundary` | `Boundary \| HTMLElement \| Element[]` | `'clippingAncestors'` | Viewport collision boundary element or selector. |
| `closePinnedDescendants` | `boolean` | `false` | When `true`, closing a parent automatically closes its pinned descendant popovers. |
| `cascadeDirection` | `'right' \| 'left' \| 'down' \| 'up'` | `'right'` | Cascade offset direction for nested popovers. |
| `maxDepth` | `number` | `Infinity` | Maximum depth limit for cascading chains. |
| `initialState` | `Partial<PopoverStore>` | `undefined` | Initial store state for SSR or state hydration. |
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

#### `<PopoverCard.Handle>`
Drag handle header area. Automatically binds pointer capture event handlers.

```tsx
<PopoverCard.Handle as="header" className="card-header">
  <span>{entry.key}</span>
</PopoverCard.Handle>
```

#### `<PopoverCard.PinButton>`
Pin toggle button. Toggles the target card between trail and floating states on click.

```tsx
<PopoverCard.PinButton className="btn-pin" />
```

#### `<PopoverCard.CloseButton>`
Close button. Closes the popover entry by key on click.

```tsx
<PopoverCard.CloseButton className="btn-close" />
```

#### `<PopoverCard.Content>`
Card content body container.

```tsx
<PopoverCard.Content className="card-body">
  {isResolvedEntry(entry) && <p>{entry.data.title}</p>}
</PopoverCard.Content>
```

---

### `<PopoverTrail>`

High-level portal component that tracks active popover trail entries and handles portal mounting with a `renderCard` prop callback.

#### Props (`PopoverTrailProps<TData = unknown>`)
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `renderCard` | `(entry: TrailEntry<TData>, index: number, isPinned: boolean) => ReactNode` | Required | Render function called for each active popover card. |
| `filter` | `(entry: TrailEntry<TData>, index: number) => boolean` | `undefined` | Filter predicate to select which entries to render. |
| `container` | `HTMLElement \| null` | `document.body` | DOM container element for portal mounting. |

---

### `<PopoverPortal>`

Render-prop component for mounting active popover entries into DOM portals.

#### Props (`PopoverPortalProps<TData = unknown, TContext = unknown>`)
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `children` | `(entries: TrailEntry<TData>[], actions: PopoverActions<TData, TContext>) => ReactNode` | Required | Render function receiving active entries (`trail` + `floating`). |
| `container` | `HTMLElement \| null` | `document.body` | Target DOM container element for portal mounting. |

---

### `<PopoverTrigger>`

Declarative wrapper attaching click events, hover listeners, and ARIA attributes to a trigger element.

#### Props (`PopoverTriggerProps<TPopoverKey extends string = string>`)
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `popoverKey` | `TPopoverKey` | Required | Target popover key identifier. |
| `parentKey` | `string` | `undefined` | Parent key if trigger is nested inside an existing popover. |
| `placement` | `PopoverPlacement` | `'bottom'` | Preferred placement relative to trigger. |
| `options` | `PopoverDisplayOptions` | `undefined` | Display and hover configuration (`hover`, `keyboardShortcuts`). |
| `disabled` | `boolean` | `false` | Disables trigger interactions. |
| `children` | `ReactNode` | Required | Trigger element. |

---

### `PopoverCardContext` & `usePopoverCardContext`

React Context and hook exposing `{ entry, index, isPinned, card, actions }` scope state to internal card subcomponents.

```tsx
import { usePopoverCardContext } from 'popover-trail';

function CustomPinBadge() {
  const { isPinned, entry } = usePopoverCardContext();
  return <span>{isPinned ? 'Pinned Window' : 'Anchored Card'}</span>;
}
```

---

## 2. Core Hooks

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

### `usePopoverActions()`

Returns memoized store action dispatcher methods:

```ts
interface PopoverActions<TData = unknown, TContext = unknown> {
  closeByKey: (key: string) => void;
  togglePin: (key: string) => void;
  retryPopover: (key: string) => void;
  closeAll: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}
```

---

## 3. State & Helper Hooks

- `usePopoverStore(selector)`: Subscribes to custom Zustand store slices.
- `usePopoverStoreApi()`: Returns raw `StoreApi<PopoverStore>` reference.
- `usePopoverTrail()`: Subscribes to unpinned `TrailEntry[]` array.
- `usePopoverFloating()`: Subscribes to pinned `TrailEntry[]` array.
- `usePopoverEntry(key)`: Subscribes to single `TrailEntry | undefined` by key.
- `useIsPopoverPinned(key)`: Returns `true` if target card is pinned.
- `useIsPopoverOpen(key)`: Returns `true` if target card is open.
- `usePopoverZIndex(index, isPinned, baseZIndex = 1000)`: Computes z-index depth value.
- `useIsPopoverTopMost(key)`: Returns `true` if card sits on top of visual stack.

---

## 4. Factories

### `createPopoverTrail<TData, TContext, TPopoverKey>()`

Creates pre-typed, schema-bound components and hooks:

```tsx
import { createPopoverTrail } from 'popover-trail';

export interface DocNode { id: string; title: string; }
export type DocKeys = 'doc-1' | 'doc-2';

export const DocScope = createPopoverTrail<DocNode, { theme: string }, DocKeys>();
```

---

## 5. Type Guards & Predicates

- `isResolvedEntry(entry)`: Narrows `TrailEntry` to resolved state with `data`.
- `isLoadingEntry(entry)`: Narrows `TrailEntry` to loading state.
- `isErrorEntry(entry)`: Narrows `TrailEntry` to error state with `error`.
- `getEntryState(entry)`: Returns `'loading' | 'resolved' | 'error'`.

---

## 6. Utilities, Caching, & Controller

### `SimplePopoverCache<TData>`

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

### `createWorkerResolver(workerOrFn, options?)`

Offloads resolution tasks to a background Web Worker thread:

```ts
const workerResolver = createWorkerResolver(
  async (key: string, parentData?: unknown) => {
    const res = await fetch(`/api/items/${key}`);
    return res.json();
  },
  { timeoutMs: 10000, autoRestart: true }
);
```

### `createPopoverController(store)`

Provides out-of-React state control for WebSockets, Redux, or DOM handlers:

```ts
const controller = createPopoverController(store);
controller.closeByKey('item-12');
controller.clear();
```

---

## License

[MIT](LICENSE)

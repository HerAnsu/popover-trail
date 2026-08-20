# Popover Trail API reference

Complete technical specification for components, hooks, schema builders, core engines, type definitions, and diagnostic validators in `popover-trail`.

---

## Table of contents

1. [Typed schema builder and factory](#1-typed-schema-builder-and-factory)
   - [createPopoverSchema](#createpopoverschema)
   - [mergePopoverSchemas](#mergepopoverschemas)
   - [createPopoverTrail](#createpopovertrail)
   - [definePopoverContext](#definepopovercontext)
   - [defineSchemaNode and toSchemaKey](#defineschemanode-and-toschemakey)
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
   - [usePopoverAction](#usepopoveraction)
   - [usePopoverOptimistic](#usepopoveroptimistic)
   - [usePopoverTimeline](#usepopovertimeline)
   - [usePopoverCard](#usepopovercard)
   - [usePopoverActions](#usepopoveractions)
   - [usePopoverGeometry](#usepopovergeometry)
   - [usePopoverDragAndDrop](#usepopoverdraganddrop)
   - [usePopoverHydration](#usepopoverhydration)
   - [useIsPopoverOpen and state selectors](#useispopoveropen-and-state-selectors)
   - [Utility and adapter hooks](#utility-and-adapter-hooks)
4. [DND sub-package (popover-trail/dnd)](#4-dnd-sub-package-popover-traildnd)
   - [PopoverCanvas](#popovercanvas)
   - [PopoverCard (DND version)](#popovercard-dnd-version)
   - [usePopoverDraggableCard](#usepopoverdraggablecard)
5. [Core engines and architecture](#5-core-engines-and-architecture)
   - [FSM statechart engine](#fsm-statechart-engine)
   - [DAG cascading graph](#dag-cascading-graph)
   - [QuadTree 2D spatial partitioning index](#quadtree-2d-spatial-partitioning-index)
   - [PopoverTransitionScheduler](#popovertransitionscheduler)
   - [PopoverSnapshotManager](#popoversnapshotmanager)
   - [CQRS query and command buses](#cqrs-query-and-command-buses)
   - [EventBus and CustomEvent engine](#eventbus-and-customevent-engine)
   - [Pluggable layout strategies](#pluggable-layout-strategies)
   - [Theme tokens and CSS custom variables](#theme-tokens-and-css-custom-variables)
   - [Monadic Result pattern](#monadic-result-pattern)
   - [Disposable pattern (TS 5.2 using)](#disposable-pattern-ts-52-using)
   - [Multi-tab broadcast synchronization](#multi-tab-broadcast-synchronization)
   - [Geometry value objects](#geometry-value-objects)
   - [ObjectPool and MemorySentinel](#objectpool-and-memorysentinel)
6. [Types and discriminated unions](#6-types-and-discriminated-unions)
   - [TrailEntry and state subtypes](#trailentry-and-state-subtypes)
   - [PopoverFSMState](#popoverfsmstate)
   - [PopoverTimelineStep](#popovertimelinestep)
   - [PopoverEntryDiscriminatedState](#popoverentrydiscriminatedstate)
   - [PolymorphicPropsWithRef](#polymorphicpropswithref)
   - [TypedMiddlewarePatch](#typedmiddlewarepatch)
   - [Branded primitive types](#branded-primitive-types)
   - [React 19 Action and Optimistic types](#react-19-action-and-optimistic-types)
7. [Type guards and helper utilities](#7-type-guards-and-helper-utilities)
   - [Entry type guards](#entry-type-guards)
   - [Anchor type guards](#anchor-type-guards)
   - [Store event type guards](#store-event-type-guards)
   - [Type-safe builder helpers](#type-safe-builder-helpers)
8. [Utilities, caching, and controllers](#8-utilities-caching-and-controllers)
   - [SimplePopoverCache](#simplepopovercache)
   - [createWorkerResolver and definePopoverWorkerRPC](#createworkerresolver-and-definepopoverworkerrpc)
   - [createPopoverController](#createpopovercontroller)
   - [PopoverError and error codes](#popovererror-and-error-codes)
9. [Guardrail warnings registry (PT-101 to PT-130)](#9-guardrail-warnings-registry)
10. [CSS custom variables and theme tokens](#10-css-custom-variables-and-theme-tokens)
11. [Keyboard accessibility and ARIA matrix](#11-keyboard-accessibility-and-aria-matrix)

---

## 1. Typed schema builder and factory

### `createPopoverSchema`

Factory function that creates a typed schema instance. Consolidates data resolvers, placement defaults, key unions, typed triggers, and typed hooks into a single declaration.

```tsx
import { createPopoverSchema } from 'popover-trail';

export const appSchema = createPopoverSchema({
  userProfile: {
    resolver: async (key, _parentData, _context, signal) => {
      const res = await fetch(`/api/users/${key}`, { signal });
      return res.json();
    },
    placement: 'right',
    offset: 12,
    children: ['userStats', 'userSettings'] as const,
    hover: { enabled: true, openDelay: 200, closeDelay: 300 },
  },
  userStats: {
    resolver: async (key, parentData: { id: string }) => {
      const res = await fetch(`/api/users/${parentData.id}/stats`);
      return res.json();
    },
    placement: 'bottom',
  },
  userSettings: {
    resolver: async (key) => ({ theme: 'dark', notifications: true }),
    placement: 'left',
  },
});
```

#### Node options (`PopoverSchemaNode<TData, TParentData, TContext>`)

| Option                  | Type                                                               | Default     | Description                                                                                 |
| :---------------------- | :----------------------------------------------------------------- | :---------- | :------------------------------------------------------------------------------------------ |
| `resolver`              | `(key, parentData?, context?, signal?) => TData \| Promise<TData>` | Required    | Data fetcher function resolving state for the popover key. Supports AbortSignal.            |
| `children`              | `ReadonlyArray<string>`                                            | `undefined` | Restricts allowed child popover keys when calling `pushNested`.                             |
| `placement`             | `PopoverPlacement`                                                 | `'right'`   | Preferred alignment placement relative to anchor element.                                   |
| `offset`                | `number`                                                           | `8`         | Distance gap in pixels between anchor element and popover container.                        |
| `collision`             | `CollisionConfig`                                                  | `undefined` | Boundary collision settings (`boundary`, `padding`, `flip`, `shift`, `size`).               |
| `hover`                 | `HoverConfig`                                                      | `undefined` | Hover trigger delay parameters (`enabled`, `openDelay`, `closeDelay`, `closeOnMouseLeave`). |
| `allowDragWhenPinned`   | `boolean`                                                          | `true`      | Enable pointer dragging when card is pinned floating window.                                |
| `allowDragWhenUnpinned` | `boolean`                                                          | `true`      | Enable pointer dragging when card is in trailing stack.                                     |

#### Schema instance properties (`PopoverSchemaInstance<TSchema>`)

| Property              | Type                                       | Description                                                                         |
| :-------------------- | :----------------------------------------- | :---------------------------------------------------------------------------------- |
| `definition`          | `TSchema`                                  | Raw input definition object.                                                        |
| `keys`                | `{ [K in keyof TSchema]: K }`              | Typed key mapping object (`appSchema.keys.userProfile`).                            |
| `createResolver()`    | `() => PopoverResolver`                    | Factory function generating unified resolver for `<PopoverProvider>`.               |
| `Trigger`             | `React.ComponentType`                      | Typed trigger component `<appSchema.Trigger popoverKey="...">`.                     |
| `useData(key)`        | `(key) => SchemaData \| null \| undefined` | Hook returning typed data payload for specified schema key.                         |
| `useEntry(key)`       | `(key) => TrailEntry \| undefined`         | Hook returning active `TrailEntry` for specified schema key.                        |
| `usePopover(key)`     | `(key) => UsePopoverResult<SchemaData>`    | All-in-one hook for data, status, and actions for specified key.                    |
| `useBreadcrumbs(key)` | `(key) => readonly SchemaKeys[]`           | Hook returning ancestor keys path from root to key.                                 |
| `useChildren(key)`    | `(key) => readonly SchemaKeys[]`           | Hook returning active direct child keys spawned from key.                           |
| `useParent(key)`      | `(key) => SchemaKeys \| undefined`         | Hook returning parent popover key.                                                  |
| `useDepth(key)`       | `(key) => number`                          | Hook returning nesting depth level (0 for root).                                    |
| `useIsOpen(key)`      | `(key) => boolean`                         | Hook checking whether popover is currently active in trail/floating stack.          |
| `useIsPinned(key)`    | `(key) => boolean`                         | Hook checking whether popover is pinned as floating window.                         |
| `useIsTopMost(key)`   | `(key) => boolean`                         | Hook checking whether popover is top-most in z-index order.                         |
| `useIsLoading(key)`   | `(key) => boolean`                         | Hook checking whether data resolution is in progress for key.                       |
| `useActions()`        | `() => SchemaActions`                      | Hook returning store dispatch methods bound to schema keys and child relationships. |

#### Methods on `schema.useActions()`

- `openRoot(key, anchorEvent, options?)`: Opens root popover with typed key autocompletion.
- `pushNested(key, sourceKey, options?)`: Pushes nested child popover. When parent defines `children`, `key` is strictly constrained to `AllowedChildrenOf<TSchema, sourceKey>`.
- `close(key)`: Closes target popover and its active descendants.
- `closeAll()`: Closes all popovers.
- `togglePin(key, rect?)`: Toggles pinned floating state.
- `bringToFront(key)`: Raises popover to top of stack.
- `retryPopover(key)`: Retries data resolution.
- `prefetchPopover(key, parentData?)`: Prefetches data resolution into cache.
- `clear()`: Clears all popovers immediately.

---

### `mergePopoverSchemas`

Merges multiple schema instances into a single combined schema definition with unified keys and resolvers:

```tsx
import { createPopoverSchema, mergePopoverSchemas } from 'popover-trail';

const userSchema = createPopoverSchema({ userProfile: { resolver: fetchUser } });
const orgSchema = createPopoverSchema({ orgDetails: { resolver: fetchOrg } });

export const rootSchema = mergePopoverSchemas(userSchema, orgSchema);
```

---

### `createPopoverTrail`

Overloaded factory supporting schema-driven definitions and generic type bindings.

```tsx
// 1. Schema Mode
const schemaInstance = createPopoverTrail({
  accountCard: {
    resolver: (key) => fetchAccount(key),
  },
});
const { PopoverProvider, PopoverTrigger, PopoverPortal, usePopover } = schemaInstance;

// 2. Generic Mode
const trailHelpers = createPopoverTrail<UserData, GlobalContextType>();
const {
  PopoverProvider,
  PopoverTrigger,
  PopoverPortal,
  usePopover,
  usePopoverActions,
  usePopoverContext,
} = trailHelpers;
```

---

### `definePopoverContext`

Factory generating pre-bound React Context hooks and provider components typed for a specific global `TContext` structure. Eliminates repeating generic parameter types across components.

```tsx
import { definePopoverContext } from 'popover-trail';

export interface AppContext {
  userId: string;
  theme: 'light' | 'dark';
}

export const { Provider, useContext, useActions, useStoreApi } = definePopoverContext<AppContext>();
```

---

### `defineSchemaNode` and `toSchemaKey`

Helper utilities for building schema nodes and validating schema keys with compiler inference:

```tsx
import { defineSchemaNode, toSchemaKey } from 'popover-trail';

const profileNode = defineSchemaNode<UserProfileData>({
  resolver: async (key) => fetchProfile(key),
  placement: 'right',
});

const validKey = toSchemaKey(appSchema, 'userProfile');
```

---

## 2. Components and compound layouts

### `<PopoverProvider>`

Instantiates the Zustand store, injects context into the React tree, and manages global event listeners for Escape key handling, keyboard navigation, and click-outside dismissal.

```tsx
<PopoverProvider
  schema={appSchema}
  clickOutside={{ enabled: true, ignoreSelector: '.modal-backdrop' }}
  baseZIndex={1000}
  cascadeOffsetStep={24}
  exitTransitionDuration={200}>
  <MainLayout />
  <PopoverTrail />
</PopoverProvider>
```

#### Provider properties (`PopoverProviderProps<TData, TContext>`)

| Prop                     | Type                                               | Default             | Description                                                                                                                |
| :----------------------- | :------------------------------------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| `children`               | `React.ReactNode`                                  | Required            | Child elements rendered within context scope.                                                                              |
| `schema`                 | `PopoverSchemaInstance`                            | `undefined`         | Typed schema instance generated by `createPopoverSchema`.                                                                  |
| `resolveData`            | `PopoverResolver`                                  | `undefined`         | Data resolver `(key, parentData?, context?, signal?) => TData \| Promise<TData>`.                                          |
| `initialContext`         | `TContext`                                         | `undefined`         | Global shared context passed to all resolvers.                                                                             |
| `clickOutside`           | `ClickOutsideConfig`                               | `{ enabled: true }` | Settings for click-outside auto-closing (`enabled`, `ignoreSelector`, `ignoreClass`, `popoverSelector`, `onClickOutside`). |
| `enableKeyboardClose`    | `boolean`                                          | `true`              | Close topmost popover when Escape key is pressed.                                                                          |
| `enableArrowNavigation`  | `boolean`                                          | `true`              | Enable keyboard arrow key navigation between active popovers.                                                              |
| `closePinnedDescendants` | `boolean`                                          | `false`             | Close pinned floating child popovers when a parent closes.                                                                 |
| `allowDragWhenPinned`    | `boolean`                                          | `true`              | Allow mouse and touch dragging when card is pinned floating.                                                               |
| `allowDragWhenUnpinned`  | `boolean`                                          | `true`              | Allow mouse and touch dragging when card is unpinned trailing.                                                             |
| `cache`                  | `PopoverCache<TData>`                              | `undefined`         | Cache implementation for caching resolver promises.                                                                        |
| `collision`              | `CollisionConfig`                                  | `undefined`         | Global boundary collision configuration.                                                                                   |
| `baseZIndex`             | `number`                                           | `1000`              | Base z-index depth factor.                                                                                                 |
| `cascadeOffsetStep`      | `number`                                           | `24`                | Pixel offset shift added per level of nesting.                                                                             |
| `exitTransitionDuration` | `number`                                           | `200`               | Unmount delay in milliseconds for CSS exit animations.                                                                     |
| `defaultOffset`          | `number`                                           | `8`                 | Default gap offset distance in pixels.                                                                                     |
| `mountingClassName`      | `string`                                           | `'mounting'`        | Global CSS class added while mounting.                                                                                     |
| `unmountingClassName`    | `string`                                           | `'unmounting'`      | Global CSS class added while unmounting.                                                                                   |
| `mountedClassName`       | `string`                                           | `'mounted'`         | Global CSS class added when fully mounted.                                                                                 |
| `responsiveMode`         | `'auto' \| 'popover' \| 'bottom-sheet' \| 'modal'` | `'auto'`            | Responsive layout transformation mode.                                                                                     |
| `mobileBreakpoint`       | `number`                                           | `640`               | Viewport width threshold in pixels for mobile transformation.                                                              |
| `stackGroup`             | `string \| null`                                   | `null`              | Active stack group zone ID filter.                                                                                         |
| `focusLockOptions`       | `FocusLockOptions`                                 | `undefined`         | Focus trap settings (`enabled`, `autoFocusElement`, `returnFocus`, `lockScroll`).                                          |
| `components`             | `PopoverSlotComponents`                            | `undefined`         | Custom UI slot component overrides (`PinButton`, `CloseButton`, `LoadingSpinner`, `ErrorFallback`).                        |
| `zIndexBaseMap`          | `ZIndexBaseMap`                                    | `undefined`         | Per-stack-group base z-index mapping.                                                                                      |
| `debug`                  | `boolean`                                          | `false`             | Log Zustand state mutations to console.                                                                                    |

---

### `<PopoverCard>` and compound subcomponents

Polymorphic container element for popover cards. Binds coordinates, accessibility attributes (`role="dialog"`), data attributes (`data-state`, `data-pinned`, `data-key`), and CSS custom variables automatically. Supports polymorphic `ref` inference via `PolymorphicPropsWithRef<E, P>`.

```tsx
<PopoverCard
  as="article"
  entry={entry}
  index={index}
  isPinned={isPinned}
  className="card-container">
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

| Prop        | Type                                                    | Default     | Description                                       |
| :---------- | :------------------------------------------------------ | :---------- | :------------------------------------------------ |
| `as`        | `React.ElementType`                                     | `'div'`     | HTML tag or custom component type.                |
| `entry`     | `TrailEntry<TData>`                                     | Required    | Active entry represented by this card.            |
| `index`     | `number`                                                | Required    | Virtual depth index of the card in the cascade.   |
| `isPinned`  | `boolean`                                               | Required    | True if card is pinned to the canvas.             |
| `placement` | `PopoverPlacement`                                      | `'bottom'`  | Preferred placement direction relative to anchor. |
| `children`  | `ReactNode \| ((scope: PopoverCardScope) => ReactNode)` | `undefined` | Card child elements or render prop function.      |

#### Render prop scope (`PopoverCardScope<TData>`)

When `children` is passed as a function, it receives:

- `entry`: Active `TrailEntry<TData>`.
- `index`: Virtual stack index.
- `isPinned`: Pinning boolean.
- `card`: Result of `usePopoverCard`.
- `actions`: Store action dispatchers.

#### Compound subcomponents

| Subcomponent                | Description                                                          |
| :-------------------------- | :------------------------------------------------------------------- |
| `<PopoverCard.Handle>`      | Drag handle element attaching ARIA attributes and pointer listeners. |
| `<PopoverCard.PinButton>`   | Toggle button for pinning. Invokes `actions.togglePin(key, rect)`.   |
| `<PopoverCard.CloseButton>` | Close button. Invokes `actions.closeByKey(key)`.                     |
| `<PopoverCard.Content>`     | Wrapper container for card body content.                             |

---

### `<PopoverTrail>`

Headless list renderer iterating through active popover cards in sequence.

```tsx
<PopoverTrail
  renderCard={(entry, index, isPinned) => (
    <PopoverCard key={entry.key} entry={entry} index={index} isPinned={isPinned}>
      <PopoverCard.Content>
        <h4>{entry.data?.title}</h4>
      </PopoverCard.Content>
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

#### Timeline compound subcomponents

- `<PopoverTimeline.StepList>`: Iterates over timeline history steps.
- `<PopoverTimeline.Step>`: Renders an individual step button. Clicking jumps state to that step.
- `<PopoverTimeline.UndoButton>`: Triggers undo rollback. Disabled when `canUndo` is false.
- `<PopoverTimeline.RedoButton>`: Triggers redo replay. Disabled when `canRedo` is false.

---

### `<PopoverPortal>`

Renders children into `document.body` or a specified DOM target container via `ReactDOM.createPortal`. Validates target DOM node presence before rendering.

| Prop        | Type                                                  | Default         | Description                                               |
| :---------- | :---------------------------------------------------- | :-------------- | :-------------------------------------------------------- |
| `container` | `HTMLElement \| null`                                 | `document.body` | Target DOM element container for portal mounting.         |
| `children`  | `ReactNode \| ((entries: TrailEntry[]) => ReactNode)` | Required        | Render nodes or render function receiving active entries. |

---

### `<PopoverTrigger>`

Anchor component attaching click and hover event listeners to open popovers. Clones its child element or delegates to a render prop, injecting `aria-haspopup="dialog"`, `aria-expanded`, and `aria-controls`.

```tsx
// 1. Direct child element
<PopoverTrigger popoverKey="userStats" placement="bottom" offset={10}>
  <button type="button">View Statistics</button>
</PopoverTrigger>

// 2. Render prop pattern
<PopoverTrigger popoverKey="userStats">
  {(triggerProps) => (
    <button type="button" {...triggerProps}>
      Stats ({triggerProps['aria-expanded'] ? 'Open' : 'Closed'})
    </button>
  )}
</PopoverTrigger>
```

| Prop              | Type                                   | Default     | Description                                                       |
| :---------------- | :------------------------------------- | :---------- | :---------------------------------------------------------------- |
| `popoverKey`      | `string`                               | Required    | Unique key identifier of target popover to open.                  |
| `placement`       | `PopoverPlacement`                     | `'right'`   | Alignment placement relative to trigger element.                  |
| `offset`          | `number`                               | `8`         | Distance gap in pixels.                                           |
| `options`         | `OpenRootOptions \| OpenNestedOptions` | `undefined` | Trigger options (`hover`, `collision`, `focusLockOptions`, etc.). |
| `activeClassName` | `string`                               | `undefined` | CSS class applied when target popover is open.                    |
| `asChild`         | `boolean`                              | `false`     | If true, passes props without mutating element.                   |
| `parentKey`       | `string`                               | `undefined` | Optional parent popover key for nested triggers.                  |

---

## 3. Hooks and selectors

### `usePopover`

Unified facade hook providing data, status flags, layout coordinates, and actions for a single popover key.

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
  state,
  close,
  pin,
  bringToFront,
  updateOffset,
} = usePopover<UserData>('userProfile');
```

#### Return signature (`UsePopoverResult<TData>`)

| Property             | Type                                    | Description                                                    |
| :------------------- | :-------------------------------------- | :------------------------------------------------------------- |
| `data`               | `TData \| null \| undefined`            | Resolved data payload.                                         |
| `error`              | `Error \| null`                         | Resolution failure error object.                               |
| `isLoading`          | `boolean`                               | True if data resolver promise is pending.                      |
| `isOpen`             | `boolean`                               | True if popover is active in trail or floating stack.          |
| `isPinned`           | `boolean`                               | True if popover is pinned as floating canvas window.           |
| `isTop`              | `boolean`                               | True if popover is top-most in z-index order.                  |
| `zIndex`             | `number`                                | Calculated 0-based depth layer z-index.                        |
| `offset`             | `{ x: number, y: number }`              | Pixel coordinate drag offset.                                  |
| `entry`              | `TrailEntry<TData> \| undefined`        | Active state entry object.                                     |
| `state`              | `PopoverEntryDiscriminatedState<TData>` | Discriminated union of status (`loading`, `error`, `success`). |
| `close()`            | `() => void`                            | Closes target popover and its descendants.                     |
| `pin(rect?)`         | `(rect?: DOMRect) => void`              | Toggles pinned floating state.                                 |
| `bringToFront()`     | `() => void`                            | Raises popover z-index to top.                                 |
| `updateOffset(x, y)` | `(x: number, y: number) => void`        | Updates drag coordinate offsets.                               |

---

### `usePopoverData`

Data selector hook. Leverages React 19 `use(promise)` for Suspense support when `entry.dataPromise` is pending.

```tsx
function UserCard() {
  const data = usePopoverData<UserData>('userProfile');
  return <div>{data?.name}</div>;
}
```

---

### `usePopoverAction`

React 19 Server Action / Transition executor hook. Runs async server actions or client transitions with automatic pending state tracking, error handling, and optional store data revalidation.

```tsx
import { usePopoverAction } from 'popover-trail';

function ProfileEditCard({ entryKey }: { entryKey: string }) {
  const { execute, isPending, data, error, isSuccess, isError, reset } = usePopoverAction(
    async (formData: FormData) => {
      'use server';
      return await updateProfile(formData);
    },
    {
      entryKey,
      autoReload: true,
      onSuccess: (result) => console.log('Saved:', result),
      onError: (err) => console.error('Failed:', err),
    },
  );

  return (
    <form action={execute}>
      <input name="username" defaultValue="alex" />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save Profile'}
      </button>
      {isError && <p className="error">{error?.message}</p>}
    </form>
  );
}
```

#### Options (`UsePopoverActionOptions<TResult>`)

| Option       | Type                      | Default     | Description                                                         |
| :----------- | :------------------------ | :---------- | :------------------------------------------------------------------ |
| `entryKey`   | `string`                  | `undefined` | Optional popover key to associate and revalidate upon completion.   |
| `autoReload` | `boolean`                 | `false`     | If `true` and `entryKey` is provided, automatically refetches data. |
| `onSuccess`  | `(data: TResult) => void` | `undefined` | Callback invoked upon successful action completion.                 |
| `onError`    | `(error: Error) => void`  | `undefined` | Callback invoked upon action failure.                               |

---

### `usePopoverOptimistic`

Optimistic UI state hook with cross-version React 18/19 fallback support. Applies immediate local updates while an async server mutation is in-flight.

```tsx
import { usePopoverOptimistic } from 'popover-trail';

function TaskCard({ serverTask }: { serverTask: TaskData }) {
  const [optimisticTask, setOptimisticTask] = usePopoverOptimistic(
    serverTask,
    (current, update: Partial<TaskData>) => ({ ...current, ...update }),
  );

  const handleToggle = async () => {
    setOptimisticTask({ completed: !optimisticTask.completed });
    await updateTaskStatus(serverTask.id, !optimisticTask.completed);
  };

  return (
    <div>
      <span>{optimisticTask.title}</span>
      <input type="checkbox" checked={optimisticTask.completed} onChange={handleToggle} />
    </div>
  );
}
```

---

### `usePopoverTimeline`

Hook for interacting with timeline history state and navigation controls.

```tsx
const { history, currentIndex, canUndo, canRedo, undo, redo, jumpToStep } = usePopoverTimeline();
```

| Return property     | Type                      | Description                                    |
| :------------------ | :------------------------ | :--------------------------------------------- |
| `history`           | `PopoverTimelineItem[]`   | Recorded history steps array.                  |
| `currentIndex`      | `number`                  | Index of active step in history stack.         |
| `canUndo`           | `boolean`                 | True if history undo operation is available.   |
| `canRedo`           | `boolean`                 | True if history redo operation is available.   |
| `undo()`            | `() => void`              | Rolls back state to previous history step.     |
| `redo()`            | `() => void`              | Replays next history step.                     |
| `jumpToStep(index)` | `(index: number) => void` | Navigates state directly to target step index. |

---

### `usePopoverCard`

Card positioning and interaction hook. Integrates Floating UI geometry, ARIA focus locking, keyboard arrow navigation, and transition status tracking.

```tsx
const {
  ref,
  style,
  isTop,
  isDragging,
  actions,
  dragHandleProps,
  onMouseEnter,
  onMouseLeave,
  onKeyDown,
  transitionClassName,
  buttonControls,
  handlePinToggle,
} = usePopoverCard({ entry, index, isPinned: false });
```

---

### `usePopoverActions`

Returns store dispatcher methods (`openRoot`, `pushNested`, `openRootWithResolver`, `openNestedWithResolver`, `closeByKey`, `closeAll`, `togglePin`, `bringToFront`, `updateOffset`, `retryPopover`, `prefetchPopover`, `hoverEnter`, `hoverLeave`, `closeTopmost`, `clear`, `clearTrail`, `undo`, `redo`).

---

### `usePopoverGeometry`

Calculates layout coordinates (`finalLayoutPos: { top, left }`). Accepts `enableSpatialCollision: true` to enable 2D QuadTree spatial collision resolution.

```tsx
const { finalLayoutPos, setFloating } = usePopoverGeometry({
  id: 'userProfile',
  anchorRect: entry.rect,
  placement: 'right',
  zIndex: 0,
  isDragging: false,
  isPinned: false,
  entry,
  enableSpatialCollision: true,
});
```

---

### `usePopoverDragAndDrop`

Calculates 3D Euler rotation tilt angles (`rotation`, `rotationX`, `rotationY`) and drag offsets based on pointer movement velocity with spring physics and inertia decay.

```tsx
const { rotation, rotationX, rotationY, dragX, dragY } = usePopoverDragAndDrop({
  isDragging: true,
  transform: { x: 100, y: 50 },
  enableTilt: true,
  maxTiltAngle: 5,
  tiltSensitivity: 8,
  dragAxis: 'both',
  tiltFriction: 0.95,
  tiltDecay: 0.82,
  cardRef: domRef,
});
```

---

### `usePopoverHydration`

Tracks async data loading status (`state`, `isLoading`, `error`, `data`) and provides a `reload()` callback.

```tsx
const { state, isLoading, error, data, reload } = usePopoverHydration<UserData>('userProfile');
```

---

### `useIsPopoverOpen` and state selectors

Fine-grained selector hooks exported from `usePopoverSelectors`:

- `useIsPopoverOpen(key)`: Returns `true` if key is active in trail or floating list.
- `useIsPopoverPinned(key)`: Returns `true` if key is pinned.
- `usePopoverEntry(key)`: Returns `TrailEntry<TData> | undefined`.
- `usePopoverEntryStatus(key, expectedStatus)`: Returns `NarrowTrailEntry<TData, S> | undefined` with narrowed type.
- `usePopoverZIndex(key)`: Returns 0-based z-index depth index.
- `useIsPopoverTopMost(key)`: Returns `true` if key is topmost in stack.
- `usePopoverOffset(key)`: Returns `{ x, y }` drag offset for a specific key.
- `usePopoverOffsets()`: Returns record of all card drag offsets.
- `usePopoverTrail()`: Returns active trailing cascade array.
- `usePopoverFloating()`: Returns active floating card array.
- `usePopoverContext<TContext>()`: Returns current global context.
- `usePopoverCollisionConfig()`: Returns global collision configuration.
- `usePopoverIsLoading(key)`: Returns boolean loading status.
- `usePopoverError(key)`: Returns error object if resolution failed.
- `usePopoverRootEntry()`: Returns root popover entry from trail.
- `usePopoverTotalActiveCount()`: Returns total count of active popovers.
- `useIsPopoverIdle()`: Returns `true` when 0 popovers are active.

---

### Utility and adapter hooks

- `useEventListener(target, event, handler, options)`: Type-safe DOM event listener binder.
- `useMergedRef(...refs)`: Merges multiple React refs into a single callback ref.
- `useStableCallback(fn)`: Returns referentially stable callback function across renders.
- `useClickOutside(config, isActive)`: Binds click-outside dismissal handlers.
- `useCrossVersionActionState(action, initialState)`: Cross-version wrapper using React 19 `useActionState` when available, falling back to React 18 transition state.
- `useCrossVersionOptimistic(passthrough, updateFn)`: Cross-version wrapper using React 19 `useOptimistic` when available, falling back to local state.

---

## 4. DND sub-package (`popover-trail/dnd`)

Separate export entry point providing drag-and-drop canvas capabilities powered by `@dnd-kit/core`.

```tsx
import { PopoverCanvas, PopoverCard, usePopoverDraggableCard } from 'popover-trail/dnd';
```

### `<PopoverCanvas>`

Drag-and-drop context container managing pointer, touch, and keyboard sensors, custom modifiers, and viewport clamping boundaries.

```tsx
<PopoverCanvas restrictToWindow={true} restrictToContainer={false}>
  {({ entry, index, isPinned }) => (
    <PopoverCard entry={entry} index={index} isPinned={isPinned}>
      <CardContent entry={entry} />
    </PopoverCard>
  )}
</PopoverCanvas>
```

| Prop                  | Type                                               | Default     | Description                                                       |
| :-------------------- | :------------------------------------------------- | :---------- | :---------------------------------------------------------------- |
| `children`            | `(props: { entry, index, isPinned }) => ReactNode` | Required    | Render prop returning JSX content for active popover cards.       |
| `modifiers`           | `Modifier[]`                                       | `undefined` | Custom DndContext modifiers.                                      |
| `restrictToWindow`    | `boolean`                                          | `false`     | Lock dragging coordinates strictly to window viewport edges.      |
| `restrictToContainer` | `boolean`                                          | `false`     | Lock dragging coordinates to canvas container element boundaries. |

---

### `<PopoverCard>` (DND version)

High-level pre-bound card component that wraps `<dialog>` with focus locking (`react-focus-lock`), spring physics tilt, viewport clamping, and drag handles.

```tsx
<PopoverCard
  entry={entry}
  index={index}
  isPinned={isPinned}
  features={{ drag: true, tilt: true, focusLock: true }}
  dragHandle={(handleProps) => (
    <div className="card-header" {...handleProps}>
      <span>Header</span>
    </div>
  )}>
  <p>Body Content</p>
</PopoverCard>
```

---

### `usePopoverDraggableCard`

Hook binding Floating UI positioning, `@dnd-kit/core` dragging, spring physics tilt, and focus lock into a single card handle.

---

## 5. Core engines and architecture

### FSM statechart engine

Deterministic finite state machine reducer with static O(1) transition lookup table (`popoverFSMReducer` & `createPopoverFSM`). `PopoverFSMState<TData>` is a 6-state discriminated union allowing zero-assertion narrowing:

- `IdleFSMState` (`value: 'Idle'`)
- `HydratingFSMState` (`value: 'Hydrating'`)
- `ResolvedTrailingFSMState` (`value: 'Resolved.Trailing'`, narrows `context.data` to `TData`)
- `ResolvedPinnedFSMState` (`value: 'Resolved.Pinned'`, narrows `context.data` to `TData`)
- `ErrorFSMState` (`value: 'Error'`, narrows `context.error` to `Error`)
- `UnmountingFSMState` (`value: 'Unmounting'`)

```typescript
import { createPopoverFSM, popoverFSMReducer } from 'popover-trail';

const fsm = createPopoverFSM({ key: 'userProfile' });
fsm.send({ type: 'RESOLVE_SUCCESS', data: { id: '1', name: 'Alice' } });

const fsmState = fsm.getState();
if (fsmState.value === 'Resolved.Trailing') {
  console.log(fsmState.context.data.name); // Type-safe narrowing to TData
}
```

---

### DAG cascading graph

`PopoverDAG` class for managing parent-child node relationships and querying topological ancestor and descendant paths. Includes recursion guards capped at 500 traversal steps.

```typescript
import { PopoverDAG } from 'popover-trail';

const dag = new PopoverDAG();
dag.addNode('parentCard');
dag.addNode('childCard', 'parentCard');
const descendants = dag.getDescendantKeys('parentCard'); // ['childCard']
```

---

### QuadTree 2D spatial partitioning index

2D spatial index for querying bounding box overlaps and collision avoidance in O(log N) time.

```typescript
import { QuadTree } from 'popover-trail';

const tree = new QuadTree({ x: 0, y: 0, width: 1920, height: 1080 });
tree.insert({ id: 'card1', bounds: { x: 100, y: 100, width: 300, height: 200 } });
const collisions = tree.retrieve([], { x: 120, y: 120, width: 300, height: 200 });
```

---

### PopoverTransitionScheduler

Centralized animation and transition coordinator. Manages double-rAF mounting state triggers and exit animation timers with `ScopeDisposable` resource disposal handles to prevent orphaned timer memory leaks.

```typescript
import { PopoverTransitionScheduler } from 'popover-trail';

const scheduler = new PopoverTransitionScheduler();

// Schedule unmount transition with auto-cleanup
const disposable = scheduler.scheduleUnmount(
  'userProfile',
  300, // durationMs
  () => actions.setTransitionStatus('userProfile', 'unmounting'),
  () => actions.finalizeUnmount('userProfile'),
);

// Explicit disposal cancels timers immediately
disposable.dispose();
```

---

### PopoverSnapshotManager

Cross-tab state persistence and synchronization engine via `BroadcastChannel` and `localStorage`. Sanitizes keys against prototype pollution attacks before restoration.

```typescript
import { PopoverSnapshotManager } from 'popover-trail';

const manager = new PopoverSnapshotManager({
  storageKey: 'my-app-popovers',
  enableBroadcastChannel: true,
});
manager.saveSnapshot(snapshot);
```

---

### CQRS query and command buses

Explicitly separates read-only queries from state-mutating command dispatches:

```typescript
import { createCQRSBuses } from 'popover-trail';

const { queryBus, commandBus } = createCQRSBuses(storeApi);

// Read-only queries (zero side-effects)
console.log(queryBus.activeCount, queryBus.isIdle, queryBus.topmost);

// Command dispatchers
commandBus.close('userProfile');
```

---

### EventBus and CustomEvent engine

Native EventTarget-based event bus for decoupled lifecycle communication:

```typescript
import { globalPopoverEventBus, PopoverCustomEvent } from 'popover-trail';

const unsubscribe = globalPopoverEventBus.on('popover:open', (event) => {
  console.log('Opened:', event.detail.key);
});
```

---

### Pluggable layout strategies

Strategy registry supporting custom positioning algorithms alongside built-in implementations:

- `RelativeFloatingLayoutStrategy` (id: `'floating-ui'`)
- `FixedCenterLayoutStrategy` (id: `'fixed-center'`)
- `DockedBottomLayoutStrategy` (id: `'docked-bottom'`)
- `DockedTopLayoutStrategy` (id: `'docked-top'`)

```typescript
import { globalLayoutStrategyRegistry } from 'popover-trail';

globalLayoutStrategyRegistry.register({
  id: 'custom-corner',
  computePosition: (params) => new Point2D(20, 20),
});
```

---

### Theme tokens and CSS custom variables

Dynamic theme injector that applies CSS custom properties with automatic disposal:

```typescript
import { applyThemeTokens, removeThemeTokens } from 'popover-trail';

const cleanup = applyThemeTokens({
  zIndexBase: 2000,
  cascadeOffset: 24,
  cardRadius: '12px',
  cardShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
});

// Remove tokens when unmounting
cleanup();
// or call directly:
removeThemeTokens(['--pt-z-index-base', '--pt-cascade-offset']);
```

---

### Monadic Result pattern

Railway-oriented error handling with `Result<T, E>`:

```typescript
import { Ok, Err, isOk, matchResult, wrapResult } from 'popover-trail';

const result = wrapResult(() => JSON.parse(rawText));
matchResult(result, {
  ok: (data) => console.log('Parsed:', data),
  err: (error) => console.error('Failed:', error.message),
});
```

---

### Disposable pattern (TS 5.2 using)

Resource management pattern supporting TypeScript 5.2+ `using` declarations:

```typescript
import { CompositeDisposable, createDisposable } from 'popover-trail';

{
  using disposables = new CompositeDisposable();
  disposables.add(createDisposable(() => console.log('Cleaned up')));
} // Automatically cleaned up on scope exit
```

---

### Multi-tab broadcast synchronization

Synchronizes popover open, close, and pin actions across browser tabs:

```typescript
import { createBroadcastSync } from 'popover-trail';

const sync = createBroadcastSync('app-popover-sync');
sync.subscribe((msg) => console.log('Tab sync event:', msg));
sync.broadcast('OPEN', 'userProfile');
```

---

### Geometry value objects

Immutable `Point2D` and `RectBounds` value objects with coordinate validation:

```typescript
import { Point2D, RectBounds } from 'popover-trail';

const point = Point2D.of(100, 200).add({ x: 10, y: 20 });
const bounds = RectBounds.of(0, 0, 400, 300);
console.log(bounds.contains(point)); // true
```

---

### ObjectPool and MemorySentinel

Zero-GC memory management and leak detection tools:

- `ObjectPool<T>`: Recycles temporary objects during high-frequency drag events.
- `trackMemoryCleanup(target, key)` / `untrackMemoryCleanup(target)`: Uses `FinalizationRegistry` to detect detached DOM elements in dev mode.

---

## 6. Types and discriminated unions

### `TrailEntry<TData = unknown>` and state subtypes

```typescript
export interface TrailEntry<TData = unknown> {
  key: string;
  parentKey?: string;
  originalParentKey?: string;
  rect?: DOMRect;
  pinnedLayoutPos?: { top: number; left: number };
  transitionStatus?: 'mounting' | 'mounted' | 'unmounting';
  status?: 'loading' | 'error' | 'success';
  isLoading?: boolean;
  error?: Error | null;
  data?: TData | null;
  dataPromise?: Promise<TData>;
  placement?: PopoverPlacement;
  offset?: number;
  hover?: HoverConfig;
  collision?: CollisionConfig;
  responsiveMode?: 'auto' | 'popover' | 'bottom-sheet' | 'modal';
  layoutStrategy?: 'floating-ui' | 'fixed-center' | 'docked-bottom' | 'docked-top' | 'custom';
  exitTransitionDuration?: number;
  baseZIndex?: number;
  cascadeOffsetStep?: number;
  cascadeOffsetDirection?: 'left' | 'right' | 'top' | 'bottom' | 'none';
  ariaDescribedby?: string;
}

export interface LoadingTrailEntry<TData = unknown> extends TrailEntry<TData> {
  status: 'loading';
  isLoading: true;
  data: undefined;
  error: null;
}

export interface ErrorTrailEntry<TData = unknown> extends TrailEntry<TData> {
  status: 'error';
  isLoading: false;
  data: undefined;
  error: Error;
}

export interface SuccessTrailEntry<TData = unknown> extends TrailEntry<TData> {
  status: 'success';
  isLoading: false;
  data: TData;
  error: null;
}
```

---

### `PopoverTimelineStep<TData>`

Discriminated union type representing navigation steps in popover timeline history:

```typescript
export type PopoverTimelineStep<TData = unknown> =
  ActiveTimelineStep<TData> | UndoneTimelineStep<TData>;

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

```typescript
export type PopoverEntryDiscriminatedState<TData = unknown> =
  | { status: 'loading'; isLoading: true; data: undefined; error: null }
  | { status: 'error'; isLoading: false; data: undefined; error: Error }
  | { status: 'success'; isLoading: false; data: TData; error: null };
```

---

### `PolymorphicPropsWithRef<E, P>`

Helper utility for building custom polymorphic popover card components with element ref inference:

```typescript
export type PolymorphicRef<E extends React.ElementType> = React.ComponentPropsWithRef<E>['ref'];

export type PolymorphicPropsWithRef<E extends React.ElementType, P = {}> = P & { as?: E } & Omit<
    React.ComponentPropsWithoutRef<E>,
    keyof P | 'as'
  > & {
    ref?: PolymorphicRef<E>;
  };
```

---

### `TypedMiddlewarePatch<TData, TContext, TPopoverKey>`

State patch signature returned by store middleware interceptors:

```typescript
export type TypedMiddlewarePatch<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = Partial<PopoverStateData<TData, TContext>>;
```

---

### Branded primitive types

Nominal branding prevents passing arbitrary strings or numbers into coordinate and identifier parameters:

- `PopoverKey<T>`
- `ViewportX` / `ViewportY`
- `OwnerId`
- `StackGroupId`
- `TabId`
- `ZIndexDepth`
- `ParentKey`

---

### React 19 Action and Optimistic types

```typescript
export type PopoverActionStatus = 'idle' | 'pending' | 'success' | 'error';

export interface PopoverActionState<TResult> {
  status: PopoverActionStatus;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  data: TResult | null;
  error: Error | null;
}

export type PopoverServerAction<TArgs extends unknown[] = unknown[], TResult = unknown> = (
  ...args: TArgs
) => Promise<TResult> | TResult;

export interface UsePopoverActionOptions<TResult> {
  entryKey?: string;
  autoReload?: boolean;
  onSuccess?: (data: TResult) => void;
  onError?: (error: Error) => void;
}

export interface UsePopoverActionResult<
  TArgs extends unknown[] = unknown[],
  TResult = unknown,
> extends PopoverActionState<TResult> {
  execute: (...args: TArgs) => Promise<TResult | undefined>;
  reset: () => void;
}
```

---

## 7. Type guards and helper utilities

All executable type guards and helper converters are exported from `popover-trail`:

### Entry type guards

- `isResolvedEntry(entry)`: Narrows `entry.data` to `TData`.
- `isLoadingEntry(entry)`: Narrows `entry.isLoading` to `true`.
- `isErrorEntry(entry)`: Narrows `entry.error` to `Error`.
- `getEntryState(entry)`: Extracts `PopoverEntryDiscriminatedState<TData>`.
- `matchEntryState(state, matchers)`: Exhaustive compile-time pattern matcher.

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
- `defineStoreSlice(creator)`: Modular store slice builder.
- `toViewportX(x)` / `toViewportY(y)`: Converts number into branded `ViewportX` / `ViewportY` coordinate.

---

## 8. Utilities, caching, and controllers

### `SimplePopoverCache`

In-memory cache implementation with TTL record expiration, maximum size eviction, background garbage collection, and hit/miss statistics.

```typescript
import { SimplePopoverCache } from 'popover-trail';

const cache = new SimplePopoverCache(300000, 50); // 5-minute TTL, max 50 items
cache.set('userProfile', userData);
const data = cache.get('userProfile');
```

---

### `createWorkerResolver` and `definePopoverWorkerRPC`

Offloads data resolution tasks to a background Web Worker thread. Supports inline resolver functions, worker script URLs, zero-copy Transferables, and auto-restarts on failure.

```typescript
// Main thread setup
import { createWorkerResolver } from 'popover-trail';

const workerResolver = createWorkerResolver(
  async (key: string, parentData?: unknown) => {
    const res = await fetch(`/api/nodes/${key}`);
    return res.json();
  },
  { timeoutMs: 10000, autoRestart: true },
);

// Worker file setup (for dedicated worker scripts)
import { definePopoverWorkerRPC } from 'popover-trail';

definePopoverWorkerRPC(async (key, parentData, context) => {
  return computeHeavyTask(key);
});
```

---

### `createPopoverController`

Imperative controller for inspecting and dispatching popover actions outside of React component trees (e.g. Redux actions, WebSocket handlers, or Vanilla JS modules).

```typescript
import { createPopoverStore, createPopoverController } from 'popover-trail';

const store = createPopoverStore(async (key) => fetchCardData(key));
const controller = createPopoverController(store);

controller.closeByKey('userProfile');
```

---

### `PopoverError` and error codes

Standardized error structure with diagnostic error codes and remediation hints:

```typescript
import { PopoverError, PopoverErrorCode } from 'popover-trail';

try {
  // Popover operation
} catch (err) {
  if (PopoverError.isPopoverError(err, PopoverErrorCode.RESOLVER_TIMEOUT)) {
    console.warn('Resolver timed out. Hint:', err.remediationHint);
  }
}
```

#### Error codes (`PopoverErrorCode`)

- `ERR_RESOLVER_TIMEOUT`: Data resolver timed out or aborted.
- `ERR_WORKER_CRASHED`: Web Worker crashed or failed instantiation.
- `ERR_PERSIST_FAILED`: State persistence storage operation failed.
- `ERR_INVALID_TRANSITION`: Invalid state transition dispatched to FSM.
- `ERR_CIRCULAR_CASCADE`: Circular ancestor-descendant loop detected.
- `ERR_UNMOUNTED`: Element unmounted during active operation.

---

## 9. Guardrail warnings registry

In development mode (`NODE_ENV !== 'production'`), `popover-trail` logs structured diagnostic warnings formatted as `[popover-trail warning PT-XXX]: <message>`.

| Code       | Validator function                  | Trigger condition                                                                                   |
| :--------- | :---------------------------------- | :-------------------------------------------------------------------------------------------------- |
| **PT-101** | `validatePopoverKey`                | Popover key is missing, empty, or uses reserved JS names (`__proto__`, `constructor`, `prototype`). |
| **PT-102** | `validatePlacement`                 | Invalid layout placement string provided.                                                           |
| **PT-103** | `validateHoverDelays`               | Open hover delay is outside valid range (0ms to 30000ms).                                           |
| **PT-104** | `validateHoverDelays`               | Close hover delay is outside valid range (0ms to 30000ms).                                          |
| **PT-105** | `validateCascadeAncestry`           | Circular cascade loop detected (popoverKey equals parentKey).                                       |
| **PT-106** | `validateCardSubComponentScope`     | `<PopoverCard>` subcomponent rendered outside `<PopoverCard>` container.                            |
| **PT-107** | `validateTimelineSubComponentScope` | `<PopoverTimeline>` subcomponent rendered outside `<PopoverTimeline>` container.                    |
| **PT-108** | `validateSchemaKey`                 | Key requested is not defined in the schema.                                                         |
| **PT-109** | `validateCascadeStep`               | Cascade offset step is outside valid range (0px to 200px).                                          |
| **PT-110** | `validateDefaultOffset`             | Default gap offset is outside valid range (0px to 500px).                                           |
| **PT-111** | `validateBaseZIndex`                | Base z-index is invalid or negative.                                                                |
| **PT-112** | `validateExitDuration`              | Exit duration is outside valid range (0ms to 10000ms).                                              |
| **PT-113** | `validateProviderResolver`          | `<PopoverProvider>` initialized without resolver callback or schema.                                |
| **PT-114** | `validateDragOffset`                | Drag offset coordinates are NaN or exceed bounds ([-10000, 10000]).                                 |
| **PT-115** | `validateCascadeDepth`              | Deep cascade stack detected (depth > 10).                                                           |
| **PT-116** | `validateStackGroup`                | Stack group ID filter is an empty string.                                                           |
| **PT-117** | `validateHistoryCapacity`           | Max history capacity is outside valid range (1 to 500).                                             |
| **PT-118** | `validateTriggerEvent`              | Trigger action dispatch called without valid anchor event.                                          |
| **PT-119** | `validateSharedMemorySupport`       | `useSharedMemory` requested but `SharedArrayBuffer` is unsupported.                                 |
| **PT-120** | `validateHydrationError`            | Data resolution promise rejected with error.                                                        |
| **PT-121** | `validatePinDragState`              | Drag attempted on unpinned card that disables unpinned dragging.                                    |
| **PT-122** | `validateStorageKey`                | Storage key is empty or invalid.                                                                    |
| **PT-123** | `validateQuadTreeBounds`            | QuadTree dimensions non-positive or NaN.                                                            |
| **PT-124** | `validateFSMTransitionEvent`        | FSM reducer received invalid transition event type.                                                 |
| **PT-125** | `validatePortalContainer`           | `<PopoverPortal>` container DOM node is null or unmounted.                                          |
| **PT-126** | `validateFactoryPlacement`          | `createPopoverTrail()` invoked inside React render pass instead of top-level scope.                 |
| **PT-127** | `validateStoreControllerInstance`   | `createPopoverController()` received invalid Zustand store instance.                                |
| **PT-128** | `validateSchemaCircularChild`       | Schema node declares itself as its direct child, creating a circular loop.                          |
| **PT-129** | `validateResolverTimeout`           | Resolver has taken longer than 5000ms to resolve.                                                   |
| **PT-130** | `validatePortalExclusion`           | Element marked with `data-popover-portal` is excluded from click-outside teardown.                  |

---

## 10. CSS custom variables and theme tokens

`<PopoverCard>` dynamically exposes hardware-accelerated CSS custom variables on the element root style object for external CSS animations, custom transforms, and tailwind/vanilla CSS overrides:

### Card layout and physics variables

| Variable                                                 | Type              | Description                                              |
| :------------------------------------------------------- | :---------------- | :------------------------------------------------------- |
| `--popover-translate-x` / `--pt-drag-x`                  | `string` (px)     | Cumulative drag offset distance along horizontal X-axis. |
| `--popover-translate-y` / `--pt-drag-y`                  | `string` (px)     | Cumulative drag offset distance along vertical Y-axis.   |
| `--popover-rotate-x` / `--pt-rotate-x`                   | `string` (deg)    | Spring physics tilt angle around horizontal X-axis.      |
| `--popover-rotate-y` / `--pt-rotate-y`                   | `string` (deg)    | Spring physics tilt angle around vertical Y-axis.        |
| `--popover-rotate-z` / `--pt-rotate-z` / `--pt-tilt-deg` | `string` (deg)    | Spring physics tilt angle around Z-axis.                 |
| `--popover-z-index` / `--pt-z-index`                     | `string` (number) | Calculated z-index stacking depth layer.                 |
| `--pt-top`                                               | `string` (px)     | Absolute top layout position relative to viewport.       |
| `--pt-left`                                              | `string` (px)     | Absolute left layout position relative to viewport.      |

### Global theme tokens (`applyThemeTokens`)

Theme tokens can be applied to `document.documentElement` or any container element via `applyThemeTokens(element, tokens)`:

```typescript
import { applyThemeTokens } from 'popover-trail';

const cleanup = applyThemeTokens(document.documentElement, {
  baseZIndex: 1000,
  cascadeOffset: 24,
  transitionDurationMs: 200,
  backdropBlurPx: 8,
  cardShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
  borderRadiusPx: 12,
});
```

| Token Variable             | Default Value                              | Description                            |
| :------------------------- | :----------------------------------------- | :------------------------------------- |
| `--pt-base-z-index`        | `1000`                                     | Base z-index depth.                    |
| `--pt-cascade-offset`      | `24px`                                     | Step offset per cascade nesting level. |
| `--pt-transition-duration` | `200ms`                                    | Exit transition duration.              |
| `--pt-backdrop-blur`       | `8px`                                      | Backdrop blur filter radius.           |
| `--pt-card-shadow`         | `'0 10px 25px -5px rgba(0, 0, 0, 0.1)...'` | Box shadow token.                      |
| `--pt-border-radius`       | `12px`                                     | Card corner border radius.             |

---

## 11. Keyboard accessibility and ARIA matrix

`popover-trail` implements WCAG 2.1 AAA accessibility compliance with automated ARIA role injection, focus trapping, and keyboard navigation:

### Keyboard shortcuts

| Key                        | Context               | Action                                                                    |
| :------------------------- | :-------------------- | :------------------------------------------------------------------------ |
| `Escape`                   | Global Provider scope | Closes top-most popover card in stack order.                              |
| `ArrowUp` / `ArrowLeft`    | Active PopoverCard    | Navigates keyboard focus to previous popover in trail.                    |
| `ArrowDown` / `ArrowRight` | Active PopoverCard    | Navigates keyboard focus to next popover in trail.                        |
| `Tab` / `Shift+Tab`        | Inside PopoverCard    | Traps focus within active card bounds when `focusLockOptions` is enabled. |

### ARIA and DOM attributes

| Attribute          | Element            | Value / State                             | Description                                                                     |
| :----------------- | :----------------- | :---------------------------------------- | :------------------------------------------------------------------------------ |
| `role`             | `<PopoverCard>`    | `"dialog"`                                | Identifies card container as interactive dialog.                                |
| `aria-modal`       | `<PopoverCard>`    | `"true" \| "false"`                       | `true` for unpinned trailing cards, `false` for pinned modeless floating cards. |
| `aria-label`       | `<PopoverCard>`    | `string`                                  | Custom label or auto-generated `Popover <key>`.                                 |
| `aria-describedby` | `<PopoverCard>`    | `string`                                  | Optional description ID linked to descriptive text.                             |
| `aria-haspopup`    | `<PopoverTrigger>` | `"dialog"`                                | Signals anchored dialog popup capability.                                       |
| `aria-expanded`    | `<PopoverTrigger>` | `"true" \| "false"`                       | Reflects active open state of target popover key.                               |
| `aria-controls`    | `<PopoverTrigger>` | `string`                                  | References target popover card element ID (`popover-card-<key>`).               |
| `data-state`       | `<PopoverCard>`    | `"mounting" \| "mounted" \| "unmounting"` | Enables CSS enter and exit transition selectors.                                |
| `data-pinned`      | `<PopoverCard>`    | `"true" \| "false"`                       | True if card is in pinned floating canvas state.                                |
| `data-key`         | `<PopoverCard>`    | `string`                                  | Unique popover key identifier for debugging and testing.                        |

---

## License

[MIT](LICENSE)

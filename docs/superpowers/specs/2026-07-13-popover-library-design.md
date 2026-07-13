# Design Specification: Generic Headless Popover Library

This document outlines the design and architectural specification for a headless, fully generic React popover library supporting nested popover trails, floating/pinned states, lazy data hydration, and physics-based drag-and-drop behavior.

---

## 1. Directory Structure

The library will reside in the isolated directory `src/lib/popover/`.

```text
src/lib/popover/
├── index.ts               # Public API entry point
├── types.ts               # Strictly typed generic interfaces (TData, TContext)
├── store.ts               # Zustand store factory & state mutation logic
├── context.tsx            # React Context Provider and wrapper hooks
└── hooks/
    ├── usePopoverStore.ts # Selective state access hooks
    ├── useGeometry.ts     # Viewport boundary calculation & ResizeObserver hook
    └── useDragAndDrop.ts  # Rotation & drag offsets hook
```

---

## 2. Core TypeScript Definitions (`types.ts`)

To ensure strict typing throughout the library, we parameterize entries, resolvers, state, and actions with generic types:
* `TData`: Custom payload carried by the popover (resolved asynchronously or passed directly).
* `TContext`: Global environment context needed for calculation or data hydration.

```typescript
export interface TrailEntry<TData = any> {
  /** Unique identifier for this popover instance. */
  key: string
  /** Parent popover identifier (tracks tree hierarchy in nested paths). */
  parentKey?: string
  /** Bounding box of the element that triggered/anchored this popover. */
  rect?: DOMRect
  /** Custom coordinates if the popover is pinned/floating. */
  pinnedLayoutPos?: {
    top: number
    left: number
  }
  /** Resolved data payload. */
  data?: TData
  /** Loading flag during asynchronous resolution. */
  isLoading?: boolean
  /** Error information if resolution fails. */
  error?: Error | null
}

/**
 * Resolver callback type for lazy-loading/hydrating popover data.
 */
export type PopoverResolver<TData = any, TContext = any> = (
  keyOrName: string,
  parentData?: TData,
  context?: TContext
) => Promise<TData> | TData

export interface PopoverStateData<TData = any, TContext = any> {
  /** The stack of active popovers in the current trail path. */
  trail: TrailEntry<TData>[]
  /** Pinned/floating popovers in the viewport. */
  floating: TrailEntry<TData>[]
  /** Current owner claiming the active trail path. */
  ownerId: string | null
  /** Drag-and-drop coordinate offsets mapped by popover key. */
  offsets: Record<string, { x: number; y: number }>
  /** Pinned/floating status mapped by popover key. */
  pinnedStates: Record<string, boolean>
  /** z-index depth order list of keys (highest is last). */
  zIndexOrder: string[]
  /** Counter tracking root-level hydration requests to avoid race conditions. */
  rootHydrationRequestCounter: number
  /** Counters tracking nested hydration requests mapped by parent key. */
  nestedHydrationRequestCounters: Record<string, number>
  /** The HTML anchor element triggering the root popover. */
  anchorElement: HTMLElement | null
  /** Bound box rect of the root anchor element. */
  anchorRect: DOMRect | null
  /** Current external global context values. */
  context: TContext | null
}

export interface PopoverActions<TData = any, TContext = any> {
  /** Updates the shared global context field. */
  setContext: (context: TContext) => void
  /** Updates the owner ID claiming the trail. */
  setOwnerId: (ownerId: string | null) => void
  /** Spawns a new popover trail root. */
  openRoot: (ownerId: string, entry: TrailEntry<TData>) => void
  /** Appends a nested popover after a parent index. */
  pushNested: (index: number, entry: TrailEntry<TData>) => void
  /** Toggles a popover's pinned status. */
  togglePin: (key: string, rect?: DOMRect) => void
  /** Brings a popover and its descendants to the top of the z-index list. */
  bringToFront: (key: string) => void
  /** Closes all popovers at and after a specific index. */
  closeFrom: (index: number) => void
  /** Updates coordinate offsets from drag events. */
  updateOffset: (key: string, x: number, y: number) => void
  /** Resets state completely. */
  clear: () => void
  /** Clears only the active trail (retains floating ones). */
  clearTrail: () => void

  // Orchestrator Actions (with resolver support)
  /** Resolves data and opens a root popover. */
  openRootWithResolver: (
    keyOrName: string,
    anchorEvent: { currentTarget: HTMLElement; stopPropagation: () => void },
    ownerIdOverride?: string
  ) => Promise<void>
  /** Resolves data and opens a nested popover from a source parent popover key. */
  openNestedWithResolver: (
    keyOrName: string,
    sourceKey: string,
    triggerRect?: DOMRect
  ) => Promise<void>
}

export type PopoverStore<TData = any, TContext = any> = PopoverStateData<TData, TContext> &
  PopoverActions<TData, TContext> & {
    actions: Omit<
      PopoverActions<TData, TContext>,
      'setContext' | 'setOwnerId' | 'openRoot' | 'pushNested'
    >
  }
```

---

## 3. Core Store Design (`store.ts`)

The Zustand store is initialized via a factory function that accepts the optional default resolver and default context. It implements pure state transition helpers for array manipulation, z-index calculation, and offset cleaning.

### Key Logic & Pure Helpers
1. **Descendant Tracking**:
   To bring a popover to the front, we recursively find all descendants (child trails) spawned by its key and move them together to the front of the `zIndexOrder` array to maintain visual hierarchy.
2. **State Cleanup**:
   Closing a popover triggers a cleanup patch that automatically prunes `offsets`, `pinnedStates`, and `nestedHydrationRequestCounters` to prevent memory leaks or dangling state.
3. **Race Condition Prevention**:
   Every lazy resolution has an associated unique request counter. If another action runs before an async resolution finishes, the request counter is incremented, and the old request's callback is discarded.

---

## 4. Context & Provider (`context.tsx`)

We use React Context to expose the store. The `PopoverProvider` instantiates the store once using `useState` and injects the resolver and initial context:

```tsx
export interface PopoverProviderProps<TData = any, TContext = any> {
  children: React.ReactNode
  resolveData: PopoverResolver<TData, TContext>
  initialContext?: TContext
}
```

---

## 5. Hook Details (`hooks/`)

### `useGeometry.ts`
Monitors size changes using a standard `ResizeObserver` on the target popover reference:
* Computes the base layout coordinates using a collision-detection utility.
* Corrects positioning to prevent clipping at viewport borders.
* Adapts dynamically when the window resizes or coordinates change.

### `useDragAndDrop.ts`
Extracts translation offsets (`x`, `y`) and calculates movement velocity:
* Computes horizontal acceleration to output a rotation angle `rotation` bounded within a small range (e.g. `[-4deg, 4deg]`).
* Allows developers to apply `transform: translate(x, y) rotate(rotation)` for standard, premium feel.

---

## 6. Implementation Steps & Verification Plan

### Implementation Steps
1. Create `types.ts` defining all generic structures.
2. Create `store.ts` implementing the Zustand factory.
3. Create `context.tsx` with React context and base selectors.
4. Implement positioning mathematics in `utils/layout.ts`.
5. Implement `useGeometry.ts` and `useDragAndDrop.ts`.
6. Bind public exports in `index.ts`.
7. Clean up `App.tsx` to mount a basic generic playground demonstrating nesting, dragging, and dynamic loading.

### Verification Plan
* Validate build via `npm run build` to confirm zero TypeScript compilation errors and correct code structure.
* Perform manual verification on the playground UI.

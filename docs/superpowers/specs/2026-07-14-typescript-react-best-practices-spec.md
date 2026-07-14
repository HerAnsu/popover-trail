# Design Specification: TypeScript & React Best Practices Audit and Optimizations

This document outlines the detailed design of improvements for TypeScript type safety, React rendering performance, and DOM interaction correctness based on Vercel React Best Practices and TypeScript Pro guidelines.

---

## 1. Technical Audit Findings & Solutions

### 1.1 Shift Generic Defaults from `any` to `unknown`
* **Problem**: Defaults like `TData = any` and `TContext = any` propagate unsafe type checks, allowing consumers to read arbitrary properties on popover nodes without proper verification.
* **Solution**: Replace default generic type parameters with `unknown` across all types, stores, context hooks, and provider props.
* **Example**:
  ```typescript
  export interface TrailEntry<TData = unknown> { ... }
  ```

### 1.2 Eliminate Render-Phase DOM Queries
* **Problem**: Evaluating the boundary selector function (`localCollision?.boundary()`) in the render phase of `usePopoverGeometry` can cause layout thrashing, reference errors, and missing elements since the target DOM container may not be mounted yet.
* **Solution**: Move the evaluation of the lazy-getter boundary function into a `useEffect` callback, storing the resolved element in a local state.

### 1.3 Stabilize Inline Option Literals
* **Problem**: Passing inline options object literals (e.g. `{ collision: { padding: 10 } }`) directly to `usePopoverTrigger` causes `useCallback` dependency changes, recreating the `onClick` handler and returning a new trigger prop reference on every single render.
* **Solution**: Capture the options parameter in a mutable `useRef` updated synchronously during render, removing it from the `useCallback` dependencies.

### 1.4 Deduplicate Drag Coordinate State Updates
* **Problem**: Dragging triggers high-frequency offset updates. If dragging triggers state updates with identical coordinates (due to constraints or rounding), it still forces a full React render.
* **Solution**: Check if the target `x` and `y` offsets match current values inside `updateOffset` action and exit early.

### 1.5 Avoid Redundant Floating UI Updates
* **Problem**: Pinned/floating popovers bypass Floating UI's positioning calculations. Calling Floating UI's `update()` on pinned cards is a waste of layout calculation cycles.
* **Solution**: Skip Floating UI `update()` calls inside `usePopoverGeometry` if `isPinned` is `true`.

---

## 2. Code Modifications Plan

### 2.1 Types & Store (`types.ts` & `store.ts`)
* Redefine `isPromise(value: unknown): value is Promise<T>` using `(value as Record<string, unknown>).then`.
* Replace `let parentData: any` with typed `TData | undefined`.
* Apply coordinate equality checks in `updateOffset`.

### 2.2 React Context Hooks (`context.tsx`)
* Sync `initialContext` in `PopoverProvider` safely without `as any`.
* Apply `optionsRef` optimization inside `usePopoverTrigger` and `usePopoverNestedTrigger`.

### 2.3 Geometry Coordinates Hook (`useGeometry.ts`)
* Resolve the lazy boundary element safely inside `useEffect` and skip calling `update()` if `isPinned` is active.

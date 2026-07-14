# Design Specification: ComposedPath Click-Outside & Drag Render Bottleneck Elimination

This document specifies the design and implementation details for resolving detached DOM element click-outside closures and eliminating parent re-render cascades during drag-and-drop.

---

## 1. Technical Audit & Solutions

### 1.1 Detached Element Click-Outside Bug (`context.tsx`)
*   **Problem**: In React apps, clicking an element that immediately unmounts (e.g., tab toggles, delete buttons, close icons) detaches that element from the DOM tree. The standard `element.closest()` traversal fails on detached nodes because they no longer have parent elements. This leads to a false-positive click-outside trigger, closing the active popover trail unexpectedly.
*   **Solution**: Use `e.composedPath()` in the click listener. `composedPath()` returns the exact list of elements the event bubbled through, preserving the ancestry chain even if the target node is detached.
*   **Implementation**:
    ```typescript
    const path = e.composedPath ? e.composedPath() : [];
    const clickedInside = path.some((el) => {
      if (el instanceof HTMLElement) {
        return el.matches(popoverSelector) || (ignoreClass && el.classList.contains(ignoreClass));
      }
      return false;
    });
    if (clickedInside) return;
    ```

### 1.2 Drag Render Bottleneck in Canvas (`App.tsx` & `context.tsx`)
*   **Problem**: `PopoverCanvas` is the parent component container that maps over all active popover cards. Currently, it calls `usePopoverOffsets()` to retrieve the coordinates map. Because coordinates update rapidly on every single pixel dragged, this hook forces `PopoverCanvas` to re-render on every frame. Consequently, **every single card on the screen is forced to re-render during dragging**, even if only one card is moving.
*   **Solution**: Remove `usePopoverOffsets()` subscription from `PopoverCanvas`. Create a lightweight `usePopoverStoreApi` hook to retrieve the imperative store instance. Read current offset coordinates imperatively in the `handleDragEnd` callback via `store.getState().offsets[key]`, isolating rendering updates strictly to the card being dragged.

---

## 2. API & Exports Changes

### 2.1 Context exports (`context.tsx` & `index.ts`)
We add a public `usePopoverStoreApi` hook to query the Zustand vanilla store reference:

```typescript
export function usePopoverStoreApi<TData = any, TContext = any>() {
  const store = useContext(PopoverStoreContext);
  if (!store) {
    throw new Error("usePopoverStoreApi must be used within a PopoverProvider");
  }
  return store as StoreApi<PopoverStore<TData, TContext>>;
}
```
We export it in `src/lib/popover/index.ts`.

# Design Specification: Target Closing, BFS Queue Performance, Anti-Blur Styling, and API exports

This document specifies the design and implementation details for target closing (`closeByKey`), $O(N)$ BFS performance improvements, anti-blur rendering, and public API exports in the popover library.

---

## 1. API Changes & Specifications

### 1.1 Action `closeByKey(key)`
We add a targeted closing action `closeByKey` to `PopoverActions` in `src/lib/popover/types.ts`:

```typescript
export interface PopoverActions<TData = any, TContext = any> {
  // ...
  /** Closes exactly the popover matching the specified key along with all its descendants. */
  closeByKey: (key: string) => void;
}
```

In `store.ts`, `closeByKey` will find the index of the key in `floating` or `trail`, and call the internal `closeFromState` logic:
```typescript
      closeByKey: (key) => {
        const { floating, trail } = get();
        const index = findEntryIndex(floating, trail, key);
        if (index !== -1) {
          actions.closeFrom(index);
        }
      }
```

### 1.2 BFS Queue Performance optimization (`store.ts`)
Instead of shifting elements from the queue array in `getAllDescendants`, we use a head pointer:
```typescript
  let head = 0;
  while (head < queue.length) {
    const current = queue[head++];
    // ... BFS step logic ...
  }
```

### 1.3 Anti-Blur Layout styles (`src/lib/popover/utils/styles.ts`)
We round coordinates inside `getPopoverStyles` to avoid sub-pixel blurring:
```typescript
  const translateX = Math.round(dragX + offset.x);
  const translateY = Math.round(dragY + offset.y);

  return {
    position: "absolute",
    top: Math.round(finalLayoutPos.top),
    left: Math.round(finalLayoutPos.left),
    transform: `translate(${translateX}px, ${translateY}px) rotate(${rotation}deg)`,
    willChange: "transform",
    zIndex,
  };
```

### 1.4 Exports in index.ts
We add `usePopoverNestedTrigger` export to the main entry point:
```typescript
export {
  PopoverProvider,
  // ...
  usePopoverTrigger,
  usePopoverNestedTrigger,
} from "./context";
```

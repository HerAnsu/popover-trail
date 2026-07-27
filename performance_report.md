Findings for State Management Performance:
- `updateEntryInLists` uses array mapping `floating.map(e => ...)` and `trail.map(e => ...)` which creates new arrays on every call, even for small property updates. This is a common bottleneck when updates are frequent (e.g., during animations or drag).
- `isDeepEqual` is called during React Context dispatches (`store.ts`) for `collisionConfig` and `buttonControls`, which could cause CPU spikes if configs are large, though they typically are not.
- `getActiveKeys` creates a `Set` by iterating over `floating` and `trail` every time a component brings an element to front.
- `hasEntryWithKey` uses `some` which is $O(N)$ for both lists. When scaled to large trailing systems, it may cause minor slowdowns.
Recommendations:
- Transition to `immer` for the Zustand store. By applying `mutative` or `immer`, we eliminate manual array mapping in `updateEntryInLists`, leading to simpler and potentially faster state mutations (avoiding full copies of the unmodified trailing popovers).
- Replace `.find()` and `.some()` lookups with an auxiliary Map or object index `entryMap: Record<string, TrailEntry>` maintained in Zustand to provide $O(1)$ lookups for `findEntryInStore` and `hasEntryWithKey`.
Findings for React Hooks Performance:
- In `useGeometry`, `finalLayoutPos` depends on `getViewportBounds()` which is evaluated inside the `useMemo` block but is NOT a reactive dependency. This is intentional (since resizing triggers `isMobileViewport`), but it runs heavily. More importantly, it uses `spatialTree` collision detection logic right inside a React render-phase hook `useMemo`. `spatialTree` is recreated/inserted into frequently, which is $O(N \log N)$ and can cause slow renders when multiple popovers are open simultaneously.
- `useEventListener` is correctly memoized in `checkMobile`, avoiding unnecessary attaching/detaching of DOM event listeners.
- Context provider values: `useCallback` and `useMemo` are aggressively and correctly used across `context.tsx` for dispatch functions (`close`, `pin`, `bringToFront`).
- In `useGeometry`, the `middleware` dependency array contains objects like `flipOption` and `shiftOption`. If consumers pass inline objects (e.g., `shiftOption={{ padding: 5 }}`), this will break memoization and trigger re-calculations of `@floating-ui/react` geometry continuously.
Findings for `useDragAndDrop` Performance:
- Good: It batches state (`useState({ rotation: 0, rotationX: 0, rotationY: 0 })`) instead of using 3 separate atomic `useState` calls which prevents 3 separate renders per frame.
- Good: `requestAnimationFrame` loop handles the velocity math without tying to `transform` dependency, so we don't trigger `useEffect` setup/teardowns on every sub-pixel drag move.
- Bad: `setTilt(curr)` is called on *every single frame* (`requestAnimationFrame`) while dragging, even if `isDeepEqual(prev, curr)` would be true. Since `rotationZ/X/Y` evaluates out to tiny decimals from spring math, they almost never settle to 0 exactly while dragging. When `tiltDecay` kicks in after drag drops, `setTilt` continues dispatching for several frames while values asymptote to 0. We can optimize this by applying a lower bound threshold `if (Math.abs(diff) < 0.01) setTilt(zero)` to allow React to stop re-rendering.
Findings for `context.tsx` Performance:
- The `PopoverProvider` memoizes its resolver correctly, and uses `useStore` with selectors. However, the Context `value` itself:
  `const value = useMemo(() => ({ store }), [store]);`
  This is solid because the store instance never changes.
- In `usePopoverCard` / context consumers: Subscribing to deep state structures (like `entry = usePopoverStore((state) => findEntryInStore(state.floating, state.trail, key))`) means that *every* popover component re-evaluates the selector whenever *any* popover moves/updates. This breaks atomic rendering.
  *Optimization*: Provide a `usePopoverStore(state => state.trail[index])` or similar specific slice subscription instead of mapping over the entire array for `findEntryInStore`.

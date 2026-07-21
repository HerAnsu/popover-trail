# Guide 5: Stacking, Z-Index & Grouping

Popover Trail calculates visual stacking depth and `z-index` layering dynamically based on popover sequence depth and stack groups.

---

## 1. Z-Index Depth Calculation Formula

For any card, its `z-index` depth is computed as:

$$\text{Final Z-Index} = \text{Base Z-Index} + (\text{Depth Index} \times 10) + (\text{isPinned} ? 50 : 0)$$

* **Anchored Popovers**: Increment by depth step (1000, 1010, 1020, ...).
* **Pinned Floating Cards**: Boosted by an additional +50 offset so pinned cards float visually above anchored cards.

---

## 2. Using `usePopoverZIndex`

Pass `index`, `isPinned`, and an optional `baseZIndex` to `usePopoverZIndex`:

```tsx
import { usePopoverZIndex, type TrailEntry } from 'popover-trail';

export function PopoverCardContainer({ entry, index, isPinned }: { entry: TrailEntry; index: number; isPinned: boolean }) {
  const zIndex = usePopoverZIndex(index, isPinned, 1000);

  return (
    <div style={{ zIndex, position: 'absolute' }} className="popover-card">
      <div>Card Key: {entry.key} (Z-Index: {zIndex})</div>
    </div>
  );
}
```

---

## 3. Technical Nuances: CSS Stacking Context Traps

In modern CSS, certain properties on parent elements create a **new Stacking Context**, causing internal elements to be trapped inside their parent's `z-index` layer regardless of how high their child `z-index` value is set (e.g. `z-index: 99999`).

### CSS Properties That Create Stacking Context Traps

* `transform` or `perspective` not `none`
* `filter` or `backdrop-filter` not `none`
* `contain: paint` or `contain: layout`
* `will-change` specifying any property that creates a stacking context
* `opacity` less than `1`
* `mix-blend-mode` not `normal`

### How Popover Trail Solves Stacking Context Traps

By using `<PopoverPortal>` to render cards directly into `document.body` (or a root-level container element), popover cards escape parent component DOM hierarchies and stacking context traps.

```tsx
// Ensures cards render outside any transformed parent containers
<PopoverPortal container={document.body}>
  {(entries) => entries.map((entry) => <Card key={entry.key} entry={entry} />)}
</PopoverPortal>
```

---

## 4. Detecting Top-Most Card (`useIsPopoverTopMost`)

Use `useIsPopoverTopMost` to check if a specific card is currently on top of the active visual stack. This is useful for highlighting active borders or delegating ESC key events:

```tsx
import { useIsPopoverTopMost } from 'popover-trail';

export function CardHeader({ entryKey }: { entryKey: string }) {
  const isTopMost = useIsPopoverTopMost(entryKey);

  return (
    <header className={`card-header ${isTopMost ? 'active-focus-header' : 'inactive-header'}`}>
      <span>Card: {entryKey}</span>
      {isTopMost && <span className="active-badge">Active Top</span>}
    </header>
  );
}
```

---

## 5. Multi-Zone Stack Groups (`ZIndexBaseMap`)

When building complex UIs (e.g. sidebar vs main canvas vs modal overlays), separate stack zones using `stackGroup` and `ZIndexBaseMap`:

```tsx
import { PopoverProvider, type ZIndexBaseMap } from 'popover-trail';

// Custom base z-index layering per group zone
const stackGroupBases: ZIndexBaseMap = {
  sidebar: 2000,
  canvas: 1000,
  headerBar: 3000,
};

export function App() {
  return (
    <PopoverProvider zIndexBaseMap={stackGroupBases}>
      <MainWorkspace />
    </PopoverProvider>
  );
}
```

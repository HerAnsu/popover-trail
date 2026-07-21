# Guide 2: Draggable Pinning & Canvas Mechanics

Popover Trail allows any popover card to be pinned, detaching it from relative anchor alignment and converting it into an independent, draggable floating canvas window.

---

## 1. Dual-Stack Zustand Store Architecture

The core store maintains state in two separate arrays:

* **`trail`**: Active linear stack of anchor-aligned popovers.
* **`floating`**: Array of pinned cards positioned independently on the viewport.

```
                    ┌─────────────────────────┐
                    │     Popover Store       │
                    └────────────┬────────────┘
                                 │
           ┌─────────────────────┴─────────────────────┐
           ▼                                           ▼
┌─────────────────────┐                     ┌─────────────────────┐
│ trail Array         │                     │ floating Array      │
│ [Card 1, Card 3]    │                     │ [Card 2 (Pinned)]   │
└─────────────────────┘                     └─────────────────────┘
 (Anchored to Trigger)                       (Draggable on Screen)
```

Pinning a card removes it from `trail` and pushes it into `floating`. Unpinning returns it to `trail` at its original hierarchical position.

---

## 2. Implementing Pin Controls

Use `usePopoverCard` to access `handlePinToggle` and `dragHandleProps`:

```tsx
import { usePopoverCard, type TrailEntry } from 'popover-trail';

export function PopoverCardFrame({ entry, index, isPinned }: { entry: TrailEntry; index: number; isPinned: boolean }) {
  const { ref, style, dragHandleProps, handlePinToggle, isDragging } = usePopoverCard({
    entry,
    index,
    isPinned,
    enableDrag: true,
    enableTilt: true,
    maxTiltAngle: 6,
  });

  return (
    <div
      ref={ref}
      style={style}
      className={`popover-card-container ${isPinned ? 'pinned' : 'anchored'} ${isDragging ? 'dragging' : ''}`}
    >
      <header className="drag-handle-bar" {...dragHandleProps}>
        <span className="card-key">{entry.key}</span>
        <button onClick={handlePinToggle} className="pin-toggle-btn">
          {isPinned ? 'Unpin' : 'Pin Window'}
        </button>
      </header>
      <div className="card-body">
        {/* Card content */}
      </div>
    </div>
  );
}
```

---

## 3. Physics Spring Tilt & Inertia Mechanics

When dragging a pinned card, horizontal drag velocity ($\Delta x / \Delta t$) is calculated on every pointer move event. A `requestAnimationFrame` (RAF) loop calculates a spring rotation tilt angle:

```
Tilt Angle = Math.min(Math.max(velocityX * sensitivity, -maxTiltAngle), maxTiltAngle)
```

When the user releases the pointer, the rotation angle decays back to $0^\circ$ smoothly:

$$\text{Angle}_{t} = \text{Angle}_{t-1} \times 0.82$$

The RAF animation loop automatically terminates when the tilt angle drops below $0.05^\circ$, minimizing CPU/GPU cycles.

### Tilt Options Configuration

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enableTilt` | `boolean` | `true` | Toggles velocity spring tilt effect. |
| `maxTiltAngle` | `number` | `5` | Maximum tilt angle constraint in degrees. |
| `tiltSensitivity` | `number` | `8` | Velocity to rotation angle scaling multiplier. |
| `tiltDecay` | `number` | `0.82` | Friction decay coefficient applied per frame on release. |

---

## 4. Technical Nuances & Performance Optimizations

### Sub-Pixel Coordinate Rounding & Blurry Text Fix

When browsers render element positions using fractional pixels (e.g. `left: 104.34px` or `translate3d(104.34px, 205.67px, 0)`), font rendering engines often anti-alias text across sub-pixel boundaries, producing blurry text on non-Retina / 1x DPI displays.

* **Solution in Popover Trail**: All coordinates returned by `usePopoverGeometry` and `usePopoverDragAndDrop` are rounded using `Math.round()` before applying inline CSS styles.
* **GPU Hardware Acceleration**: Transforms use integer-aligned `translate3d(Xpx, Ypx, 0)` to trigger GPU compositing without sub-pixel blur.

```css
/* Recommended CSS for popover card elements */
.popover-card {
  /* Prevent browser sub-pixel font anti-aliasing issues */
  backface-visibility: hidden;
  -webkit-font-smoothing: subpixel-antialiased;
}
```

### Mobile & Touch Pointer Events (`touch-action`)

When using drag-and-drop on mobile touchscreens or tablet devices:

* **Preventing Page Scroll Conflict**: Drag handle elements **must** have the CSS property `touch-action: none;` applied. Without this, touch drag gestures will trigger browser window scrolling instead of dragging the card.

```css
.drag-handle-bar {
  /* Mandatory for touch drag interactions */
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  cursor: grab;
}

.drag-handle-bar:active {
  cursor: grabbing;
}
```

### High-Refresh-Rate Displays (120Hz / 144Hz)

The RAF inertia loop calculates decay based on frame delta timing rather than fixed 60Hz assumptions. This ensures that spring tilt decay speed remains consistent across 60Hz laptop screens, 120Hz ProMotion iPad displays, and 144Hz gaming monitors.

---

## 5. Collision Boundaries & Coordinate Clamping

### Restraining Cards inside Workspace Panels

By default, floating cards are constrained to the browser viewport. You can pass a custom DOM element or getter callback to `collisionBoundary` on `<PopoverProvider>`:

```tsx
export function WorkspaceApp() {
  return (
    <PopoverProvider
      collisionBoundary={() => document.getElementById('designer-canvas')}
    >
      <DesignerCanvas />
    </PopoverProvider>
  );
}
```

### Manual Coordinate Clamping Utility

If you build custom drag handlers, use `clampDragCoordinates`:

```ts
import { clampDragCoordinates } from 'popover-trail';

const clampedPosition = clampDragCoordinates(
  { x: rawX, y: rawY },
  { minX: 10, maxX: window.innerWidth - 320, minY: 10, maxY: window.innerHeight - 200 }
);
```

---

## 6. Pinned Descendant Close Behavior

By default (`closePinnedDescendants: false`), closing a parent popover leaves its pinned children open on the screen as independent floating windows.

To force closing pinned descendants when a parent closes, set `closePinnedDescendants={true}` on `<PopoverProvider>`:

```tsx
<PopoverProvider closePinnedDescendants={true}>
  <App />
</PopoverProvider>
```

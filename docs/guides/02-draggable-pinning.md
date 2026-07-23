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

### Declarative Headless Syntax (`<PopoverCard>`)

The compound component syntax manages drag handles and pin buttons automatically:

```tsx
import { PopoverCard, type TrailEntry } from 'popover-trail';

export function PopoverCardFrame({ entry, index, isPinned }: { entry: TrailEntry; index: number; isPinned: boolean }) {
  return (
    <PopoverCard entry={entry} index={index} isPinned={isPinned} className="popover-card">
      <PopoverCard.Handle className="drag-handle">
        <span className="card-key">{entry.key}</span>
        <PopoverCard.PinButton className="btn-pin" />
        <PopoverCard.CloseButton className="btn-close" />
      </PopoverCard.Handle>

      <PopoverCard.Content className="card-body">
        <p>Card Content</p>
      </PopoverCard.Content>
    </PopoverCard>
  );
}
```

### Low-Level Hook Syntax (`usePopoverCard`)

For complete manual control over DOM refs and event handlers, use `usePopoverCard`:

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

When browsers render element positions using fractional pixels (e.g. `left: 104.34px` or `translate3d(104.34px, 205.67px, 0)`), font rendering engines anti-alias text across sub-pixel boundaries, producing blurry text.

Popover Trail rounds all coordinates (`Math.round`) in `getPopoverStyles` before applying CSS transforms:

```tsx
const top = Math.round(finalLayoutPos.top);
const left = Math.round(finalLayoutPos.left);
const translateX = Math.round(dragX + offset.x);
const translateY = Math.round(dragY + offset.y);
```

### Hardware Compositor Promotion (`willChange: transform`)

During dragging, `willChange: "transform"` is applied to promote popover elements to their own hardware compositor layer.

---

## 5. Canvas Interaction Architecture

When working with floating pinned cards, the library coordinates pointer interactions and layout positioning:
* **Drag Handles**: `<PopoverCard.Handle>` or `{...dragHandleProps}` attach pointer capture handlers, allowing users to drag cards anywhere across the viewport.
* **Pinning Mechanics**: Toggling the pin state transfers the card between anchor-relative positioning and absolute viewport coordinates without resetting card state.
* **Touch Device Support**: `touch-action: none` is automatically applied to drag handle elements to prevent viewport page scrolling during touch dragging.

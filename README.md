# Popover Trail 🪄

Traditional popovers are rigid. Once you click outside, they vanish. If you try to open nested popovers, they get clipped by overflow containers or fight for z-index dominance.

**Popover Trail** changes that. It is a headless, lightweight React library designed for building cascading popover paths (trails). Think of it as a spatial workspace builder: you can open cascading details, pin important ones to the screen to keep them as floating cards, drag them around with velocity-based spring physics, and let them constrain themselves safely inside the viewport.

---

## 🌟 What makes it special?

*   🔗 **Cascading Hierarchies**: Nested popovers are naturally linked to their parents. Closing a parent automatically sweeps away its downstream children.
*   📍 **Pins & Floating Cards**: Users can "pin" a popover to detach it from the linear trail. Pinned popovers become independent, freely draggable cards that stay on the screen.
*   🕹️ **Spring Rotation Physics**: Dragging a pinned card applies realistic velocity-based swing and tilt animations, returning to equilibrium with smooth inertia decay when released.
*   ⚡ **Zero-Flicker Hybrid Caching**: Supports synchronous (in-memory Map) and asynchronous (IndexedDB/API) custom caches. Synchronous cache hits load immediately in the same frame, preventing annoying loading-spinner flicker.
*   🎯 **Collision Boundaries**: Configure boundary constraints (global defaults or local overrides per trigger) with lazy evaluation to keep cards within viewports or specific DOM sections.
*   ⌨️ **Keyboard & Focus Friendly**: consolidation of Escape listeners, WAI-ARIA compliant active element focus capture, and automatic focus restoration on close.
*   🪶 **Headless & Light**: Zero default styles. Duplicated peer dependencies (like `@dnd-kit/core`) are excluded from bundles, keeping the footprint tiny ($<17\text{ KB}$).

---

## 📦 Installation

Install the package:

```bash
npm install popover-trail
```

Make sure you have the required `peerDependencies` installed:

```bash
npm install react react-dom @dnd-kit/core @floating-ui/react zustand
```

---

## 🚀 Quick Start

### 1. Configure the Provider
Wrap your application or dashboard view with `PopoverProvider`. Provide a data resolver callback to lazy-load details on demand.

```tsx
import { PopoverProvider } from 'popover-trail';

// Async resolver fetches data dynamically, supporting signal cancellation
const dataResolver = async (key: string, parentData?: any, context?: any, signal?: AbortSignal) => {
  const res = await fetch(`/api/details/${key}`, { signal });
  if (!res.ok) throw new Error('Failed to fetch details');
  return res.json();
};

export default function App() {
  return (
    <PopoverProvider resolveData={dataResolver}>
      <Workspace />
    </PopoverProvider>
  );
}
```

### 2. Add Triggers using Hooks
Trigger root trails using `usePopoverTrigger`, which binds directly to target buttons using Props Spreading.

```tsx
import { usePopoverTrigger } from 'popover-trail';

export function TriggerButton() {
  // Binds event handlers and targets 'item-blueprint-1'
  const trigger = usePopoverTrigger('item-blueprint-1', {
    collision: { padding: 20 } // Optional local collision override
  });

  return (
    <button className="trigger-btn" {...trigger}>
      🔧 Inspect Blueprint
    </button>
  );
}
```

### 3. Build your Popover Card Component
Use `usePopoverCard` inside your custom card component to automatically inherit coordinates, offset positions, dragging attributes, and spring tilt styles.

```tsx
import { usePopoverCard, usePopoverActions, type TrailEntry } from 'popover-trail';

interface PopoverCardProps {
  entry: TrailEntry;
  index: number;
  isPinned: boolean;
}

export function PopoverCard({ entry, index, isPinned }: PopoverCardProps) {
  const { togglePin, closeByKey, retryPopover } = usePopoverActions();

  const { ref, style, dragHandleProps, isTop, handlePinToggle } = usePopoverCard({
    entry,
    index,
    isPinned,
    placement: 'right-start',
    enableDrag: true,
    enableTilt: true
  });

  return (
    <div ref={ref} style={style} className="popover-card">
      {/* Header serves as the drag handle */}
      <div className="header" {...dragHandleProps}>
        <span>{entry.isLoading ? 'Loading...' : entry.data?.title}</span>
        <div className="actions">
          <button onClick={handlePinToggle}>{isPinned ? '📌' : '📍'}</button>
          <button onClick={() => closeByKey(entry.key)}>✕</button>
        </div>
      </div>

      <div className="body">
        {entry.isLoading && <Spinner />}
        {entry.error && (
          <div className="error">
            <span>{entry.error.message}</span>
            <button onClick={() => retryPopover(entry.key)}>Retry</button>
          </div>
        )}
        {entry.data && (
          <div>
            <p>{entry.data.description}</p>
            {/* Open nested detail card */}
            <NestedTrigger sourceKey={entry.key} nextKey={entry.data.childKey} />
          </div>
        )}
      </div>
    </div>
  );
}

function NestedTrigger({ sourceKey, nextKey }: { sourceKey: string; nextKey: string }) {
  // Nested popovers are linked to their parent source key
  const trigger = usePopoverNestedTrigger(nextKey, sourceKey);
  return <button {...trigger}>See details 🔗</button>;
}
```

### 4. Render the Portal Canvas
Render all active popovers dynamically using a fixed overlay canvas wrapped inside `<PopoverPortal>`:

```tsx
import { usePopoverTrail, usePopoverFloating, PopoverPortal } from 'popover-trail';
import { PopoverCard } from './PopoverCard';

export function PopoverCanvas() {
  const trail = usePopoverTrail();
  const floating = usePopoverFloating();

  return (
    <PopoverPortal>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        {/* Render pinned floating windows */}
        {floating.map((entry, idx) => (
          <div key={entry.key} style={{ pointerEvents: 'auto' }}>
            <PopoverCard entry={entry} index={idx} isPinned={true} />
          </div>
        ))}
        {/* Render linear path trail popovers */}
        {trail.map((entry, idx) => (
          <div key={entry.key} style={{ pointerEvents: 'auto' }}>
            <PopoverCard entry={entry} index={floating.length + idx} isPinned={false} />
          </div>
        ))}
      </div>
    </PopoverPortal>
  );
}
```

---

## 🛠️ Advanced Recipes

### Zero-Flicker Synchronous Cache
Provide a synchronous cache (like a standard JavaScript `Map`) to preserve resolved details. When reopening, the popover will mount instantly in the same tick without displaying a loading spinner.

```tsx
const memoryCache = new Map();

<PopoverProvider resolveData={fetcher} cache={memoryCache}>
  <App />
</PopoverProvider>
```

### Constraining Layout Boundaries
Keep popovers within viewport margins or restrict them inside a specific scrollable container:

```tsx
const layoutConfig = {
  // Constrain popovers inside the main content container
  boundary: () => document.getElementById('workspace-container'),
  padding: 16 // Safety offset margin from boundaries
};

<PopoverProvider resolveData={fetcher} collision={layoutConfig}>
  <App />
</PopoverProvider>
```

---

## ⚙️ Hook Settings (`usePopoverCard`)

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `entry` | `TrailEntry` | *Required* | Popover state node holding data/status. |
| `index` | `number` | *Required* | Stacking depth order index. |
| `isPinned` | `boolean` | *Required* | Whether the popover is in an independent floating state. |
| `placement` | `PopoverPlacement` | `'bottom'` | Relative position boundary placement. |
| `enableDrag` | `boolean` | `true` | Enables layout coordinates dragging when pinned. |
| `enableTilt` | `boolean` | `true` | Enables velocity-based spring rotation tilt. |
| `maxTiltAngle`| `number` | `5` | Maximum rotation tilt angle in degrees. |
| `tiltSensitivity`| `number`| `8` | Sensitivity multiplier of drag velocity. |

---

## 📄 License

MIT License. Designed with ❤️ for building immersive, interactive developer tools and spatial layouts.

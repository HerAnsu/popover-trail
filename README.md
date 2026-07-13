# Popover Trail 🪄

**Popover Trail** is a versatile, headless, and lightweight React library for building cascading popovers (popover trails) with support for infinite nesting, lazy asynchronous data loading, drag-and-drop pinning, and physics-based tilt motion.

## Features 🌟

- 🔗 **Cascading Trails**: Nested popovers are linked to their parents. Closing or updating a parent automatically cleans up all downstream child popovers.
- 📌 **Draggable Pinning**: Popovers can be pinned/unpinned dynamically, detaching them from the cascading trail into independent, freely draggable floating cards (`floating`).
- 🎯 **Smart Positioning**: Collision-aware positioning (shifting, flipping, boundaries) built on top of `@floating-ui/react`.
- 🕹️ **Spring-like Physics**: Smooth drag-and-drop with realistic rotation tilt based on velocity, featuring smooth inertia decay when released.
- 🛡️ **Race Condition Protection**: Requests are tracked using incremental counters, discarding stale async responses when navigating or clicking quickly.
- 🚪 **DOM Portal Integration**: The `<PopoverPortal>` wrapper mounts popovers directly to `document.body` to prevent clipping issues caused by parent `overflow: hidden` CSS rules.
- 🔁 **Built-in Retry Actions**: Instantly retry resolving data for a specific popover on failure using the `retryPopover` action without closing the card.
- ⌨️ **A11y & Mouse Controls**: Focus trapping within active popovers (via `react-focus-lock`), closing the topmost popover on `Escape`, and global click-outside closing config.

---

## Installation 📦

Install the package and its peer dependencies:

```bash
npm install popover-trail
```

Make sure you have the required `peerDependencies` installed in your project:
`react`, `react-dom`, `@dnd-kit/core`, `@floating-ui/react`, `zustand`.

---

## Quick Start 🚀

### 1. Setup the Provider (`PopoverProvider`)

Wrap your application (or popover context area) with `PopoverProvider`, passing the async data resolver function:

```tsx
import { PopoverProvider } from 'popover-trail';

// Async resolver to fetch data for a given key
const fetchDetailsResolver = async (key: string, parentData?: any) => {
  const response = await fetch(`/api/details/${key}`);
  if (!response.ok) throw new Error('Network failure');
  return response.json();
};

export default function App() {
  return (
    <PopoverProvider 
      resolveData={fetchDetailsResolver}
      clickOutside={{ enabled: true, ignoreClass: 'btn-trigger' }}
    >
      <MyWorkspace />
    </PopoverProvider>
  );
}
```

### 2. Bind Triggers (`usePopoverTrigger`)

Use the `usePopoverTrigger` hook to bind a button element to open a root-level popover trail:

```tsx
import { usePopoverTrigger } from 'popover-trail';

export function ActionButton() {
  const triggerProps = usePopoverTrigger('item-sword');

  return (
    <button className="btn-trigger" {...triggerProps}>
      ⚔️ Open Sword Details
    </button>
  );
}
```

### 3. Render the Canvas (`PopoverPortal` + `usePopoverCard`)

Create a canvas overlay to render active popovers. Wrap it with `PopoverPortal` to mount at the document body level:

```tsx
import { 
  usePopoverTrail, 
  usePopoverFloating, 
  usePopoverActions,
  PopoverPortal,
  usePopoverCard 
} from 'popover-trail';
import FocusLock from 'react-focus-lock';

export function PopoverCanvas() {
  const trail = usePopoverTrail();
  const floating = usePopoverFloating();

  return (
    <PopoverPortal>
      {/* Render both pinned (floating) and cascading (trail) popovers */}
      {[...floating, ...trail].map((entry, idx) => (
        <PopoverCard key={entry.key} entry={entry} index={idx} />
      ))}
    </PopoverPortal>
  );
}

function PopoverCard({ entry, index }) {
  const { togglePin, retryPopover } = usePopoverActions();
  const isPinned = entry.parentKey === undefined; // or fetch from pinned state store

  // Retrieve layout coordinates, drag offsets, and rotation tilt styling
  const { 
    ref, 
    style, 
    dragHandleProps, 
    isTopMost, 
    close, 
    openNested 
  } = usePopoverCard({
    entry,
    index,
    isPinned,
    placement: 'bottom',       // Placement layout
    enableDrag: true,          // Allow drag-and-drop when unpinned
    enableTilt: true,          // Enable velocity-based rotation swing
    maxTiltAngle: 8,           // Max swing angle in degrees
    tiltSensitivity: 10,       // Swing sensitivity multiplier
  });

  return (
    <div ref={ref} style={style} className="popover-card">
      <FocusLock returnFocus disabled={!isTopMost}>
        {/* Header acts as drag handle */}
        <div className="popover-header" {...dragHandleProps}>
          <span>{entry.key}</span>
          <button onClick={() => togglePin(entry.key)}>📌</button>
          <button onClick={close}>❌</button>
        </div>

        {/* Card Body */}
        <div className="popover-body">
          {entry.isLoading && <div className="loader">Loading...</div>}
          
          {entry.error && (
            <div className="error-zone">
              <p>Failed to resolve details.</p>
              <button onClick={() => retryPopover(entry.key)}>Retry</button>
            </div>
          )}

          {entry.data && (
            <div>
              <h3>{entry.data.title}</h3>
              <p>{entry.data.description}</p>
              
              {/* Trigger nested child popover */}
              <button onClick={(e) => openNested('child-element-key', e)}>
                View Child Elements
              </button>
            </div>
          )}
        </div>
      </FocusLock>
    </div>
  );
}
```

---

## Styling (CSS, SCSS, Tailwind) 🎨

Because Popover Trail is a headless library, it doesn't force any CSS on you. You can style the cards using any utility classes or preprocessors.

### TailwindCSS Example:

You can combine it with `clsx` for dynamic responsive states:

```tsx
import clsx from 'clsx';

function PopoverCard({ entry, index }) {
  const { ref, style, isTopMost } = usePopoverCard({ entry, index, isPinned: false });

  return (
    <div 
      ref={ref} 
      style={style} 
      className={clsx(
        "absolute rounded-xl shadow-2xl p-4 bg-slate-900 border text-white transition-shadow duration-300",
        isTopMost ? "border-indigo-500 shadow-indigo-500/20" : "border-slate-800"
      )}
    >
      {/* Content */}
    </div>
  );
}
```

---

## Hook Configuration Options (`usePopoverCard`) ⚙️

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `entry` | `TrailEntry` | *Required* | Popover state entry object. |
| `index` | `number` | *Required* | Current virtual stack index (used for z-index ordering). |
| `isPinned` | `boolean` | *Required* | Indicates if the card is pinned (independent floating state). |
| `placement` | `PopoverPlacement` | `'bottom'` | Base positioning alignment relative to trigger. |
| `enableDrag` | `boolean` | `true` | Enables draggable physics when pinned. |
| `enableTilt` | `boolean` | `true` | Enables spring-like rotation tilt. |
| `maxTiltAngle`| `number` | `5` | Maximum rotation angle in degrees. |
| `tiltSensitivity`| `number` | `8` | Physics sensitivity multiplier. |

---

## License 📄

MIT License. Crafted with ❤️ for rich and interactive user experiences.

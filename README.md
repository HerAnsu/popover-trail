# popover-trail

[![npm version](https://img.shields.io/npm/v/popover-trail.svg)](https://www.npmjs.com/package/popover-trail)
[![license](https://img.shields.io/npm/l/popover-trail.svg)](LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/popover-trail.svg)](https://bundlephobia.com/package/popover-trail)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)

Headless React 19 library for stateful popover trees, cascading navigation cards, draggable canvas windows, and background Web Worker data hydration.

Unpinned popovers form a linear cascading trail (`trail`). Pinning a card detaches it into an independent floating canvas window (`floating`) with pointer drag tracking and spring velocity tilt physics.

---

## Features

- **Stateful Cascading Trees**: Automatic parent-child breadcrumb tracking with BFS stack teardown.
- **Draggable Canvas Pinning**: Pin cards into floating windows with physics velocity tilt.
- **Zero-GC Performance Math**: RingBuffer pre-allocation, QuadTree spatial queries, and fast pixel rounding.
- **Prototype Pollution Security**: Module-level frozen key guards (`__proto__`, `constructor`, `prototype`).
- **Web Worker RPC Hydration**: Offload data resolution to background threads for smooth 60–120 FPS UI.
- **Multi-Tab Sync**: Synchronize state actions across browser tabs via `BroadcastChannel`.
- **Strict Type Safety**: Schema builder with generic type inference for keys, payloads, and contexts.

---

## Installation

```bash
npm install popover-trail @floating-ui/react zustand
# Optional: Drag-and-Drop & Focus Locking
npm install @dnd-kit/core react-focus-lock
```

---

## Quick Start

### Schema-Driven Popover Trail

```tsx
import React from 'react';
import {
  createPopoverTrail,
  PopoverCard,
  PopoverTrail,
  isResolvedEntry,
} from 'popover-trail';

// 1. Create typed schema definition
export const trail = createPopoverTrail({
  userCard: {
    resolver: async (key) => fetch(`/api/users/${key}`).then((r) => r.json()),
    placement: 'right',
  },
  detailsCard: {
    resolver: async (key) => fetch(`/api/details/${key}`).then((r) => r.json()),
    placement: 'bottom',
  },
});

// 2. Render application container
export function App() {
  return (
    <trail.PopoverProvider>
      <div className="workspace">
        <trail.PopoverTrigger popoverKey="userCard">
          <button type="button">Hover or Click User</button>
        </trail.PopoverTrigger>

        <PopoverTrail
          renderCard={(entry, index, isPinned) => (
            <PopoverCard key={entry.key} entry={entry} index={index} isPinned={isPinned}>
              {isResolvedEntry(entry) && (
                <div>
                  <h3>{entry.data.name}</h3>
                  <p>{entry.data.email}</p>
                </div>
              )}
            </PopoverCard>
          )}
        />
      </div>
    </trail.PopoverProvider>
  );
}
```

---

## Architecture & Patterns

### State Model & FSM Engine

State transitions are controlled by a deterministic Finite State Machine (FSM) backed by an isolated Zustand store:

```
[Idle] ---> (OPEN_ROOT) ---> [Hydrating] ---> (RESOLVE_SUCCESS) ---> [Resolved.Trailing]
                                   |                                        |
                            (RESOLVE_FAILURE)                          (TOGGLE_PIN)
                                   v                                        v
                                [Error]                            [Resolved.Pinned]
```

### Result Pattern (`Result<T, E>`)

Data resolution handles errors cleanly using Railway-Oriented Programming:

```typescript
import { Ok, Err, isOk, type Result } from 'popover-trail';

function processResult(res: Result<UserData, PopoverError>) {
  if (isOk(res)) {
    console.log('Resolved user:', res.data.name);
  } else {
    console.error('Resolution failed:', res.error.message);
  }
}
```

---

## API Reference

### Primary Components

| Component | Description |
| :--- | :--- |
| `<PopoverProvider>` | Top-level React context container backing Zustand store and state tree. |
| `<PopoverTrail>` | Cascading container rendering trailing cards and pinned floating windows. |
| `<PopoverCard>` | Individual popover card container with header, handles, pin, and close buttons. |
| `<PopoverTrigger>` | Interactive trigger wrapper anchoring popover cards on click/hover. |
| `<PopoverPortal>` | Portal wrapper embedding popover cards directly into DOM document body. |

### Primary Hooks

| Hook | Returns | Purpose |
| :--- | :--- | :--- |
| `usePopover(key)` | `{ entry, isOpen, isPinned, open, close, togglePin }` | Complete reactive control interface for a single popover key. |
| `usePopoverActions()` | `PopoverActions` | Imperative dispatcher methods (`closeByKey`, `closeAll`, `togglePin`). |
| `usePopoverOffsets()` | `Record<string, { x, y }>` | Granular coordinate offsets for all active popovers. |
| `usePopoverContext()` | `TContext` | Shared context object defined at provider scope. |
| `usePopoverDragAndDrop()` | `UsePopoverDragAndDropResult` | Physics velocity spring tilt angles and drag coordinates. |

---

## Development Commands

```bash
npm run build:lib    # Build ESM, CJS, and DTS distribution bundles via tsup
npm test             # Run Vitest test suite (441 tests across 79 suites)
npm run typecheck    # Validate TypeScript type declarations via tsc --noEmit
npm run lint         # Execute Oxlint static code analysis
npm run check:pub    # Verify package export compliance via publint
```

---

## License

[MIT](LICENSE)

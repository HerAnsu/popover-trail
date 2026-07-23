# Popover Trail: Feature Guides & Developer Manuals

Technical manuals and developer guides for `popover-trail`.

---

## Guide Index

| Guide | Description | Key Topics |
| :--- | :--- | :--- |
| **[1. Cascading Popover Paths](01-cascading-paths.md)** | Managing linear tree stacks, parent-child relationships, event propagation, and automatic request cancellation. | Tree Traversal, BFS Unmounting, `<PopoverCard>`, `AbortController` Signal |
| **[2. Draggable Pinning & Canvas Mechanics](02-draggable-pinning.md)** | Transitioning popovers to floating viewport cards with drag interactions, spring physics, and sub-pixel blur fixes. | Dual-Stack Store, RAF Spring Tilt, Sub-Pixel Blur Fix, `<PopoverCard.Handle>` |
| **[3. Async Data Hydration & Caching](03-data-hydration.md)** | Asynchronous data loading, TTL caching, session clearing, and Web Worker offloading. | Synchronous Hydration, `SimplePopoverCache`, `createWorkerResolver` |
| **[4. Hover Triggers & Delay Buffers](04-hover-triggers.md)** | Configuring hover triggers with open/close delay buffers and cursor path tracking. | Hover Delays, Interactivity Buffers, `closeOnMouseLeave` |
| **[5. Stacking, Z-Index & Grouping](05-stacking-zindex.md)** | Managing z-index depth, CSS stacking context gotchas, multi-zone groups, and top-most card activation. | `usePopoverZIndex`, `useIsPopoverTopMost`, Stacking Context Traps |
| **[6. Imperative External Controller](06-imperative-controller.md)** | Controlling popover state outside React rendering loops from WebSockets, Redux, or DOM events. | `createPopoverController`, Event Bus Integration, Off-Tree State |
| **[7. Isolated Scoped Instances](07-scoped-instances.md)** | Creating independent, type-safe popover subsystems for separate app zones. | `createPopoverTrail`, Multi-Tree Setup, Custom Schema |
| **[8. Accessibility & Focus Locking](08-accessibility-focus.md)** | WAI-ARIA compliance, focus trapping, keyboard shortcuts, and scroll locking. | Focus Lock, ARIA Attributes, `keyboardShortcuts` Map |
| **[9. Library Development & Testing](09-library-development-testing.md)** | Library developer scripts, Vitest unit testing, Oxlint, Tsup bundler, and TypeScript 7 setup. | Vitest Mocks, Tsup, Oxlint, Oxfmt, TypeScript 7 |

---

## Quick Reference Links

* **[API Reference](../API.md)**: Full TypeScript signatures, parameter tables, and return values for all exported items.
* **[Project README](../../README.md)**: Architecture specification, quick start examples, and component overview.

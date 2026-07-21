# Popover Trail: Feature Guides & Manuals

Welcome to the feature guides for `popover-trail`. These manuals provide deep architectural explanations, step-by-step integration recipes, performance advice, technical nuances, and edge-case handling for building complex popover workflows in React 19 applications.

---

## Guide Index

| Guide | Description | Key Topics |
| :--- | :--- | :--- |
| **[1. Cascading Popover Paths](01-cascading-paths.md)** | Managing linear tree stacks, parent-child relationships, event propagation, and automatic request cancellation. | Tree Traversal, BFS Unmounting, `AbortController` Signal, React Portals |
| **[2. Draggable Pinning & Canvas Mechanics](02-draggable-pinning.md)** | Transitioning popovers to floating viewport cards with drag interactions, spring physics, and mobile gestures. | Dual-Stack Store, RAF Spring Tilt, Sub-Pixel Blur Fix, `touch-action` |
| **[3. Async Data Hydration & Caching](03-data-hydration.md)** | Asynchronous data loading, TTL caching, session clearing, and Web Worker offloading. | Synchronous Hydration, `SimplePopoverCache`, Worker Fallbacks |
| **[4. Hover Triggers & Delay Buffers](04-hover-triggers.md)** | Configuring hover triggers with open/close delay buffers and cursor path tracking. | Hover Delays, Interactivity Buffers, `closeOnMouseLeave` |
| **[5. Stacking, Z-Index & Grouping](05-stacking-zindex.md)** | Managing z-index depth, CSS stacking context gotchas, multi-zone groups, and top-most card activation. | `usePopoverZIndex`, `useIsPopoverTopMost`, Stacking Traps |
| **[6. Imperative External Controller](06-imperative-controller.md)** | Controlling popover state outside React rendering loops from WebSockets, Redux, or DOM events. | `createPopoverController`, Event Bus Integration, Off-Tree State |
| **[7. Isolated Scoped Instances](07-scoped-instances.md)** | Creating independent, type-safe popover subsystems for separate app zones. | `createPopoverTrail`, Multi-Tree Setup, Custom Schema |
| **[8. Accessibility & Focus Locking](08-accessibility-focus.md)** | WAI-ARIA compliance, focus trapping, keyboard shortcuts, and scroll locking. | Focus Lock, ARIA Attributes, Keyboard Handler Map |
| **[9. SSR, Testing & Debugging](09-ssr-testing-debugging.md)** | Next.js / SSR hydration strategies, unit testing with Vitest & React Testing Library, and debugging. | SSR Portals, Vitest Mocks, Debug Panel |
| **[10. Responsive Modes, Animations & UI Slots](10-responsive-animations-slots.md)** | Bottom Sheets, Modals, CSS entry/exit animation hooks, and custom UI component slot overrides. | `responsiveMode`, CSS Keyframes, `PopoverSlotComponents` |
| **[11. Performance & Advanced Types](11-performance-types-benchmarks.md)** | Re-render optimization with granular selectors, TypeScript discriminated unions, and memory benchmarks. | Granular Selectors, `isResolvedEntry`, Branded Keys |
| **[12. RTL Layouts, Security & i18n](12-rtl-security-i18n.md)** | Right-to-Left writing direction support, XSS prevention, DOMPurify sanitization, and CSP headers. | RTL Placement Fills, XSS Sanitization, CSP `unsafe-inline` |
| **[13. Virtualization & Multi-Tab State Sync](13-virtualization-multitab-sync.md)** | Virtualizing massive popover card lists and cross-tab window synchronization via BroadcastChannel. | `@tanstack/react-virtual`, `BroadcastChannel`, Multi-Window Sync |

---

## Quick Reference Links

* **[API Reference](../API.md)**: Full TypeScript signatures, parameter tables, and return values for all exported items.
* **[Project README](../../README.md)**: Installation, architecture overview, and quick start example.

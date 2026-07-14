# Design Specification: Synchronous Resolver Error Gating, React.memo Isolation, and A11y/Retry Enhancements

This document specifies the design details for preventing synchronous resolver crashes, isolating popover card re-renders, and enhancing WAI-ARIA accessibility and error-retry interactions in the demo UI.

---

## 1. Technical Audit & Solutions

### 1.1 Synchronous Resolver Crash Prevention (`store.ts`)
*   **Problem**: If the user-supplied `resolveData` callback throws an error synchronously (e.g., initial validation checks or immediate exceptions), it executes outside of the async try/catch wrapper in `openRootWithResolver`, `openNestedWithResolver`, and `retryPopover`. This causes the application to crash.
*   **Solution**: Wrap the `resolveData(...)` invocation itself in a synchronous try/catch block. If an error is caught, immediately instantiate the target popover in an error state (`isLoading: false`, `error: errorObj`) and abort further processing.

### 1.2 Cascading Re-render Prevention via `React.memo` (`App.tsx`)
*   **Problem**: In `PopoverCanvas`, we render all active popovers. If a single popover starts or finishes loading, the parent canvas re-renders. Since `PopoverCard` is not memoized, all cards execute their render function.
*   **Solution**: Wrap `PopoverCard` in `React.memo` so that only the card whose data actually changed is re-rendered.

### 1.3 WAI-ARIA Accessibility & Retry UI (`App.tsx`)
*   **Problem**: Pinned/floating dialogs lack semantic linkages for accessibility, and the library's `retryPopover` action is not represented in the demo interface.
*   **Solution**:
    *   Add `aria-labelledby={`title-${entry.key}`}` to the popover card outer container, referencing the card header's title span.
    *   Render a styled "Retry" button when `entry.error` is present, calling `actions.retryPopover(entry.key)`.

---

## 2. Implementation Steps

### 2.1 Zustand Store (`store.ts`)
*   Wrap `resolveData(...)` in `try/catch` blocks inside:
    *   `openRootWithResolver`
    *   `openNestedWithResolver`
    *   `retryPopover`

### 2.2 Demo UI (`App.tsx`)
*   Wrap `PopoverCard` with `React.memo` from React.
*   Add `aria-labelledby` attributes.
*   Add "Retry" button under error displays.

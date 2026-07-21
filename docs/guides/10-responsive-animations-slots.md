# Guide 10: Responsive Modes, Animations & UI Slots

Popover Trail provides responsive layout transformations (Bottom Sheets, Modals), CSS entry/exit animation hooks, and customizable UI component slots.

---

## 1. Responsive Layout Transformations (`responsiveMode`)

On small mobile viewports or touch devices, standard floating popovers can feel cramped or get cut off by screen edges. Popover Trail supports adaptive responsive modes:

```tsx
import { usePopoverTrigger } from 'popover-trail';

export function ResponsiveItemTrigger({ itemId }: { itemId: string }) {
  const triggerProps = usePopoverTrigger(`item-${itemId}`, {
    // Automatically transforms into a Bottom Sheet on mobile viewports (< 768px)
    responsiveMode: 'auto',
  });

  return <button {...triggerProps}>Inspect Item #{itemId}</button>;
}
```

### Responsive Modes Overview

| Mode | Mobile Behavior (< 768px) | Desktop Behavior (>= 768px) |
| :--- | :--- | :--- |
| `'auto'` | Transforms to `'bottom-sheet'` | Standard anchor-aligned `'popover'` |
| `'popover'` | Standard anchor-aligned popover | Standard anchor-aligned popover |
| `'bottom-sheet'` | Docked to bottom edge with drag handle | Docked to bottom edge |
| `'modal'` | Centered overlay dialog with backdrop | Centered overlay dialog |

---

## 2. CSS Animations & Exit Transitions

Popover Trail manages mounting and unmounting lifecycle phases (`'mounting' | 'mounted' | 'unmounting'`) so exit animations complete smoothly before elements are removed from the DOM.

### Configuring CSS Animation Classes

Pass animation class names and exit duration to `usePopoverCard` or trigger options:

```tsx
const triggerProps = usePopoverTrigger('animated-card-1', {
  exitTransitionDuration: 250, // Match CSS animation-duration (250ms)
  mountingClassName: 'popover-enter',
  mountedClassName: 'popover-active',
  unmountingClassName: 'popover-exit',
});
```

### Vanilla CSS Animation Styles

```css
/* Entry Animation */
.popover-enter {
  animation: popoverFadeIn 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Exit Animation */
.popover-exit {
  animation: popoverFadeOut 250ms cubic-bezier(0.7, 0, 0.84, 0) forwards;
}

@keyframes popoverFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes popoverFadeOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}
```

---

## 3. UI Component Slots (`PopoverSlotComponents`)

Customize default controls (Pin buttons, Close buttons, Loading spinners, Error fallbacks) globally at the `<PopoverProvider>` level:

```tsx
import { PopoverProvider, type PopoverSlotComponents } from 'popover-trail';

// Custom UI Components
const customSlots: PopoverSlotComponents = {
  PinButton: ({ isPinned, onClick }) => (
    <button onClick={onClick} className="custom-pin-btn">
      {isPinned ? '📌 Pinned' : '📍 Pin'}
    </button>
  ),
  CloseButton: ({ onClick }) => (
    <button onClick={onClick} className="custom-close-btn" aria-label="Close">
      ✕
    </button>
  ),
  LoadingSpinner: () => (
    <div className="custom-spinner">
      <div className="spinner-ring" />
      <span>Fetching node data...</span>
    </div>
  ),
  ErrorFallback: ({ error, onRetry }) => (
    <div className="custom-error-banner">
      <p>Error: {error.message}</p>
      <button onClick={onRetry}>Try Again</button>
    </div>
  ),
};

export function App() {
  return (
    <PopoverProvider slotComponents={customSlots}>
      <Workspace />
    </PopoverProvider>
  );
}
```

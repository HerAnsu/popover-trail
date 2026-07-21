# Guide 8: Accessibility & Focus Locking

Popover Trail provides accessibility attributes (WAI-ARIA), focus trapping (Focus Lock), scroll locking, and keyboard shortcut handler maps.

---

## 1. WAI-ARIA Compliance

Trigger hooks (`usePopoverTrigger`, `<PopoverTrigger>`) attach accessibility attributes automatically:

* **`aria-expanded`**: Evaluates to `true` when the popover card is open.
* **`aria-haspopup`**: Set to `"dialog"` to inform screen readers of dialog content.
* **`aria-describedby`**: Linked when `ariaDescribedby` option is specified.

```tsx
// Output rendered button element:
// <button aria-expanded="true" aria-haspopup="dialog" aria-describedby="desc-item-1">Inspect</button>
<PopoverTrigger popoverKey="item-1" ariaDescribedby="desc-item-1">
  <button>Inspect</button>
</PopoverTrigger>
```

---

## 2. Focus Locking (Focus Trapping)

To trap keyboard focus inside an active popover card (ideal for modal-like popovers), pass `focusLockOptions`:

```tsx
const triggerProps = usePopoverTrigger('modal-popover-1', {
  focusLockOptions: {
    enabled: true,              // Enable focus trap inside popover
    returnFocus: true,          // Restore focus to trigger button on close
    lockScroll: true,           // Prevent body background scrolling
    autoFocusElement: '#input', // Selector or function returning element to focus
  },
});
```

### Options Breakdown (`FocusLockOptions`)

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enabled` | `boolean` | `false` | Enables focus lock (focus trapping) inside the card. |
| `returnFocus` | `boolean` | `true` | Restores focus to the element that held focus before opening. |
| `lockScroll` | `boolean` | `false` | Prevents scrolling on `document.body` while active. |
| `autoFocusElement` | `string \| (() => HTMLElement)` | `undefined` | Target element to receive initial focus upon mount. |

---

## 3. Keyboard Shortcuts Map (`keyboardShortcuts`)

Pass custom keyboard action handlers per popover card:

```tsx
const triggerProps = usePopoverTrigger('card-shortcut-demo', {
  keyboardShortcuts: {
    Escape: (key) => actions.closeByKey(key),
    'Ctrl+p': (key) => actions.togglePin(key),
    'Alt+r': (key) => actions.retryPopover(key),
  },
});
```

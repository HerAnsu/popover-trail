# Guide 8: Accessibility & Focus Locking

Popover Trail provides accessibility attributes (WAI-ARIA), focus trapping (Focus Lock), scroll locking, and keyboard shortcut handler maps.

---

## 1. WAI-ARIA Compliance

Triggers and cards attach accessibility attributes automatically:

* **`aria-expanded`**: Evaluates to `true` when the popover card is open.
* **`aria-haspopup`**: Set to `"dialog"` to inform screen readers of dialog content.
* **`role`**: Set to `"dialog"` on `<PopoverCard>` containers.
* **`aria-describedby`**: Linked when `ariaDescribedby` option is specified.

```tsx
<PopoverTrigger popoverKey="item-1">
  <button>Inspect Item #1</button>
</PopoverTrigger>
```

---

## 2. Focus Locking & Focus Trapping (`FocusLockOptions`)

To trap keyboard focus inside an active popover card (ideal for modal-like popovers), pass `focusLockOptions`:

```tsx
const triggerProps = usePopoverTrigger('modal-popover-1', {
  focusLockOptions: {
    enabled: true,              // Enable focus trap inside popover
    returnFocus: true,          // Restore focus to trigger button on close
    lockScroll: true,           // Prevent body background scrolling
    autoFocusElement: '#first-input', // Element to receive initial focus
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

## 3. Keyboard Shortcut Handler Map (`keyboardShortcuts`)

Pass custom keyboard action handlers per popover card:

```tsx
const triggerProps = usePopoverTrigger('card-shortcut-demo', {
  keyboardShortcuts: {
    Escape: (key) => actions.closeByKey(key),
    'Mod+s': (key) => console.log('Shortcut triggered for', key),
    'Alt+r': (key) => actions.retryPopover(key),
  },
});
```

`Mod+s` automatically maps to `Cmd+s` on macOS and `Ctrl+s` on Windows/Linux.

---

## Summary Checklist

- [x] Use `role="dialog"` and `aria-expanded` for screen reader accessibility.
- [x] Configure `focusLockOptions` for modal-like popovers requiring focus trapping.
- [x] Use `keyboardShortcuts` for custom keyboard hotkey bindings.

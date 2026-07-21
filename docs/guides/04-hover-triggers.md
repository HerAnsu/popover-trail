# Guide 4: Hover Triggers & Delay Buffers

Popover Trail supports hover-driven triggers with configurable delay timers, preventing accidental popover openings when a user quickly passes their mouse cursor over triggers.

---

## 1. Hover Configuration Options (`HoverConfig`)

Configure hover settings using `hover` prop on `<PopoverTrigger>` or trigger hooks:

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enabled` | `boolean` | *required* | Set to `true` to enable hover triggers. |
| `openDelay` | `number` | `200` | Delay buffer in milliseconds before opening the popover on hover. |
| `closeDelay` | `number` | `300` | Delay buffer in milliseconds before closing when the cursor leaves. |
| `closeOnMouseLeave` | `boolean` | `true` | When `false`, cursor leaving the card will not trigger close timers. |

---

## 2. Using Hover Triggers

### Declarative Component Usage (`<PopoverTrigger>`)

```tsx
import { PopoverTrigger } from 'popover-trail';

export function QuickPreviewButton({ itemId }: { itemId: string }) {
  return (
    <PopoverTrigger
      popoverKey={`preview-${itemId}`}
      placement="right-start"
      hover={{
        enabled: true,
        openDelay: 150,
        closeDelay: 250,
        closeOnMouseLeave: true,
      }}
    >
      <button className="preview-trigger-btn">
        Hover to Preview #{itemId}
      </button>
    </PopoverTrigger>
  );
}
```

### Hook Usage (`usePopoverTrigger`)

```tsx
import { usePopoverTrigger } from 'popover-trail';

export function QuickPreviewCard({ cardId }: { cardId: string }) {
  const triggerProps = usePopoverTrigger(`preview-${cardId}`, {
    placement: 'bottom-start',
    hover: {
      enabled: true,
      openDelay: 100,
      closeDelay: 200,
    },
  });

  return (
    <div {...triggerProps} className="hoverable-item">
      <span>Item {cardId}</span>
    </div>
  );
}
```

---

## 3. Preventing Cursor Flickering

When moving the mouse cursor from the trigger element onto the opened popover card:
1. `onMouseLeave` fires on the trigger button, starting the `closeDelay` timer (e.g. 250ms).
2. `onMouseEnter` fires on the popover card, cancelling the pending close timer before it expires.
3. The popover remains open smoothly without flickering closed.

### Troubleshooting Hover Issues

* **Gap between trigger and card**: If the distance offset between trigger and card is too large, the cursor may spend more time traveling than `closeDelay` allows. Increase `closeDelay` (e.g. `closeDelay: 400`) or decrease placement `offset`.
* **Sticky hover cards**: If `closeOnMouseLeave` is set to `false`, the popover remains open until an explicit click outside occurs.

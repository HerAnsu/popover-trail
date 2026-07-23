# Guide 4: Hover Triggers & Delay Buffers

Popover Trail supports hover-driven triggers with configurable delay timers, preventing accidental popover openings when a user quickly passes their mouse cursor over triggers.

---

## 1. Hover Configuration Options (`HoverConfig`)

Configure hover settings using the `hover` prop on `<PopoverTrigger>` or trigger hooks:

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
      options={{
        hover: {
          enabled: true,
          openDelay: 150,
          closeDelay: 250,
          closeOnMouseLeave: true,
        },
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

## 3. Cursor Travel & Delay Management

When moving the mouse cursor from the trigger element onto the opened popover card:
1. `onMouseLeave` fires on the trigger button, starting the `closeDelay` timer (e.g. 250ms).
2. `onMouseEnter` fires on the popover card, cancelling the pending close timer before it expires.
3. The popover remains open smoothly without flickering closed.

---

## 4. Hover Delay & Intent Architecture

Hover trigger interactions are managed through isolated timer managers:
* **Open Delays (`openDelay`)**: Introduce a short delay buffer (100–200ms) to ensure popovers only open when the cursor pauses intentionally over a trigger.
* **Close Delays (`closeDelay`)**: Provide a grace window (200–300ms) allowing users to move the cursor across offset gaps between the trigger element and the card content.
* **Sticky Mode (`closeOnMouseLeave: false`)**: Keeps popover cards open after hover activation until closed by an explicit user action.

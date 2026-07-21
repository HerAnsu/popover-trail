# Guide 1: Cascading Popover Paths

Popover Trail structures popover cards as nodes in a dynamic hierarchy tree. Unlike isolated dropdowns, opening a popover from inside an existing popover establishes a parent-child relationship.

---

## 1. Linear Trail Architecture

Unpinned popovers live in a linear stack called `trail`. Only one active unpinned path exists at a time.

```
[ Root Trigger ]
       │
       ▼
┌──────────────┐
│ Card 1       │ (Root Entry)
└──────┬───────┘
       │ [ Nested Trigger ]
       ▼
┌──────────────┐
│ Card 2       │ (Child Entry, parentKey: "Card 1")
└──────┬───────┘
       │ [ Nested Trigger ]
       ▼
┌──────────────┐
│ Card 3       │ (Grandchild Entry, parentKey: "Card 2")
└──────────────┘
```

When a user clicks a root trigger, any existing unpinned trail is unmounted, and a new root entry begins.

---

## 2. Implementing Triggers

### Root Triggers (`usePopoverTrigger`)

Root triggers initiate a new popover hierarchy path.

```tsx
import { usePopoverTrigger } from 'popover-trail';

export function UserListRow({ userId, name }: { userId: string; name: string }) {
  const triggerProps = usePopoverTrigger(`user-card-${userId}`, {
    placement: 'right-start',
    offset: 8,
  });

  return (
    <div className="user-row">
      <span>{name}</span>
      <button {...triggerProps} className="inspect-button">
        Inspect User
      </button>
    </div>
  );
}
```

### Nested Triggers (`usePopoverNestedTrigger`)

Inside a popover card, pass the current entry's `key` as `parentKey` to create nested child triggers.

```tsx
import { usePopoverNestedTrigger, type TrailEntry } from 'popover-trail';

export function UserPopoverCard({ entry }: { entry: TrailEntry<{ id: string; orgId: string }> }) {
  // Nested trigger opening organization details card
  const orgTriggerProps = usePopoverNestedTrigger(
    `org-card-${entry.data?.orgId}`,
    entry.key, // parentKey ties org card to this user card
    { placement: 'right-top' }
  );

  return (
    <div className="popover-content">
      <h3>User #{entry.key}</h3>
      <button {...orgTriggerProps} className="nested-btn">
        View Organization Details
      </button>
    </div>
  );
}
```

---

## 3. Tree Traversal & Automatic Cleanup

### Breadth-First Search (BFS) Branch Removal

Closing a parent popover removes that popover and recursively unmounts all descendant popovers across both `trail` and `floating` arrays.

```
Closing "Card 1" automatically closes:
  └── Card 2 (Child)
        └── Card 3 (Grandchild)
```

This prevents orphaned child popovers from lingering on the screen when their parent context is removed.

### AbortController Network Request Cancellation

When a popover card unmounts before its data fetch resolves, Popover Trail immediately triggers the `AbortController.signal` attached to that entry.

```tsx
// Inside your resolveData function
const resolveData = async (key: string, parentData?: unknown, context?: unknown, signal?: AbortSignal) => {
  // The signal parameter is automatically linked to the entry's AbortController
  const response = await fetch(`/api/details/${key}`, { signal });
  
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  
  return response.json();
};
```

If a user rapidly opens and closes popovers, pending HTTP requests are cancelled on the network layer, saving bandwidth and preventing race conditions.

---

## 4. Technical Nuances & Edge Cases

### Event Propagation (React Portals vs Native DOM)

Because `<PopoverPortal>` renders cards into `document.body` via React Portals, event bubbling behaves differently across React and DOM boundaries:

* **React Synthetic Event Tree**: React synthetic events bubble up through the JSX parent hierarchy (the component where `<PopoverPortal>` is placed), **not** the DOM parent where the trigger element lives.
* **Native DOM Event Tree**: Native browser events bubble up through `document.body`.
* **Nuance / Pitfall**: Calling `e.stopPropagation()` on a native event inside a popover card will not stop the React synthetic event from bubbling up your React component tree. If you need to stop propagation across triggers, use `e.stopPropagation()` on the React event object.

```tsx
// Inside a card component
<button
  onClick={(e) => {
    // Stops synthetic bubbling up through the parent React component tree
    e.stopPropagation();
    handleCardButtonClick();
  }}
>
  Card Action
</button>
```

### Rapid Click Race Conditions & Hydration Counters

When users rapidly click between different triggers:
1. Each click increments an internal entry `hydrationId` counter.
2. If an older promise resolves after a newer click has already mounted, the result is discarded if its `hydrationId` does not match the current active state.
3. This guarantees that stale async responses never overwrite newer state, even if network responses arrive out of order.

### Circular References & Tree Validation

* **Duplicate Keys**: Popover keys must be unique. Attempting to open a child popover with a key that already exists in its ancestor path is automatically rejected by the store to prevent infinite recursive loops.
* **Max Depth Enforcers**: Use `maxDepth` on `<PopoverProvider>` (e.g. `maxDepth={4}`) to restrict the nesting level. Any attempt to open a nested popover beyond `maxDepth` is ignored safely without throwing runtime exceptions.

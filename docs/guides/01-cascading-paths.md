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

## 2. Implementing Triggers & Headless Components

### Declarative Headless Syntax (`<PopoverCard>` & `<PopoverTrail>`)

The recommended declarative approach uses compound components (`<PopoverCard>`, `<PopoverTrail>`) without manual hook wiring:

```tsx
import { PopoverCard, PopoverTrail, PopoverTrigger, isResolvedEntry, type TrailEntry } from 'popover-trail';

interface CardData {
  title: string;
  childKeys: string[];
}

export function App() {
  return (
    <PopoverProvider resolveData={resolveData}>
      {/* Root trigger for starting a trail */}
      <PopoverTrigger popoverKey="user-1">
        <button className="btn">Inspect User #1</button>
      </PopoverTrigger>

      {/* High-level portal renderer */}
      <PopoverTrail
        renderCard={(entry: TrailEntry<CardData>, index, isPinned) => (
          <PopoverCard key={entry.key} entry={entry} index={index} isPinned={isPinned} className="card">
            <PopoverCard.Handle className="card-header">
              <span>{entry.key}</span>
              <PopoverCard.PinButton />
              <PopoverCard.CloseButton />
            </PopoverCard.Handle>

            <PopoverCard.Content className="card-body">
              {entry.isLoading && <p>Loading...</p>}
              {isResolvedEntry(entry) && (
                <div>
                  <h3>{entry.data.title}</h3>
                  {entry.data.childKeys.map((childKey) => (
                    <PopoverTrigger key={childKey} popoverKey={childKey}>
                      <button className="nested-btn">Open {childKey} →</button>
                    </PopoverTrigger>
                  ))}
                </div>
              )}
            </PopoverCard.Content>
          </PopoverCard>
        )}
      />
    </PopoverProvider>
  );
}
```

### Low-Level Hook Syntax (`usePopoverTrigger` & `usePopoverNestedTrigger`)

When building custom trigger elements, low-level hooks are available:

#### Root Triggers (`usePopoverTrigger`)
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

#### Nested Triggers (`usePopoverNestedTrigger`)
```tsx
import { usePopoverNestedTrigger, type TrailEntry } from 'popover-trail';

export function UserPopoverCard({ entry }: { entry: TrailEntry<{ id: string; orgId: string }> }) {
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

### `AbortController` Signal Propagation

When a popover entry is unmounted during BFS branch cleanup, any pending asynchronous `resolveData` request is cancelled immediately:

```tsx
const resolveData = async (
  key: string,
  parentData?: unknown,
  context?: unknown,
  signal?: AbortSignal
) => {
  const response = await fetch(`/api/details/${key}`, { signal });
  return response.json();
};
```

If the user closes "Card 1" while "Card 3" is still loading, `signal.aborted` evaluates to `true`, cancelling the underlying HTTP fetch request.

---

## 4. Retaining Pinned Descendants (`closePinnedDescendants`)

By default, pinning a child popover detaches it into a floating window, protecting it from closing when its parent is closed.

If you prefer closing pinned children when a parent is closed, set `closePinnedDescendants={true}` on `<PopoverProvider>`:

```tsx
<PopoverProvider resolveData={resolveData} closePinnedDescendants={true}>
  <App />
</PopoverProvider>
```

---

## Summary Checklist

- [x] Use `<PopoverTrigger>` or `usePopoverTrigger` for root entry nodes.
- [x] Use `<PopoverTrigger>` inside cards or `usePopoverNestedTrigger` for child nodes.
- [x] Pass `signal` to `fetch` to enable automatic BFS network request cancellation.

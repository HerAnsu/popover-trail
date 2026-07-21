# Guide 13: Virtualization & Multi-Tab State Sync

Guide for virtualizing large lists of active popover cards and synchronizing popover states across browser tabs using `BroadcastChannel`.

---

## 1. Virtualization for Large Node Trees

When rendering hundreds or thousands of active cards simultaneously (e.g. large data visualization canvases or graph node explorers), DOM node overhead can impact rendering performance.

### Integrating `@tanstack/react-virtual`

Wrap the portal render function with a virtualizer to render only cards currently visible inside the viewport bounds:

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { PopoverPortal } from 'popover-trail';

export function VirtualizedPopoverCanvas() {
  const parentRef = React.useRef<HTMLDivElement>(null);

  return (
    <PopoverPortal>
      {(entries) => {
        // Virtualize active popover entries array
        const rowVirtualizer = useVirtualizer({
          count: entries.length,
          getScrollElement: () => parentRef.current,
          estimateSize: () => 180, // Estimated card height in px
          overscan: 5,
        });

        return (
          <div ref={parentRef} className="virtual-canvas-viewport">
            <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
              {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                const entry = entries[virtualItem.index];
                return (
                  <PopoverCardItem
                    key={entry.key}
                    entry={entry}
                    index={virtualItem.index}
                    isPinned={entry.isPinned}
                  />
                );
              })}
            </div>
          </div>
        );
      }}
    </PopoverPortal>
  );
}
```

---

## 2. Multi-Tab State Sync (`BroadcastChannel`)

Synchronize popover actions (such as opening or closing cards) across multiple browser tabs or windows using the native Web `BroadcastChannel` API.

```tsx
import { useEffect } from 'react';
import { usePopoverStoreApi, createPopoverController } from 'popover-trail';

export function MultiTabPopoverSync() {
  const store = usePopoverStoreApi();

  useEffect(() => {
    const channel = new BroadcastChannel('popover_sync_channel');
    const controller = createPopoverController(store);

    // 1. Listen for events broadcast by other browser tabs
    channel.onmessage = (event) => {
      const { type, key } = event.data;

      if (type === 'SYNC_CLOSE') {
        controller.closeByKey(key);
      } else if (type === 'SYNC_TOGGLE_PIN') {
        controller.togglePin(key);
      } else if (type === 'SYNC_CLEAR') {
        controller.clear();
      }
    };

    // 2. Subscribe to local store changes and broadcast to other tabs
    const unsubscribe = store.subscribe((state, prevState) => {
      if (state.trail.length < prevState.trail.length) {
        // Find closed keys and broadcast
        const closedKey = prevState.trail.find((e) => !state.trail.some((n) => n.key === e.key))?.key;
        if (closedKey) {
          channel.postMessage({ type: 'SYNC_CLOSE', key: closedKey });
        }
      }
    });

    return () => {
      unsubscribe();
      channel.close();
    };
  }, [store]);

  return null;
}
```

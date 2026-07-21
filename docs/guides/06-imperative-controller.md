# Guide 6: Imperative External Controller

Popover Trail provides `createPopoverController` to manipulate popover cards imperatively outside the React rendering loop (e.g. from WebSockets, Redux sagas, API response handlers, or vanilla JS events).

---

## 1. Controller API Interface (`PopoverController`)

```ts
export interface PopoverController<TData = unknown, TContext = unknown> {
  openRoot: (ownerId: string, entry: TrailEntry<TData>) => void;
  openNested: (index: number, entry: TrailEntry<TData>) => void;
  closeByKey: (key: string) => void;
  togglePin: (key: string) => void;
  clear: () => void;
  getState: () => PopoverStore<TData, TContext>;
}
```

---

## 2. Creating a Controller

Pass the raw `StoreApi` from `usePopoverStoreApi()` to `createPopoverController`:

```tsx
import { useEffect } from 'react';
import { usePopoverStoreApi, createPopoverController } from 'popover-trail';

export function ImperativeControllerBridge() {
  const store = usePopoverStoreApi();

  useEffect(() => {
    const controller = createPopoverController(store);

    // Global listener outside React
    const handleCustomSignal = (e: CustomEvent<{ action: string; key: string }>) => {
      if (e.detail.action === 'CLOSE') {
        controller.closeByKey(e.detail.key);
      } else if (e.detail.action === 'TOGGLE_PIN') {
        controller.togglePin(e.detail.key);
      }
    };

    window.addEventListener('app-popover-signal' as any, handleCustomSignal);
    return () => window.removeEventListener('app-popover-signal' as any, handleCustomSignal);
  }, [store]);

  return null;
}
```

---

## 3. Real-Time WebSocket Synchronization Example

Close or update popover cards in real time when remote server events arrive over WebSockets:

```tsx
import { useEffect } from 'react';
import { usePopoverStoreApi, createPopoverController } from 'popover-trail';

export function WebSocketSync() {
  const store = usePopoverStoreApi();

  useEffect(() => {
    const controller = createPopoverController(store);
    const ws = new WebSocket('wss://api.example.com/live-updates');

    ws.onmessage = (message) => {
      const payload = JSON.parse(message.data);

      if (payload.event === 'ENTITY_DELETED') {
        // Automatically close card if entity was deleted on server
        controller.closeByKey(`entity-${payload.entityId}`);
      } else if (payload.event === 'CLEAR_ALL_POPOVERS') {
        controller.clear();
      }
    };

    return () => ws.close();
  }, [store]);

  return null;
}
```

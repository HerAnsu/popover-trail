# Guide 3: Async Data Hydration & Caching

Popover Trail provides built-in async data hydration, caching, error recovery, and Web Worker offloading.

---

## 1. Async Resolution Lifecycle

When a popover key is opened:

```
                  ┌───────────────────────────────┐
                  │ Trigger Click / Open Action   │
                  └───────────────┬───────────────┘
                                  │
                       Is Key in Cache?
                      /                \
          Yes (Hit)  /                  \ No (Miss)
                    ▼                    ▼
     ┌────────────────────────┐  ┌────────────────────────┐
     │ Render Synchronously   │  │ Render Loading State   │
     │ isLoading: false       │  │ isLoading: true        │
     └────────────────────────┘  └───────────┬────────────┘
                                             │
                                   Execute resolveData()
                                             │
                                    ┌────────┴────────┐
                                    ▼                 ▼
                              Success (Data)    Failure (Error)
                                    │                 │
                                    ▼                 ▼
                             Render Data State  Render Error State
```

---

## 2. In-Memory Caching (`SimplePopoverCache`)

`SimplePopoverCache` provides in-memory storage with Time-To-Live (TTL) expiration and Least Recently Used (LRU) capacity eviction.

```tsx
import { PopoverProvider, SimplePopoverCache } from 'popover-trail';

// TTL: 60,000ms (1 minute), Max capacity: 100 entries
const cache = new SimplePopoverCache(60000, 100);

export function App() {
  return (
    <PopoverProvider
      resolveData={async (key, parentData, context, signal) => {
        const response = await fetch(`/api/items/${key}`, { signal });
        return response.json();
      }}
      cache={cache}
    >
      <Workspace />
    </PopoverProvider>
  );
}
```

### Implementing a Custom Cache

You can supply any cache implementation that adheres to the `PopoverCache` interface:

```ts
export interface PopoverCache<TData = unknown> {
  get(key: string): TData | undefined;
  set(key: string, data: TData): void;
  has(key: string): boolean;
  delete(key: string): void;
  clear(): void;
}

// Example: LocalStorage-backed Cache
export class LocalStoragePopoverCache<TData> implements PopoverCache<TData> {
  get(key: string): TData | undefined {
    const raw = localStorage.getItem(`popover_cache_${key}`);
    return raw ? JSON.parse(raw) : undefined;
  }
  set(key: string, data: TData): void {
    localStorage.setItem(`popover_cache_${key}`, JSON.stringify(data));
  }
  has(key: string): boolean {
    return localStorage.getItem(`popover_cache_${key}`) !== null;
  }
  delete(key: string): void {
    localStorage.removeItem(`popover_cache_${key}`);
  }
  clear(): void {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('popover_cache_'))
      .forEach((k) => localStorage.removeItem(k));
  }
}
```

---

## 3. Technical Nuances & Session Management

### Session Invalidation & Cache Purging

When a user logs out or switches organization accounts in a single-page application (SPA), cached popover data must be invalidated to prevent data leaking across user sessions:

```tsx
export function useUserLogout() {
  const cache = useMemo(() => globalPopoverCache, []);

  const handleLogout = () => {
    // 1. Clear popover cache
    cache.clear();
    // 2. Clear authentication token
    authService.logout();
  };

  return handleLogout;
}
```

### Memory Leak Prevention in Custom Resolvers

When writing custom resolvers that listen to event streams or WebSockets, ensure event listeners are attached to `signal.addEventListener('abort', ...)` to prevent memory leaks when popovers close before data arrives:

```ts
const customDataResolver = (key: string, parentData: unknown, context: unknown, signal?: AbortSignal) => {
  return new Promise((resolve, reject) => {
    const handler = (data: any) => resolve(data);
    
    eventEmitter.on(`data:${key}`, handler);

    if (signal) {
      signal.addEventListener('abort', () => {
        // Unbind event emitter listener on abort signal
        eventEmitter.off(`data:${key}`, handler);
        reject(new DOMException('Request aborted', 'AbortError'));
      });
    }
  });
};
```

---

## 4. Web Worker Offloading & Fallback Mechanisms

`createWorkerResolver` allows CPU-intensive tasks to run in a background Web Worker.

```tsx
import { createWorkerResolver, PopoverProvider } from 'popover-trail';

// Offloads data resolution to a background Worker thread
const workerResolver = createWorkerResolver(
  (key, parentData) => {
    // Runs inside worker thread scope
    const heavyCalculatedData = Array.from({ length: 50000 }).map((_, i) => ({
      id: `${key}-${i}`,
      val: Math.sqrt(i) * 42,
    }));

    return {
      key,
      totalCount: heavyCalculatedData.length,
      sample: heavyCalculatedData.slice(0, 5),
    };
  },
  { timeoutMs: 20000 } // Reject task if worker takes over 20s
);

export function App() {
  return (
    <PopoverProvider resolveData={workerResolver}>
      <Workspace />
    </PopoverProvider>
  );
}
```

### Content Security Policy (CSP) & Worker Fallbacks

In environments where Web Workers are restricted by Content Security Policy (`worker-src 'none'`) or in SSR / Node.js test environments:
* `createWorkerResolver` detects `typeof Worker === 'undefined'` or worker instantiation errors.
* It falls back to executing the function synchronously in the main thread without throwing runtime initialization errors.

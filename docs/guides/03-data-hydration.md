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

`SimplePopoverCache` provides in-memory storage with Time-To-Live (TTL) expiration, Least Recently Used (LRU) capacity eviction, and statistics tracking:

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

// Log hit/miss statistics for cache monitoring
console.log(cache.stats());
// { hits: 42, misses: 8, hitRatio: 0.84, size: 12 }
```

### Implementing a Custom Cache

Supply any cache implementation adhering to the `PopoverCache` interface:

```ts
export interface PopoverCache<TData = unknown> {
  get(key: string): TData | undefined;
  set(key: string, data: TData): void;
  has(key: string): boolean;
  delete(key: string): void;
  clear(): void;
}
```

---

## 3. Background Web Worker Hydration (`createWorkerResolver`)

Offload heavy data processing and JSON parsing to a background Web Worker thread to preserve 60-120 FPS UI performance:

```tsx
import { PopoverProvider, createWorkerResolver } from 'popover-trail';

const workerResolver = createWorkerResolver(
  async (key: string, parentData?: unknown, context?: unknown) => {
    // Runs inside a Web Worker thread context
    const res = await fetch(`/api/nodes/${key}`);
    const data = await res.json();
    return data;
  },
  {
    timeoutMs: 10000,
    autoRestart: true,
  }
);

export function App() {
  return (
    <PopoverProvider resolveData={workerResolver}>
      <Workspace />
    </PopoverProvider>
  );
}
```

### Worker Task Cancellation & Zero-Copy Transferables

When a popover unmounts before worker resolution completes, `createWorkerResolver` sends an `{ action: 'abort', id }` message to terminate the worker computation immediately. ArrayBuffer payloads are passed back using zero-copy Transferable Objects.

---

## 4. Retrying Failed Resolvers

When a resolver throws an Error, `isErrorEntry(entry)` evaluates to `true`. Use `actions.retryPopover(key)` to attempt re-fetching:

```tsx
import { PopoverCard, isErrorEntry, usePopoverActions, type TrailEntry } from 'popover-trail';

export function Card({ entry, index, isPinned }: { entry: TrailEntry; index: number; isPinned: boolean }) {
  const { retryPopover } = usePopoverActions();

  return (
    <PopoverCard entry={entry} index={index} isPinned={isPinned}>
      <PopoverCard.Content>
        {isErrorEntry(entry) && (
          <div className="error-box">
            <p>Failed to load: {entry.error.message}</p>
            <button onClick={() => retryPopover(entry.key)}>Retry</button>
          </div>
        )}
      </PopoverCard.Content>
    </PopoverCard>
  );
}
```

---

## Summary Checklist

- [x] Configure `SimplePopoverCache` to prevent redundant network requests.
- [x] Use `createWorkerResolver` for CPU-intensive data transformations.
- [x] Provide a retry button via `actions.retryPopover(key)` for error states.

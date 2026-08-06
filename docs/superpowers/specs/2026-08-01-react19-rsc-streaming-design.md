# React 19 RSC Async Streaming & Stream Abort Pipeline Specification

## Overview

The **React 19 RSC Async Streaming & Stream Abort Pipeline** (`popover-trail/rsc`) integrates React 19 Server Components (RSC), Server Actions, and `ReadableStream` async iterators directly into `popover-trail`'s FSM state machine and data resolver architecture.

It allows popover cards to mount instantly with 0ms client latency while streaming rich server-rendered HTML/React component chunks over HTTP, with automatic server-side `AbortController` cancellation when a popover subtree is closed during streaming.

---

## 1. Business & Technical Rationale

### The Problem

1. **Initial Open Latency in RSC Apps**: In React 19 Next.js / Vite RSC apps, fetching full server-rendered HTML for a popover delays the initial popover open event until the entire server component finishes rendering.
2. **Client Bundle Inflation**: Converting popovers into pure Client Components forces developers to ship heavy client-side markdown parsers, syntax highlighters, and data formatting libraries in the browser JavaScript bundle.
3. **Wasted Server CPU Cycles**: When a user quickly opens and closes a cascading trail of popovers, background server rendering requests continue executing on Node.js/Edge servers, wasting CPU and memory.

### The Solution

- **Instant Client Shell (0ms Latency)**: Popover card container mounts immediately with an optimistic skeleton layout.
- **Incremental Stream Chunk Hydration**: Server Actions stream HTML/RSC chunks over HTTP via `ReadableStream` / `AsyncIterable`.
- **FSM-Integrated Abort Cancellation**: Closing a parent popover instantly triggers an `AbortSignal` that propagates to the Node.js/Edge server, cancelling active RSC stream rendering threads immediately.

---

## 2. Architecture & Schema Extensions

### 2.1 Schema Definition (`PopoverSchemaNode`)

Resolvers can return a React 19 `ReadableStream<React.ReactNode>` or `AsyncIterable<React.ReactNode>`:

```typescript
export interface PopoverRSCSchemaNode<TParentData = unknown, TContext = unknown> {
  /** Async Iterable or ReadableStream resolver producing incremental RSC ReactNode chunks. */
  rscResolver: (
    key: string,
    parentData?: TParentData,
    context?: TContext,
    signal?: AbortSignal,
  ) => AsyncIterable<React.ReactNode> | Promise<ReadableStream<React.ReactNode>>;

  children?: ReadonlyArray<string>;
  placement?: PopoverPlacement;
}
```

---

## 3. FSM Lifecycle & Stream Abort Mechanics

### 3.1 Extended FSM State Machine

```
              ┌───────────┐
              │   IDLE    │
              └─────┬─────┘
                    │ openRoot() / pushNested()
                    ▼
              ┌───────────┐
              │  MOUNTED  │ ◄── [0ms Instant Shell & Skeleton]
              └─────┬─────┘
                    │ Stream response initialized
                    ▼
        ┌──────────────────────────┐
        │  STREAMING_CHUNKS        │ ◄── [Incremental RSC Chunks]
        └───────────┬──────────────┘
                    │
           ┌────────┴────────┐
           ▼                 ▼
   ┌───────────────┐ ┌───────────────┐
   │ STREAM_ABORTED│ │FULLY_RESOLVED │
   └───────────────┘ └───────────────┘
```

### 3.2 Server Cancellation Protocol

1. `createPopoverStore` assigns a private `AbortController` to each streaming node key.
2. The `rscResolver` receives `signal: controller.signal` and forwards it to `fetch` or Node.js `renderToReadableStream`.
3. If `close(key)` or `resetStoreState()` occurs while state is `STREAMING_CHUNKS`:
   - Store calls `controller.abort()`.
   - The browser cancels the HTTP chunk stream.
   - Node.js / Edge server catches the aborted signal and terminates the RSC render thread.

---

## 4. Usage Example

```tsx
// app/schemas/userSchema.ts (Server Action context)
import { createPopoverSchema } from 'popover-trail/rsc';
import { renderToReadableStream } from 'react-dom/server';

export const userSchema = createPopoverSchema({
  userAnalytics: {
    rscResolver: async (key, parentData, context, signal) => {
      // Stream server-rendered charts and logs directly over HTTP
      return streamUserAnalyticsRSC(key, { signal });
    },
  },
});
```

---

## 5. Verification & Testing

1. **Unit Tests (`storeRSC.test.ts`)**:
   - Verify `STREAMING_CHUNKS` state transitions.
   - Verify `controller.abort()` is invoked when `close()` is dispatched during streaming.
2. **Integration Tests (`rscStream.test.tsx`)**:
   - Test incremental chunk rendering inside `<PopoverCard />`.
   - Confirm skeleton fallback hides smoothly upon full resolution.

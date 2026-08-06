# Reactive Subtree Mutation Graph Specification

## Overview

The **Reactive Subtree Mutation Graph** provides a declarative mutation and invalidation pipeline within `popover-trail`. When a child popover executes a data mutation (e.g. updating a status, deleting an entity, or editing a form field), the engine automatically invalidates and refetches all affected parent, sibling, or descendant nodes in the active DAG tree without requiring custom event listeners, manual query client invalidations, or callback prop-drilling.

---

## 1. Problem Statement & Business Rationale

### The Problem

In nested popover architectures (e.g. inspecting a User Profile in Popover A, then opening Popover B to edit User Status):

1. **Stale Data Inconsistency**: When the user saves changes in Popover B, Popover B closes, but Popover A continues displaying stale data until the entire trail is unmounted and reopened.
2. **Developer Boilerplate**: To fix this today, developers must manually prop-drill callback functions (`onSuccess={(updatedUser) => ...}`), wrap popovers in custom context emitters, or couple popover UI code with external query clients (React Query / SWR).
3. **Race Conditions & Layout Thrashing**: Manual refetches often cause flash-of-loading-spinners or uncoordinated layout shifts across nested popover layers.

### Why This Feature Is Essential

- Eliminates stale data bugs in 100% of nested popover workflows.
- Keeps `popover-trail` headless and query-library agnostic while providing native reactive graph updates.
- Guarantees seamless Optimistic UI transitions with zero layout shift using React 19 `startTransition`.

---

## 2. Theoretical Architecture & Schema Definition

### 2.1 Extended Schema Specification (`PopoverSchemaNode`)

We extend `PopoverSchemaNode` with a `mutations` record mapping mutation names to their payload types, async action handlers, and target invalidation keys.

```typescript
export interface PopoverMutationDefinition<
  TPayload = unknown,
  TResult = unknown,
  TParentData = unknown,
  TContext = unknown,
  TSchemaKeys extends string = string,
> {
  /** Async or sync mutation action handler. */
  action: (
    payload: TPayload,
    parentData?: TParentData,
    context?: TContext,
  ) => Promise<TResult> | TResult;

  /** List of schema node keys in the active DAG tree to invalidate upon successful mutation. */
  invalidates?: ReadonlyArray<TSchemaKeys>;

  /** Optional optimistic data updater function applied immediately to target nodes. */
  optimisticUpdate?: (payload: TPayload, currentTargetData: unknown) => unknown;
}

export interface PopoverSchemaNode<TData = unknown, TParentData = unknown, TContext = unknown> {
  resolver: (key: string, parentData?: TParentData, context?: TContext) => TData | Promise<TData>;
  children?: ReadonlyArray<string>;

  /** Declarative mutations exposed by this schema node. */
  mutations?: Record<string, PopoverMutationDefinition<any, any, TParentData, TContext, any>>;
}
```

---

## 3. Theoretical Implementation Details

### 3.1 Store Action Extensions (`store.ts`)

Add a new `executeMutation` method to `PopoverActions`:

```typescript
executeMutation: <K extends SchemaKeys<TSchema>, M extends keyof TSchema[K]['mutations']>(
  nodeKey: K,
  mutationName: M,
  payload: MutationPayload<TSchema, K, M>,
) => Promise<MutationResult<TSchema, K, M>>;
```

### 3.2 Execution Pipeline Lifecycle

```
[ User triggers mutation ]
          │
          ▼
1. Capture Optimistic Snapshot (Store state & target node data)
          │
          ▼
2. Apply Optimistic Update (If optimisticUpdate provided)
   └─ Immediate React 19 `startTransition` re-render
          │
          ▼
3. Execute Async Action Handler (`action(payload, parentData, context)`)
   ├── SUCCESS:
   │    ├─ Traverse active DAG tree for all nodes matching `invalidates` keys
   │    └─ Re-run resolvers for matched nodes via background `startTransition`
   └── FAILURE:
        ├─ Roll back store data to Optimistic Snapshot
        └─ Emit `MUTATION_ERROR` store event & trigger UI error state
```

### 3.3 DAG Tree Traversal Algorithm

When a mutation declares `invalidates: ['userProfile', 'userStats']`:

1. The store searches `trail` and `floating` lists for any active entries whose `schemaKey` matches an invalidated target.
2. For each matched entry:
   - Increments its hydration request counter (`entry.requestCounter++`).
   - Invokes its corresponding schema resolver with current `parentData` and `context`.
   - Updates `entry.data` seamlessly upon resolution without unmounting the popover card DOM node.

---

## 4. Developer Usage Example

```tsx
import { createPopoverSchema, PopoverProvider } from 'popover-trail';

export const appSchema = createPopoverSchema({
  userProfile: {
    resolver: async (key) => fetch(`/api/users/${key}`).then((r) => r.json()),
  },
  editUserStatus: {
    resolver: async (key, parentData: { id: string }) =>
      fetch(`/api/users/${parentData.id}/status`).then((r) => r.json()),
    mutations: {
      updateStatus: {
        action: async (newStatus: string, parentData: { id: string }) => {
          return fetch(`/api/users/${parentData.id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus }),
          }).then((r) => r.json());
        },
        invalidates: ['userProfile'], // Automatically refreshes userProfile in parent popover!
        optimisticUpdate: (newStatus, currentProfileData: any) => ({
          ...currentProfileData,
          status: newStatus,
        }),
      },
    },
  },
});
```

---

## 5. Verification & Testing Strategy

1. **Unit Tests (`store.test.ts`)**:
   - Verify that calling `executeMutation` triggers `action`.
   - Verify that matched entries in `trail` have their resolvers re-executed.
   - Verify optimistic rollback if `action` rejects with an Error.
2. **Integration Tests (`schema.test.tsx`)**:
   - Verify React component re-rendering when invalidation completes.

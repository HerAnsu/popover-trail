# Design Specification: Cache Provider & Boundary Collision Configuration

This document specifies the design and implementation details for adding custom hybrid cache provider support and global/local viewport collision configurations to the generic headless popover library.

---

## 1. Objectives & Goals
* **Optimized Data Hydration**: Allow caching resolved data to prevent duplicate loading states and network/resolver calls when popovers are reopened.
* **Hybrid Cache Model**: Support both synchronous (in-memory) caches for instant page loads and asynchronous (IndexedDB, Redis) caches with background fetching.
* **Flexible Layout Boundaries**: Allow developers to restrict popover placement shifts (`flip` and `shift` middlewares) globally or locally, preventing overlaps with headers, menus, or banners.

---

## 2. API Design & Interfaces

### 2.1 Caching Types (`src/lib/popover/types.ts`)
We introduce a hybrid interface that allows cache implementations to return synchronously or asynchronously:

```typescript
export interface PopoverCache<TData = any> {
  /** Retrieves a cached entry. Can return value directly or a Promise. */
  get(key: string): Promise<TData | undefined> | TData | undefined;
  /** Saves data in cache. */
  set(key: string, data: TData): Promise<void> | void;
  /** Removes an item from the cache. */
  delete(key: string): Promise<void> | void;
  /** Clears the cache completely. */
  clear(): Promise<void> | void;
}
```

### 2.2 Collision Types (`src/lib/popover/types.ts`)
We specify parameters for Floating UI collision shifting and boundary checking:

```typescript
export interface CollisionConfig {
  /** DOM element(s) to constrain the popover within (default: 'clippingAncestors'). */
  boundary?: "clippingAncestors" | HTMLElement | HTMLElement[] | (() => HTMLElement | HTMLElement[] | null);
  /** Safety padding margin around the boundary (default: 12 for shift, 0 for flip). */
  padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
}
```

### 2.3 Provider Configurations (`src/lib/popover/context.tsx`)
We update `PopoverProviderProps` to accept these optional configs:

```typescript
export interface PopoverProviderProps<TData = any, TContext = any> {
  children: ReactNode;
  resolveData: PopoverResolver<TData, TContext>;
  initialContext?: TContext;
  clickOutside?: ClickOutsideConfig;
  enableKeyboardClose?: boolean;
  closePinnedDescendants?: boolean;
  
  /** Custom data cache provider. */
  cache?: PopoverCache<TData>;
  /** Global collision settings default. */
  collision?: CollisionConfig;
}
```

---

## 3. Detailed Architectural Flow

### 3.1 Caching Flow (Zustand Store + Resolver Orchestrators)
1. **Trigger Request**: When `openRootWithResolver` or `openNestedWithResolver` is invoked:
   * First check: `const cached = cache ? cache.get(key) : undefined;`
2. **Synchronous Resolution**:
   * If `cached` is a non-promise value (e.g. data is in memory), the popover is opened immediately with data. `isLoading` is set to `false`.
3. **Asynchronous Resolution**:
   * If `cached` is a Promise (or is `undefined` so we fall back to calling `resolveData` which returns a Promise), we set `isLoading: true`, trigger the loading state, and `await` the promise.
   * Once resolved, we write the data to the state and update the cache: `void cache.set(key, resolvedData);`.

### 3.2 Viewport Boundary Collision Flow (`useGeometry.ts`)
1. **Retrieve Configs**:
   * Extract global `collisionConfig` from store.
   * Extract local `collision` override from `entry` metadata.
2. **Merge Settings**:
   * `boundary = localCollision.boundary ?? globalCollision.boundary`
   * `padding = localCollision.padding ?? globalCollision.padding`
3. **Resolve Lazy Boundary**:
   * If `boundary` is a function, execute it to obtain the target DOM elements: `boundary()`.
4. **Apply to Middlewares**:
   * Pass resolved boundary and padding configs to `flip` and `shift` middlewares in `useFloating`.

---

## 4. Syntax & Hook Usage Examples

### 4.1 Trigger Hooks with Collision Overrides
```tsx
// Spreads trigger props including local overrides
const trigger = usePopoverTrigger("user-profile", {
  collision: { padding: 20 }
});

<button {...trigger}>View Profile</button>
```

### 4.2 Cache Providers
Using a standard JavaScript `Map` as a synchronous cache:
```tsx
const localCache = new Map();

<PopoverProvider resolveData={dataResolver} cache={localCache}>
  <App />
</PopoverProvider>
```

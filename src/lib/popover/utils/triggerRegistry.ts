/**
 * External DOM reference registry for popover-trail.
 * Stores WeakRef<HTMLElement> mappings outside of Zustand state
 * to prevent DOM node retention and enable GC collection.
 *
 * @module triggerRegistry
 */

/**
 * Singleton registry mapping popover keys to `WeakRef<HTMLElement>` anchor elements.
 *
 * @remarks
 * Storing DOM node references inside `WeakRef` containers outside the Zustand store ensures
 * that the store state remains serializable and prevents memory leaks if components unmount.
 */
const registry = new Map<string, WeakRef<HTMLElement>>();
const MAX_REGISTRY_SIZE_BEFORE_SWEEP = 100;

function pruneDeadRefs(): void {
  for (const [key, ref] of registry.entries()) {
    if (ref.deref() === undefined) {
      registry.delete(key);
    }
  }
}

export const TriggerRegistry = {
  /**
   * Registers a trigger element for a popover key.
   *
   * @param key - Unique popover key string.
   * @param el - DOM HTMLElement of the trigger button or container.
   */
  register(key: string, el?: HTMLElement | null): void {
    if (!key || !el || typeof el !== 'object' || typeof WeakRef === 'undefined') return;
    if (registry.size > MAX_REGISTRY_SIZE_BEFORE_SWEEP) {
      pruneDeadRefs();
    }
    registry.set(key, new WeakRef(el));
  },

  /** Retrieve the anchor element, or null if GC'd or not registered. */
  get(key: string): HTMLElement | null {
    if (!key) return null;
    const ref = registry.get(key);
    if (!ref) return null;
    const el = ref.deref();
    if (!el) {
      registry.delete(key);
      return null;
    }
    return el;
  },

  /** Unregister a popover key. */
  unregister(key: string): void {
    if (!key) return;
    registry.delete(key);
  },

  /** Clear all registrations. */
  clear(): void {
    registry.clear();
  },

  /** ScopeDisposable compliance handle clearing all registered anchors. */
  dispose(): void {
    registry.clear();
  },

  /** Check if a key has a living (non-GC'd) element. Prunes stale WeakRef if GC'd. */
  has(key: string): boolean {
    const ref = registry.get(key);
    if (!ref) return false;
    const el = ref.deref();
    if (!el) {
      registry.delete(key);
      return false;
    }
    return true;
  },

  /** Returns active registration count. */
  get size(): number {
    return registry.size;
  },
} as const;

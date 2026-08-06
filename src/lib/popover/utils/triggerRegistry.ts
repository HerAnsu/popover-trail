/**
 * External DOM reference registry for popover-trail.
 * Stores WeakRef<HTMLElement> mappings outside of Zustand state
 * to prevent DOM node retention and enable GC collection.
 *
 * @module triggerRegistry
 */

/**
 * Singleton registry mapping popover keys to WeakRef<HTMLElement> anchor elements.
 * Lives outside the Zustand store to keep state 100% serializable.
 */
const registry = new Map<string, WeakRef<HTMLElement>>();

export const TriggerRegistry = {
  /** Register an anchor element for a popover key. */
  register(key: string, el: HTMLElement): void {
    registry.set(key, new WeakRef(el));
  },

  /** Retrieve the anchor element, or null if GC'd or not registered. */
  get(key: string): HTMLElement | null {
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
    registry.delete(key);
  },

  /** Clear all registrations. */
  clear(): void {
    registry.clear();
  },

  /** Check if a key has a living (non-GC'd) element. */
  has(key: string): boolean {
    return TriggerRegistry.get(key) !== null;
  },
} as const;

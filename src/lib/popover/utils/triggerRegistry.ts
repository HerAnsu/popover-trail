/**
 * External DOM reference registry for popover-trail.
 * Stores WeakRef<HTMLElement> mappings outside of Zustand state
 * to prevent DOM node retention and enable GC collection.
 *
 * @module triggerRegistry
 */

import type { Unbrand } from '../types/branded';

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
   * Registers a trigger element for a popover key. Accepts branded and unbranded keys.
   *
   * @param key - Unique popover key string or branded domain key.
   * @param el - DOM HTMLElement of the trigger button or container.
   *
   * @example
   * ```typescript
   * TriggerRegistry.register('user-button', buttonRef.current);
   * ```
   */
  register<K extends string = string>(key: K | Unbrand<K>, el?: HTMLElement | null): void {
    if (!key || !el || typeof el !== 'object' || typeof WeakRef === 'undefined') return;
    if (registry.size > MAX_REGISTRY_SIZE_BEFORE_SWEEP) {
      pruneDeadRefs();
    }
    registry.set(key, new WeakRef(el));
  },

  /**
   * Retrieves the anchor element, or null if garbage collected or not registered.
   *
   * @param key - Popover key to look up.
   * @returns Active HTMLElement or null.
   *
   * @example
   * ```typescript
   * const triggerEl = TriggerRegistry.get('user-button');
   * ```
   */
  get<K extends string = string>(key: K | Unbrand<K>): HTMLElement | null {
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

  /**
   * Unregisters a popover key from the registry.
   *
   * @param key - Popover key to unregister.
   *
   * @example
   * ```typescript
   * TriggerRegistry.unregister('user-button');
   * ```
   */
  unregister<K extends string = string>(key: K | Unbrand<K>): void {
    if (!key) return;
    registry.delete(key);
  },

  /**
   * Clears all trigger registrations from the registry.
   */
  clear(): void {
    registry.clear();
  },

  /**
   * Disposable compliance handle clearing all registered anchors.
   */
  dispose(): void {
    registry.clear();
  },

  /**
   * Checks if a key has an active (non-GC'd) trigger element.
   * Prunes stale WeakRef if garbage collection has occurred.
   *
   * @param key - Popover key.
   * @returns True if active element exists.
   *
   * @example
   * ```typescript
   * if (TriggerRegistry.has('user-button')) { ... }
   * ```
   */
  has<K extends string = string>(key: K | Unbrand<K>): boolean {
    const ref = registry.get(key);
    if (!ref) return false;
    const el = ref.deref();
    if (!el) {
      registry.delete(key);
      return false;
    }
    return true;
  },

  /**
   * Returns current active registration count in the registry.
   */
  get size(): number {
    return registry.size;
  },
} as const;

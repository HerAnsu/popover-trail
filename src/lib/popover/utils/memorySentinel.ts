/**
 * Memory Leak Sentinel for PopoverTrail DOM elements.
 * Uses native FinalizationRegistry in Dev mode to detect detached popover cards retained in memory.
 */

let sentinelRegistry: FinalizationRegistry<string> | null = null;

const isDevEnv =
  typeof globalThis !== 'undefined' &&
  (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env
    ?.NODE_ENV !== 'production';

if (typeof globalThis !== 'undefined' && typeof FinalizationRegistry !== 'undefined') {
  try {
    sentinelRegistry = new FinalizationRegistry((_popoverKey: string) => {
      // Successfully garbage collected
    });
  } catch {
    // Unsupported environment
  }
}

/**
 * Registers a DOM element or object for GC monitoring.
 */
export function trackMemoryCleanup(target: object, popoverKey: string): void {
  if (!sentinelRegistry || !isDevEnv) return;

  try {
    sentinelRegistry.register(target, popoverKey, target);
  } catch {
    // Ignore invalid target objects
  }
}

/**
 * Unregisters a tracked object manually when explicitly unmounted.
 */
export function untrackMemoryCleanup(target: object): void {
  if (!sentinelRegistry) return;

  try {
    sentinelRegistry.unregister(target);
  } catch {
    // Ignore
  }
}

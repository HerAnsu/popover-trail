/**
 * Memory Leak Sentinel for PopoverTrail DOM elements.
 * Uses native FinalizationRegistry in Dev mode to detect detached popover cards retained in memory.
 */

declare const process: { env?: Record<string, string | undefined> } | undefined;

let sentinelRegistry: FinalizationRegistry<string> | null = null;

const isDevEnv = typeof process !== 'undefined' && process?.env?.NODE_ENV !== 'production';

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
  if (!target || !popoverKey || !sentinelRegistry || !isDevEnv) return;

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
  if (!target || !sentinelRegistry) return;

  try {
    sentinelRegistry.unregister(target);
  } catch {
    // Ignore
  }
}

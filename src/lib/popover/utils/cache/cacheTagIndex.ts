/**
 * Bidirectional inverted index mapping tags to cache keys for O(1) invalidation.
 *
 * @module cache/cacheTagIndex
 */

/**
 * Bidirectional inverted index mapping semantic tags to cache keys.
 * Enables O(1) tag lookup and amortized O(K) invalidation across grouped entries.
 *
 * @example
 * ```ts
 * const tagIndex = new CacheTagIndex(500);
 * tagIndex.register('user:123', ['user', 'auth']);
 *
 * const userKeys = tagIndex.getKeysForTag('user'); // Set { 'user:123' }
 * ```
 */
export class CacheTagIndex {
  public readonly capacity: number;
  private readonly tagToKeys = new Map<string, Set<string>>();
  private readonly keyToTags = new Map<string, Set<string>>();

  constructor(capacity = 1000) {
    this.capacity = capacity;
  }

  /**
   * Associates an entry key with one or more tags.
   * Cleans up prior associations if the key was already registered.
   *
   * @param key - The cache entry key.
   * @param tags - Optional list of tags to associate.
   */
  public register(key: string, tags?: readonly string[]): void {
    this.unregister(key);
    if (!tags || tags.length === 0) return;

    if (this.keyToTags.size >= this.capacity) {
      const oldest = this.keyToTags.keys().next().value;
      if (oldest !== undefined) this.unregister(oldest);
    }

    const keyTags = new Set<string>();
    for (const tag of tags) {
      if (!tag) continue;
      keyTags.add(tag);
      let keys = this.tagToKeys.get(tag);
      if (!keys) {
        keys = new Set<string>();
        this.tagToKeys.set(tag, keys);
      }
      keys.add(key);
    }
    if (keyTags.size > 0) this.keyToTags.set(key, keyTags);
  }

  /**
   * Unregisters a key, removing all of its tag associations.
   *
   * @param key - The cache entry key to remove.
   */
  public unregister(key: string): void {
    const tags = this.keyToTags.get(key);
    if (!tags) return;

    for (const tag of tags) {
      const keys = this.tagToKeys.get(tag);
      if (keys) {
        keys.delete(key);
        if (keys.size === 0) this.tagToKeys.delete(tag);
      }
    }
    this.keyToTags.delete(key);
  }

  /**
   * Returns all keys associated with a specific tag.
   *
   * @param tag - Tag name.
   * @returns Readonly set of matching keys, or undefined if no keys match.
   */
  public getKeysForTag(tag: string): ReadonlySet<string> | undefined {
    return this.tagToKeys.get(tag);
  }

  /**
   * Returns a deduplicated Set of keys associated with any of the provided tags.
   *
   * @param tags - Array of tags to query.
   * @returns Set of keys matching any of the specified tags.
   */
  public getKeysForTags(tags: readonly string[]): Set<string> {
    const result = new Set<string>();
    for (const tag of tags) {
      const keys = this.tagToKeys.get(tag);
      if (keys) for (const k of keys) result.add(k);
    }
    return result;
  }

  /**
   * Clears all tag-to-key and key-to-tag index records.
   */
  public clear(): void {
    this.tagToKeys.clear();
    this.keyToTags.clear();
  }
}

/**
 * Invalidates all cache entries matching the specified tags using the inverted tag index.
 *
 * @param storage - Object with a `delete` method (such as a CacheStorageAdapter).
 * @param tagIndex - The `CacheTagIndex` holding tag mappings.
 * @param tags - A single tag string or list of tag strings to invalidate.
 * @param onDelete - Optional callback invoked after each key deletion.
 * @returns The total number of entries successfully deleted.
 *
 * @example
 * ```ts
 * const purged = invalidateWithTagIndex(storage, tagIndex, ['dashboard', 'analytics']);
 * ```
 */
export function invalidateWithTagIndex(
  storage: { delete(key: string): boolean },
  tagIndex: CacheTagIndex,
  tags: string | readonly string[],
  onDelete?: (key: string) => void,
): number {
  const list = typeof tags === 'string' ? [tags] : tags;
  let count = 0;
  for (const key of tagIndex.getKeysForTags(list)) {
    if (storage.delete(key)) {
      count++;
      tagIndex.unregister(key);
      onDelete?.(key);
    }
  }
  return count;
}

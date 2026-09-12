/**
 * Bidirectional inverted index mapping tags to cache keys for O(1) invalidation.
 *
 * @module cache/cacheTagIndex
 */

export class CacheTagIndex {
  public readonly capacity: number;
  private readonly tagToKeys = new Map<string, Set<string>>();
  private readonly keyToTags = new Map<string, Set<string>>();

  constructor(capacity = 1000) {
    this.capacity = capacity;
  }

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

  public getKeysForTag(tag: string): ReadonlySet<string> | undefined {
    return this.tagToKeys.get(tag);
  }

  public getKeysForTags(tags: readonly string[]): Set<string> {
    const result = new Set<string>();
    for (const tag of tags) {
      const keys = this.tagToKeys.get(tag);
      if (keys) for (const k of keys) result.add(k);
    }
    return result;
  }

  public clear(): void {
    this.tagToKeys.clear();
    this.keyToTags.clear();
  }
}

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

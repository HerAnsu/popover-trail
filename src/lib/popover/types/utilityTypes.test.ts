import { describe, it, expect, vi } from 'vitest';
import {
  unbrand,
  toPopoverKey,
  toDurationMs,
  toZIndexDepth,
  toStorageKey,
  TriggerRegistry,
} from '../index';
import {
  readStorageItem,
  writeStorageItem,
  removeStorageItem,
} from '../store/persistence/storageOperations';

describe('Utility Types & Brand Application Integration', () => {
  it('unbrand handles branded string, number, and boolean', () => {
    const key = toPopoverKey('popover-card-1');
    const rawKey = unbrand(key);
    expect(typeof rawKey).toBe('string');
    expect(rawKey).toBe('popover-card-1');

    const duration = toDurationMs(400);
    const rawDuration = unbrand(duration);
    expect(typeof rawDuration).toBe('number');
    expect(rawDuration).toBe(400);

    const zIndex = toZIndexDepth(15);
    const rawZIndex = unbrand(zIndex);
    expect(typeof rawZIndex).toBe('number');
    expect(rawZIndex).toBe(15);
  });

  it('smart constructors accept both unbranded and already-branded inputs', () => {
    const key1 = toPopoverKey('my-key');
    const key2 = toPopoverKey(key1);
    expect(key2).toBe(key1);

    const dur1 = toDurationMs(200);
    const dur2 = toDurationMs(dur1);
    expect(dur2).toBe(dur1);

    const z1 = toZIndexDepth(5);
    const z2 = toZIndexDepth(z1);
    expect(z2).toBe(z1);
  });

  it('TriggerRegistry accepts both branded PopoverKey and unbranded string', () => {
    const el1 = { id: 'btn-alpha' } as unknown as HTMLElement;
    const el2 = { id: 'div-beta' } as unknown as HTMLElement;
    const brandedKey = toPopoverKey('card-alpha');
    const rawKey = 'card-beta';

    TriggerRegistry.register(brandedKey, el1);
    TriggerRegistry.register(rawKey, el2);

    expect(TriggerRegistry.has(brandedKey)).toBe(true);
    expect(TriggerRegistry.has(rawKey)).toBe(true);
    expect(TriggerRegistry.get(brandedKey)).toBe(el1);
    expect(TriggerRegistry.get(rawKey)).toBe(el2);

    TriggerRegistry.unregister(brandedKey);
    expect(TriggerRegistry.has(brandedKey)).toBe(false);

    TriggerRegistry.clear();
    expect(TriggerRegistry.size).toBe(0);
  });

  it('storageOperations accept both branded StorageKey and unbranded key string', () => {
    const mockStorage = {
      getItem: vi.fn((k: string) => (k === 'test' ? 'value' : null)),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 1,
      key: vi.fn(),
    } as unknown as Storage;

    const brandedStorageKey = toStorageKey('my-store-key');
    const rawKey = 'raw-store-key';

    writeStorageItem(mockStorage, brandedStorageKey, 'data1');
    expect(mockStorage.setItem).toHaveBeenCalledWith('my-store-key', 'data1');

    writeStorageItem(mockStorage, rawKey, 'data2');
    expect(mockStorage.setItem).toHaveBeenCalledWith('raw-store-key', 'data2');

    readStorageItem(mockStorage, brandedStorageKey);
    expect(mockStorage.getItem).toHaveBeenCalledWith('my-store-key');

    removeStorageItem(mockStorage, rawKey);
    expect(mockStorage.removeItem).toHaveBeenCalledWith('raw-store-key');
  });
});

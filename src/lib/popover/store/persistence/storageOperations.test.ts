import { describe, it, expect, vi } from 'vitest';
import {
  readStorageItem,
  writeStorageItem,
  removeStorageItem,
  resolvePlatformStorage,
} from './storageOperations';

function createMockStorage(overrides?: Partial<Storage>): Storage {
  const map = new Map<string, string>();
  const storage: Storage = {
    length: 0,
    clear: () => map.clear(),
    getItem: (key: string) => map.get(key) ?? null,
    key: (index: number) => [...map.keys()][index] ?? null,
    removeItem: (key: string) => {
      map.delete(key);
    },
    setItem: (key: string, val: string) => {
      map.set(key, val);
    },
  };
  return Object.assign(storage, overrides);
}

describe('storageOperations module', () => {
  describe('readStorageItem', () => {
    it('returns stored value when key exists', () => {
      const storage = createMockStorage();
      storage.setItem('user_key', 'stored_value');

      expect(readStorageItem(storage, 'user_key')).toBe('stored_value');
    });

    it('returns null when key does not exist', () => {
      const storage = createMockStorage();
      expect(readStorageItem(storage, 'missing_key')).toBeNull();
    });

    it('handles storage read errors gracefully and returns null', () => {
      const throwingStorage = createMockStorage({
        getItem: () => {
          throw new Error('SecurityError: Access is denied');
        },
      });

      expect(readStorageItem(throwingStorage, 'test_key')).toBeNull();
    });
  });

  describe('writeStorageItem', () => {
    it('writes value successfully and returns true', () => {
      const storage = createMockStorage();
      const success = writeStorageItem(storage, 'pref_key', 'theme_dark');

      expect(success).toBe(true);
      expect(storage.getItem('pref_key')).toBe('theme_dark');
    });

    it('returns false when storage quota is exceeded', () => {
      const quotaStorage = createMockStorage({
        setItem: () => {
          throw new DOMException('QuotaExceededError', 'QuotaExceededError');
        },
      });

      const success = writeStorageItem(quotaStorage, 'big_data', 'payload');
      expect(success).toBe(false);
    });
  });

  describe('removeStorageItem', () => {
    it('removes item from storage cleanly', () => {
      const storage = createMockStorage();
      storage.setItem('temp_key', 'temp_val');
      removeStorageItem(storage, 'temp_key');

      expect(storage.getItem('temp_key')).toBeNull();
    });

    it('does not throw if removeItem raises an exception', () => {
      const throwingStorage = createMockStorage({
        removeItem: () => {
          throw new Error('Storage inaccessible');
        },
      });

      expect(() => removeStorageItem(throwingStorage, 'key')).not.toThrow();
    });
  });

  describe('resolvePlatformStorage', () => {
    it('resolves platform storage or returns null in non-browser environments', () => {
      const resolvedLocal = resolvePlatformStorage('localStorage');
      const resolvedSession = resolvePlatformStorage('sessionStorage');

      // In happy-dom/browser tests, it resolves Storage or null
      if (resolvedLocal !== null) {
        expect(typeof resolvedLocal.getItem).toBe('function');
      }
      if (resolvedSession !== null) {
        expect(typeof resolvedSession.getItem).toBe('function');
      }
    });

    it('safely catches access violations on window access', () => {
      const originalWindow = globalThis.window;
      vi.stubGlobal('window', undefined);
      expect(resolvePlatformStorage('localStorage')).toBeNull();
      vi.stubGlobal('window', originalWindow);
    });
  });
});

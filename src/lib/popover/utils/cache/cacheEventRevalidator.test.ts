import { describe, it, expect, vi } from 'vitest';
import { CacheEventRevalidator } from './cacheEventRevalidator';

describe('CacheEventRevalidator', () => {
  it('debounces multiple triggers and notifies listeners', async () => {
    vi.useFakeTimers();
    const revalidator = new CacheEventRevalidator(100);
    const callback = vi.fn();

    const unregister = revalidator.register(callback);
    expect(callback).not.toHaveBeenCalled();

    revalidator.trigger();
    revalidator.trigger();
    revalidator.trigger();

    expect(callback).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(110);
    expect(callback).toHaveBeenCalledTimes(1);

    unregister();
    revalidator.trigger();
    await vi.advanceTimersByTimeAsync(110);
    expect(callback).toHaveBeenCalledTimes(1);

    revalidator.destroy();
    vi.useRealTimers();
  });
});

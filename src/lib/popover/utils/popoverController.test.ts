import { describe, it, expect, vi } from 'vitest';
import { createPopoverController } from './popoverController';
import { createPopoverStore } from '../store';

describe('popoverController', () => {
  const mockResolver = vi.fn().mockResolvedValue({ title: 'Data' });

  it('provides imperative methods to control popovers outside React', () => {
    const store = createPopoverStore(mockResolver);
    const controller = createPopoverController(store);

    expect(controller.getState().trail).toEqual([]);

    controller.openRoot('owner-1', { key: 'root-card' });

    expect(controller.getState().trail).toHaveLength(1);
    expect(controller.getState().trail[0]?.key).toBe('root-card');

    controller.openNested(0, { key: 'nested-card', parentKey: 'root-card' });
    expect(controller.getState().trail).toHaveLength(2);

    controller.closeTopmost();
    expect(controller.getState().trail).toHaveLength(1);

    controller.togglePin('root-card');
    expect(controller.getState().floating).toHaveLength(1);

    controller.closeByKey('root-card');
    expect(controller.getState().floating).toHaveLength(0);

    controller.clearTrail();
    controller.clear();
    expect(controller.getState().trail).toEqual([]);
  });

  it('retries async data resolution via retryPopover controller method', async () => {
    const store = createPopoverStore(mockResolver);
    const controller = createPopoverController(store);

    controller.openRoot('owner-1', { key: 'card-1' });
    await controller.retryPopover('card-1');

    expect(mockResolver).toHaveBeenCalledWith(
      'card-1',
      undefined,
      undefined,
      expect.any(AbortSignal),
    );
  });

  it('throws error when controller is called with uninitialized store', () => {
    // @ts-expect-error Testing runtime invalid store pass
    const controller = createPopoverController(null);
    expect(() => controller.getState()).toThrow(/Store instance is uninitialized/);
  });
});

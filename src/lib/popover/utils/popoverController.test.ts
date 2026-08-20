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

  describe('Fluent Builder API (controller.focus)', () => {
    it('opens, configures offsets, pins, and updates data via fluent chaining', () => {
      const store = createPopoverStore(mockResolver);
      const controller = createPopoverController(store);

      const card = controller.focus('user-profile');
      expect(card.isOpen()).toBe(false);

      card.open({ offset: 12 }).pin().withOffset(15, 25).withData({ title: 'Custom User' });

      expect(card.isOpen()).toBe(true);
      expect(card.isPinned()).toBe(true);
      expect(card.offset()).toEqual({ x: 15, y: 25 });
      expect(card.data()).toEqual({ title: 'Custom User' });
      expect(card.depth()).toBe(0);

      card.unpin();
      expect(card.isPinned()).toBe(false);

      card.close();
      expect(card.isOpen()).toBe(false);
    });

    it('supports conditional mutations via .when()', () => {
      const store = createPopoverStore(mockResolver);
      const controller = createPopoverController(store);

      const card = controller.focus('dialog-card');
      card.open();

      const shouldPin = true;
      const shouldUnpin = false;

      card.when(shouldPin, (b) => b.pin()).when(shouldUnpin, (b) => b.unpin());

      expect(card.isPinned()).toBe(true);
    });
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

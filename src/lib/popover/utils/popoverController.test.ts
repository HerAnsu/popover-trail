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

    controller.togglePin('nested-card');
    expect(controller.getState().floating).toHaveLength(1);

    controller.closeByKey('nested-card');
    expect(controller.getState().floating).toHaveLength(0);

    controller.clear();
    expect(controller.getState().trail).toEqual([]);
  });
});

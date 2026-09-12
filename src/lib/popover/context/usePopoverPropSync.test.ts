import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { StoreApi } from 'zustand/vanilla';
import type { PopoverStore, PopoverStateData, PopoverResolver } from '../types';
import type { PopoverProviderProps } from './PopoverProviderProps';
import { usePopoverPropSync } from './usePopoverPropSync';
import {
  DEFAULT_CASCADE_OFFSET_STEP,
  DEFAULT_OFFSET_PX,
  DEFAULT_BASE_Z_INDEX,
  DEFAULT_MOBILE_BREAKPOINT_PX,
} from '../constants';

const capturedEffects: Array<() => void> = [];
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useRef: <T>(initial: T) => ({ current: initial }),
    useEffect: (fn: () => void) => {
      capturedEffects.push(fn);
    },
  };
});

describe('usePopoverPropSync', () => {
  const updateConfig = vi.fn();

  const createMockStore = (): StoreApi<PopoverStore> =>
    ({
      getState: () =>
        ({
          actions: { updateConfig },
        }) as unknown as PopoverStore,
    }) as unknown as StoreApi<PopoverStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    capturedEffects.length = 0;
  });

  it('synchronizes provider default options into store configuration', () => {
    const store = createMockStore();
    const activeResolver: PopoverResolver = vi.fn();
    const props: PopoverProviderProps = { children: null };

    usePopoverPropSync(store, props, activeResolver);
    for (const effect of capturedEffects) effect();

    expect(updateConfig).toHaveBeenCalledTimes(1);
    const patch = updateConfig.mock.calls[0]?.[0] as Partial<PopoverStateData>;

    expect(patch.enableArrowNavigation).toBe(true);
    expect(patch.allowDragWhenPinned).toBe(true);
    expect(patch.allowDragWhenUnpinned).toBe(true);
    expect(patch.debug).toBe(false);
    expect(patch.closePinnedDescendants).toBe(false);
    expect(patch.responsiveMode).toBe('auto');
    expect(patch.cascadeOffsetStep).toBe(DEFAULT_CASCADE_OFFSET_STEP);
    expect(patch.exitTransitionDuration).toBe(0);
    expect(patch.defaultOffset).toBe(DEFAULT_OFFSET_PX);
    expect(patch.baseZIndex).toBe(DEFAULT_BASE_Z_INDEX);
    expect(patch.mobileBreakpoint).toBe(DEFAULT_MOBILE_BREAKPOINT_PX);
    expect(patch.mountingClassName).toBe('mounting');
    expect(patch.unmountingClassName).toBe('unmounting');
    expect(patch.mountedClassName).toBe('mounted');
    expect(patch.resolveData).toBe(activeResolver);
    expect(patch.activeStackGroup).toBeNull();
    expect(patch.focusLockOptions).toBeNull();
    expect(patch.collisionConfig).toBeNull();
    expect(patch.components).toBeNull();
    expect(patch.zIndexBaseMap).toBeNull();
  });

  it('synchronizes custom configuration props into store configuration patch', () => {
    const store = createMockStore();
    const activeResolver: PopoverResolver = vi.fn();
    const props: PopoverProviderProps = {
      children: null,
      enableArrowNavigation: false,
      debug: true,
      closePinnedDescendants: true,
      cascadeOffsetStep: 32,
      exitTransitionDuration: 200,
      baseZIndex: 5000,
      mobileBreakpoint: 480,
      stackGroup: 'sidebar-group',
      zIndexBaseMap: { 'sidebar-group': 6000 },
      mountingClassName: 'enter-fade',
      initialContext: { userId: '123' },
    };

    usePopoverPropSync(store, props, activeResolver);
    for (const effect of capturedEffects) effect();

    expect(updateConfig).toHaveBeenCalledTimes(1);
    const patch = updateConfig.mock.calls[0]?.[0] as Partial<PopoverStateData>;

    expect(patch.enableArrowNavigation).toBe(false);
    expect(patch.debug).toBe(true);
    expect(patch.closePinnedDescendants).toBe(true);
    expect(patch.cascadeOffsetStep).toBe(32);
    expect(patch.exitTransitionDuration).toBe(200);
    expect(patch.baseZIndex).toBe(5000);
    expect(patch.mobileBreakpoint).toBe(480);
    expect(patch.activeStackGroup).toBe('sidebar-group');
    expect(patch.zIndexBaseMap).toEqual({ 'sidebar-group': 6000 });
    expect(patch.mountingClassName).toBe('enter-fade');
    expect(patch.context).toEqual({ userId: '123' });
  });
});

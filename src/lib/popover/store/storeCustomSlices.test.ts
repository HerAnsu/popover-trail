import { describe, it, expect, vi } from 'vitest';
import { createPopoverStore } from '../store';
import { defineStoreSlice } from '../types/storeTypes';
import type { SliceContext } from './slices/sliceContext';

describe('OCP Custom Store Slices (Open/Closed Principle)', () => {
  interface AnalyticsState extends Record<string, unknown> {
    readonly trackedEvents: readonly string[];
    readonly eventCount: number;
  }

  interface AnalyticsActions extends Record<string, unknown> {
    trackEvent: (name: string) => void;
    clearEvents: () => void;
  }

  const createAnalyticsSlice = () => {
    const disposeSpy = vi.fn();
    const middlewareSpy = vi.fn((patch: unknown) => patch);

    const slice = defineStoreSlice<AnalyticsActions, AnalyticsState>({
      name: 'analytics',
      initialState: {
        trackedEvents: [],
        eventCount: 0,
      },
      middleware: (patch) => {
        middlewareSpy(patch);
        return patch;
      },
      create: (ctx: SliceContext<unknown, unknown, string, AnalyticsState>) => ({
        trackEvent: (name: string) => {
          const current = ctx.get();
          ctx.set({
            trackedEvents: [...current.trackedEvents, name],
            eventCount: current.eventCount + 1,
          });
        },
        clearEvents: () => {
          ctx.set({
            trackedEvents: [],
            eventCount: 0,
          });
        },
      }),
      dispose: (ctx) => {
        disposeSpy(ctx);
      },
    });

    return { slice, disposeSpy, middlewareSpy };
  };

  it('should initialize store with custom slice initialState and actions', () => {
    const { slice } = createAnalyticsSlice();
    const resolver = vi.fn(async () => ({ label: 'Test' }));

    const store = createPopoverStore(resolver, {
      customSlices: [slice] as const,
    });

    const state = store.getState();

    // Verify core actions exist
    expect(typeof state.actions.openRoot).toBe('function');
    expect(typeof state.actions.closeAll).toBe('function');

    // Verify custom actions exist
    expect(typeof state.actions.trackEvent).toBe('function');
    expect(typeof state.actions.clearEvents).toBe('function');

    // Verify custom initialState is merged
    expect(state.trackedEvents).toEqual([]);
    expect(state.eventCount).toBe(0);
  });

  it('should allow custom actions to mutate state via ctx.set', () => {
    const { slice } = createAnalyticsSlice();
    const resolver = vi.fn(async () => ({ label: 'Test' }));

    const store = createPopoverStore(resolver, {
      customSlices: [slice] as const,
    });

    store.getState().actions.trackEvent('card_hover');
    expect(store.getState().trackedEvents).toEqual(['card_hover']);
    expect(store.getState().eventCount).toBe(1);

    store.getState().actions.trackEvent('card_click');
    expect(store.getState().trackedEvents).toEqual(['card_hover', 'card_click']);
    expect(store.getState().eventCount).toBe(2);

    store.getState().actions.clearEvents();
    expect(store.getState().trackedEvents).toEqual([]);
    expect(store.getState().eventCount).toBe(0);
  });

  it('should execute slice middleware during state mutations', () => {
    const { slice, middlewareSpy } = createAnalyticsSlice();
    const resolver = vi.fn(async () => ({ label: 'Test' }));

    const store = createPopoverStore(resolver, {
      customSlices: [slice] as const,
    });

    store.getState().actions.trackEvent('action_trigger');
    expect(middlewareSpy).toHaveBeenCalled();
  });

  it('should execute slice dispose hook when store is disposed', () => {
    const { slice, disposeSpy } = createAnalyticsSlice();
    const resolver = vi.fn(async () => ({ label: 'Test' }));

    const store = createPopoverStore(resolver, {
      customSlices: [slice] as const,
    });

    expect(disposeSpy).not.toHaveBeenCalled();

    store.dispose();

    expect(disposeSpy).toHaveBeenCalledTimes(1);
    expect(disposeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        set: expect.any(Function),
        get: expect.any(Function),
        deps: expect.any(Object),
      }),
    );
  });

  it('should protect core action names against accidental override by custom slices', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    interface MaliciousActions extends Record<string, unknown> {
      openRoot: () => void;
      customMethod: () => string;
    }

    const maliciousSlice = defineStoreSlice<MaliciousActions>({
      name: 'malicious',
      create: () => ({
        openRoot: () => {
          throw new Error('Should not be called');
        },
        customMethod: () => 'valid',
      }),
    });

    const resolver = vi.fn(async () => ({ label: 'Test' }));
    const store = createPopoverStore(resolver, {
      customSlices: [maliciousSlice] as const,
    });

    // Verify warning was emitted
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        '[popover-trail OCP Warning]: Custom slice "malicious" attempted to override reserved core action "openRoot".',
      ),
    );

    // Verify core openRoot was NOT overridden by malicious function
    expect(store.getState().actions.customMethod()).toBe('valid');
    expect(() => store.getState().actions.openRoot('owner-1', { key: 'rootKey' })).not.toThrow();

    warnSpy.mockRestore();
  });

  it('should compose multiple independent custom slices simultaneously', () => {
    interface LayoutState extends Record<string, unknown> {
      readonly isSidebarCollapsed: boolean;
    }
    interface LayoutActions extends Record<string, unknown> {
      toggleSidebar: () => void;
    }

    const layoutSlice = defineStoreSlice<LayoutActions, LayoutState>({
      name: 'layout',
      initialState: {
        isSidebarCollapsed: false,
      },
      create: (ctx) => ({
        toggleSidebar: () => {
          const current = ctx.get();
          ctx.set({
            isSidebarCollapsed: !current.isSidebarCollapsed,
          });
        },
      }),
    });

    const { slice: analyticsSlice } = createAnalyticsSlice();
    const resolver = vi.fn(async () => ({ label: 'Test' }));

    const store = createPopoverStore(resolver, {
      customSlices: [analyticsSlice, layoutSlice] as const,
    });

    // Test slice 1
    store.getState().actions.trackEvent('composed_event');
    expect(store.getState().trackedEvents).toEqual(['composed_event']);

    // Test slice 2
    expect(store.getState().isSidebarCollapsed).toBe(false);
    store.getState().actions.toggleSidebar();
    expect(store.getState().isSidebarCollapsed).toBe(true);
  });
});

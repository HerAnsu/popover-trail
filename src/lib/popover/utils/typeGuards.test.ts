import { describe, it, expect } from 'vitest';
import {
  isResolvedEntry,
  isLoadingEntry,
  isErrorEntry,
  getEntryState,
  createPopoverKey,
  definePopoverResolver,
  createPopoverResolver,
  isVirtualElementAnchor,
  isEventAnchor,
  toValidatedAnchorRef,
  toViewportX,
  toViewportY,
  createVirtualElement,
  isOpenRootEvent,
  isCloseEvent,
  isPinEvent,
  isUnpinEvent,
  isClearEvent,
  isStoreEvent,
  extractNumericStyle,
  assertIsTrailEntry,
  assertIsDOMRect,
  isPopoverPlacement,
} from './typeGuards';
import type { TrailEntry, PopoverStoreEvent } from '../types';

describe('typeGuards utility', () => {
  describe('TrailEntry State Guards', () => {
    const resolvedEntry: TrailEntry<string> = {
      key: 'card-1',
      isLoading: false,
      error: null,
      data: 'hello',
    };

    const loadingEntry: TrailEntry<string> = {
      key: 'card-2',
      isLoading: true,
      error: null,
      data: undefined,
    };

    const errorEntry: TrailEntry<string> = {
      key: 'card-3',
      isLoading: false,
      error: new Error('Failed to load'),
      data: undefined,
    };

    it('identifies resolved entry correctly', () => {
      expect(isResolvedEntry(resolvedEntry)).toBe(true);
      expect(isResolvedEntry(loadingEntry)).toBe(false);
      expect(isResolvedEntry(errorEntry)).toBe(false);
      expect(isResolvedEntry(undefined)).toBe(false);
    });

    it('identifies loading entry correctly', () => {
      expect(isLoadingEntry(loadingEntry)).toBe(true);
      expect(isLoadingEntry(resolvedEntry)).toBe(false);
      expect(isLoadingEntry(undefined)).toBe(false);
    });

    it('identifies error entry correctly', () => {
      expect(isErrorEntry(errorEntry)).toBe(true);
      expect(isErrorEntry(resolvedEntry)).toBe(false);
      expect(isErrorEntry(undefined)).toBe(false);
    });

    it('returns discriminated state pattern from getEntryState', () => {
      const successState = getEntryState(resolvedEntry);
      expect(successState.status).toBe('success');
      if (successState.status === 'success') {
        expect(successState.data).toBe('hello');
      }

      const loadingState = getEntryState(loadingEntry);
      expect(loadingState.status).toBe('loading');

      const errState = getEntryState(errorEntry);
      expect(errState.status).toBe('error');
      if (errState.status === 'error') {
        expect(errState.error.message).toBe('Failed to load');
      }
    });
  });

  describe('Key and Resolver Builders', () => {
    it('creates branded popover key', () => {
      const key = createPopoverKey('test-key');
      expect(key).toBe('test-key');
    });

    it('defines resolver callback', () => {
      const fn = definePopoverResolver(async () => 'data');
      const fn2 = createPopoverResolver(async () => 'data');
      expect(typeof fn).toBe('function');
      expect(typeof fn2).toBe('function');
    });
  });

  describe('Anchor Event & Virtual Element Guards', () => {
    it('identifies virtual element anchor', () => {
      const ve = { getBoundingClientRect: () => ({ x: 0, y: 0 }) as DOMRect };
      expect(isVirtualElementAnchor(ve)).toBe(true);
      expect(isVirtualElementAnchor({ currentTarget: {} as HTMLElement })).toBe(false);
    });

    it('identifies DOM event anchor', () => {
      const ev = { currentTarget: {} as HTMLElement };
      expect(isEventAnchor(ev)).toBe(true);
      expect(isEventAnchor(null)).toBe(false);
    });

    it('converts anchor event to ValidatedAnchorRef', () => {
      const refNull = toValidatedAnchorRef(null);
      expect(refNull.getBoundingClientRect()).toBeDefined();

      const btn = {} as HTMLElement;
      const refEv = toValidatedAnchorRef({ currentTarget: btn });
      expect(refEv.getBoundingClientRect).toBeDefined();
    });

    it('creates virtual element from coordinates', () => {
      const ve = createVirtualElement(150, 250, 100, 50);
      expect(ve.getBoundingClientRect).toBeDefined();
      const rect = ve.getBoundingClientRect() ?? {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        toJSON: () => {},
      };
      expect(rect.x).toBe(150);
      expect(rect.y).toBe(250);
      expect(rect.width).toBe(100);
      expect(rect.height).toBe(50);
    });

    it('handles NaN/Infinity in createVirtualElement safely', () => {
      const ve = createVirtualElement(Number.NaN, Infinity, -10, -20) as {
        getBoundingClientRect: () => DOMRect;
      };
      const rect = ve.getBoundingClientRect() ?? {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        toJSON: () => {},
      };
      expect(rect.x).toBe(0);
      expect(rect.y).toBe(0);
      expect(rect.width).toBe(0);
      expect(rect.height).toBe(0);
    });

    it('creates branded viewport coordinates', () => {
      expect(toViewportX(100)).toBe(100);
      expect(toViewportX(Number.NaN)).toBe(0);
      expect(toViewportY(200)).toBe(200);
      expect(toViewportY(Infinity)).toBe(0);
    });
  });

  describe('Store Event Discriminator Guards', () => {
    const openEv: PopoverStoreEvent<unknown> = { type: 'open_root', key: 'card-1', ownerId: 'o1' };
    const closeEv: PopoverStoreEvent<unknown> = { type: 'close', keys: ['card-1'], key: 'card-1' };
    const pinEv: PopoverStoreEvent<unknown> = { type: 'pin', key: 'card-1' };
    const unpinEv: PopoverStoreEvent<unknown> = { type: 'unpin', key: 'card-1' };
    const clearEv: PopoverStoreEvent<unknown> = { type: 'clear' };

    it('guards specific store event types', () => {
      expect(isOpenRootEvent(openEv)).toBe(true);
      expect(isCloseEvent(closeEv)).toBe(true);
      expect(isPinEvent(pinEv)).toBe(true);
      expect(isUnpinEvent(unpinEv)).toBe(true);
      expect(isClearEvent(clearEv)).toBe(true);

      expect(isStoreEvent(openEv, 'open_root')).toBe(true);
      expect(isStoreEvent(closeEv, 'open_root')).toBe(false);
    });
  });

  describe('Style and Runtime Assertion Guards', () => {
    it('extracts numeric style value from string or number', () => {
      expect(extractNumericStyle(120)).toBe(120);
      expect(extractNumericStyle('120px')).toBe(120);
      expect(extractNumericStyle('invalid')).toBe(0);
      expect(extractNumericStyle(Number.NaN)).toBe(0);
      expect(extractNumericStyle(null)).toBe(0);
    });

    it('assertIsTrailEntry throws TypeError on non-entry objects', () => {
      expect(() => assertIsTrailEntry({ key: 'test' })).not.toThrow();
      expect(() => assertIsTrailEntry(null)).toThrow(TypeError);
      expect(() => assertIsTrailEntry({ notKey: 123 })).toThrow(TypeError);
    });

    it('assertIsDOMRect throws TypeError on non-DOMRect objects', () => {
      expect(() => assertIsDOMRect({ width: 100, height: 50 })).not.toThrow();
      expect(() => assertIsDOMRect(null)).toThrow(TypeError);
      expect(() => assertIsDOMRect({ width: '100' })).toThrow(TypeError);
    });

    it('validates popover placement string', () => {
      expect(isPopoverPlacement('bottom')).toBe(true);
      expect(isPopoverPlacement('top-start')).toBe(true);
      expect(isPopoverPlacement('invalid-placement')).toBe(false);
    });
  });
});

import { describe, it, expect, vi } from 'vitest';
import {
  Ok,
  Err,
  isOk,
  isErr,
  mapResult,
  flatMapResult,
  unwrapOr,
  wrapResult,
  wrapAsyncResult,
} from './result';
import { createDisposable } from './disposable';
import {
  FixedCenterLayoutStrategy,
  DockedBottomLayoutStrategy,
  RelativeFloatingLayoutStrategy,
  LayoutStrategyRegistry,
} from './layoutStrategies';
import { createCQRSBuses } from '../store/cqrs';
import type { PopoverStore } from '../types/storeTypes';
import {
  assertNonNullable,
  assertValidPopoverKey,
  assertValidOwnerId,
  assertValidRect,
} from './assertions';
import { RectBounds } from './valueObjects';
import { PopoverError } from './errors';

describe('Phase 6 Advanced Engineering & Clean Architecture Modules', () => {
  describe('Result<T, E> Pattern', () => {
    it('constructs Ok and Err variants correctly', () => {
      const okRes = Ok(42);
      expect(isOk(okRes)).toBe(true);
      expect(isErr(okRes)).toBe(false);
      expect(okRes.data).toBe(42);

      const errRes = Err(new Error('Failed'));
      expect(isOk(errRes)).toBe(false);
      expect(isErr(errRes)).toBe(true);
      expect(errRes.error.message).toBe('Failed');
    });

    it('supports mapResult, flatMapResult, and unwrapOr', () => {
      const res = Ok(10);
      const mapped = mapResult(res, (x) => x * 2);
      expect(isOk(mapped) && mapped.data).toBe(20);

      const flatMapped = flatMapResult(mapped, (x) => Ok(x + 5));
      expect(isOk(flatMapped) && flatMapped.data).toBe(25);

      expect(unwrapOr(res, 0)).toBe(10);
      expect(unwrapOr(Err('err'), 99)).toBe(99);
    });

    it('wraps throwing sync functions and promises into Result safely', async () => {
      const okSync = wrapResult(() => 'hello');
      expect(isOk(okSync) && okSync.data).toBe('hello');

      const errSync = wrapResult(() => {
        throw new Error('boom');
      });
      expect(isErr(errSync)).toBe(true);

      const okAsync = await wrapAsyncResult(Promise.resolve(123));
      expect(isOk(okAsync) && okAsync.data).toBe(123);

      const errAsync = await wrapAsyncResult(Promise.reject(new Error('async err')));
      expect(isErr(errAsync)).toBe(true);
    });
  });

  describe('Explicit Resource Management (Disposable)', () => {
    it('invokes cleanup function on dispose() and ignores subsequent calls', () => {
      const cleanup = vi.fn();
      const disposable = createDisposable(cleanup);

      disposable.dispose();
      expect(cleanup).toHaveBeenCalledTimes(1);

      disposable.dispose();
      expect(cleanup).toHaveBeenCalledTimes(1);
    });

    it('supports Symbol.dispose method if available', () => {
      const cleanup = vi.fn();
      const disposable = createDisposable(cleanup);

      if (typeof Symbol !== 'undefined' && 'dispose' in Symbol) {
        disposable[Symbol.dispose]?.();
        expect(cleanup).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('Layout Strategies Engine', () => {
    it('FixedCenter Strategy centers popover in viewport', () => {
      const strategy = new FixedCenterLayoutStrategy();
      const pos = strategy.computePosition({
        triggerRect: RectBounds.of(0, 0, 100, 50),
        popoverRect: RectBounds.of(0, 0, 400, 200),
        viewportWidth: 1000,
        viewportHeight: 800,
      });

      expect(pos.x).toBe(300);
      expect(pos.y).toBe(300);
    });

    it('DockedBottom Strategy docks popover at bottom of viewport', () => {
      const strategy = new DockedBottomLayoutStrategy();
      const pos = strategy.computePosition({
        triggerRect: RectBounds.of(0, 0, 100, 50),
        popoverRect: RectBounds.of(0, 0, 400, 200),
        viewportHeight: 800,
      });

      expect(pos.x).toBe(0);
      expect(pos.y).toBe(600);
    });

    it('RelativeFloating Strategy positions popover relative to trigger', () => {
      const strategy = new RelativeFloatingLayoutStrategy();
      const pos = strategy.computePosition({
        triggerRect: RectBounds.of(100, 50, 200, 40),
        placement: 'bottom',
        offset: 10,
      });

      expect(pos.x).toBe(50);
      expect(pos.y).toBe(150);
    });

    it('Registry allows retrieving default or registered strategy', () => {
      const registry = new LayoutStrategyRegistry();
      expect(registry.get('fixed-center').id).toBe('fixed-center');
      expect(registry.get('unknown').id).toBe('floating-ui');
    });
  });

  describe('CQRS Query & Command Buses', () => {
    it('creates queryBus and commandBus correctly', () => {
      const mockState = {
        trail: [{ key: 'p-1', status: 'resolved', data: { val: 1 } }],
        floating: [],
        ownerId: 'owner-1',
        pinnedStates: { 'p-1': true },
        offsets: { 'p-1': { x: 10, y: 20 } },
        context: null,
      };

      const mockActions = {
        closeByKey: vi.fn(),
        togglePin: vi.fn(),
      };

      const mockStore = { ...mockState, actions: mockActions } as unknown as PopoverStore;

      const { queryBus, commandBus } = createCQRSBuses(mockStore);

      expect(queryBus.ownerId).toBe('owner-1');
      expect(queryBus.isPinned('p-1')).toBe(true);
      expect(queryBus.getOffset('p-1')).toEqual({ x: 10, y: 20 });
      expect(queryBus.getEntry('p-1')?.key).toBe('p-1');

      commandBus.close('p-1');
      expect(mockActions.closeByKey).toHaveBeenCalledWith('p-1');
    });
  });

  describe('Design by Contract Precondition Assertions', () => {
    it('assertNonNullable passes for valid values and throws for null/undefined', () => {
      expect(() => assertNonNullable(123, 'testVar')).not.toThrow();
      expect(() => assertNonNullable(null, 'testVar')).toThrow(PopoverError);
      expect(() => assertNonNullable(undefined, 'testVar')).toThrow(PopoverError);
    });

    it('assertValidPopoverKey validates keys', () => {
      expect(() => assertValidPopoverKey('validKey')).not.toThrow();
      expect(() => assertValidPopoverKey('')).toThrow(PopoverError);
      expect(() => assertValidPopoverKey(123)).toThrow(PopoverError);
    });

    it('assertValidOwnerId validates owner IDs', () => {
      expect(() => assertValidOwnerId('owner-1')).not.toThrow();
      expect(() => assertValidOwnerId('')).toThrow(PopoverError);
    });

    it('assertValidRect validates DOMRect geometry', () => {
      const validRect = { top: 0, left: 0, width: 100, height: 100 } as DOMRect;
      expect(() => assertValidRect(validRect)).not.toThrow();

      const invalidRect = { top: NaN, left: 0, width: 100, height: 100 } as DOMRect;
      expect(() => assertValidRect(invalidRect)).toThrow(PopoverError);
    });
  });
});

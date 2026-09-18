import { describe, it, expect } from 'vitest';
import {
  isResolvedEntry,
  isLoadingEntry,
  isErrorEntry,
  getEntryState,
  createPopoverKey,
  definePopoverResolver,
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
  isNumberInRange,
  isCoordinateWithinBounds,
  areCoordinatesWithinBounds,
  toFiniteOrDefault,
  isFinitePoint,
  isFiniteRect,
  isValidBoundingBox,
  isValidQuadItem,
  boxesIntersect,
  isTextEditableElement,
  isClickableElement,
  canElementReceiveFocus,
  isFocusWithin,
  isPointerOrMouseEvent,
  isContainedInPath,
  isBottomSheetMode,
  isCenteredModalMode,
  isDockedTopMode,
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

      const staticEntry: TrailEntry<void> = {
        key: 'static-card',
        status: 'success',
        isLoading: false,
        error: null,
        data: undefined,
      };
      expect(isResolvedEntry(staticEntry)).toBe(true);
      const staticState = getEntryState(staticEntry);
      expect(staticState.status).toBe('success');
      expect(staticState.isLoading).toBe(false);
    });
  });

  describe('Key and Resolver Builders', () => {
    it('creates branded popover key', () => {
      const key = createPopoverKey('test-key');
      expect(key).toBe('test-key');
    });

    it('defines resolver callback', () => {
      const fn = definePopoverResolver(async () => 'data');
      expect(typeof fn).toBe('function');
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

  describe('Numeric and Coordinate Guards', () => {
    it('validates numbers in range with isNumberInRange', () => {
      expect(isNumberInRange(5, 0, 10)).toBe(true);
      expect(isNumberInRange(0, 0, 10)).toBe(true);
      expect(isNumberInRange(10, 0, 10)).toBe(true);
      expect(isNumberInRange(-1, 0, 10)).toBe(false);
      expect(isNumberInRange(11, 0, 10)).toBe(false);
      expect(isNumberInRange(Number.NaN, 0, 10)).toBe(false);
      expect(isNumberInRange('5', 0, 10)).toBe(false);
    });

    it('validates coordinates with areCoordinatesWithinBounds', () => {
      expect(areCoordinatesWithinBounds(100, -200)).toBe(true);
      expect(areCoordinatesWithinBounds(10000, -10000)).toBe(true);
      expect(areCoordinatesWithinBounds(10001, 0)).toBe(false);
      expect(areCoordinatesWithinBounds(0, -10001)).toBe(false);
      expect(isCoordinateWithinBounds(500)).toBe(true);
      expect(isCoordinateWithinBounds(Number.NaN)).toBe(false);
    });

    it('sanitizes numbers with toFiniteOrDefault', () => {
      expect(toFiniteOrDefault(42, 0)).toBe(42);
      expect(toFiniteOrDefault(Number.NaN, 10)).toBe(10);
      expect(toFiniteOrDefault(Infinity, -1)).toBe(-1);
      expect(toFiniteOrDefault('42', 5)).toBe(5);
      expect(toFiniteOrDefault(undefined, 99)).toBe(99);
    });

    it('validates 2D points and rects', () => {
      expect(isFinitePoint({ x: 10, y: 20 })).toBe(true);
      expect(isFinitePoint({ x: 10, y: Number.NaN })).toBe(false);
      expect(isFinitePoint(null)).toBe(false);
      expect(isFinitePoint({ x: '10', y: 20 })).toBe(false);

      expect(isFiniteRect({ top: 0, left: 100 })).toBe(true);
      expect(isFiniteRect({ top: Infinity, left: 100 })).toBe(false);
      expect(isFiniteRect(undefined)).toBe(false);
    });
  });

  describe('Spatial QuadTree Guards', () => {
    it('validates BoundingBox with isValidBoundingBox', () => {
      expect(isValidBoundingBox({ x: 0, y: 0, width: 100, height: 100 })).toBe(true);
      expect(isValidBoundingBox({ x: -50, y: -20, width: 0, height: 0 })).toBe(true);
      expect(isValidBoundingBox({ x: 0, y: 0, width: -10, height: 100 })).toBe(false);
      expect(isValidBoundingBox({ x: Number.NaN, y: 0, width: 100, height: 100 })).toBe(false);
      expect(isValidBoundingBox(null)).toBe(false);
    });

    it('validates QuadItem with isValidQuadItem', () => {
      expect(isValidQuadItem({ id: 'item-1', bounds: { x: 0, y: 0, width: 10, height: 10 } })).toBe(
        true,
      );
      expect(isValidQuadItem({ id: '', bounds: { x: 0, y: 0, width: 10, height: 10 } })).toBe(
        false,
      );
      expect(isValidQuadItem({ id: 'item-2', bounds: null })).toBe(false);
    });

    it('evaluates bounding box intersections with boxesIntersect', () => {
      const boxA = { x: 0, y: 0, width: 10, height: 10 };
      const boxB = { x: 5, y: 5, width: 10, height: 10 };
      const boxC = { x: 20, y: 20, width: 10, height: 10 };
      expect(boxesIntersect(boxA, boxB)).toBe(true);
      expect(boxesIntersect(boxA, boxC)).toBe(false);
    });
  });

  describe('DOM Interaction & Accessibility Guards', () => {
    it('handles non-DOM and falsy environments safely', () => {
      expect(isTextEditableElement(null)).toBe(false);
      expect(isTextEditableElement({})).toBe(false);
      expect(isClickableElement(null)).toBe(false);
      expect(isClickableElement({})).toBe(false);
      expect(canElementReceiveFocus(null)).toBe(false);
      expect(canElementReceiveFocus({})).toBe(false);
      expect(isContainedInPath([], null, null)).toBe(false);
      expect(isFocusWithin(null, null)).toBe(true);
      expect(isPointerOrMouseEvent(null)).toBe(false);
      expect(isPointerOrMouseEvent({})).toBe(false);
    });

    it('validates mock elements in simulated DOM environment', () => {
      class MockHTMLElement {
        public readonly isMock = true;
      }
      class MockMouseEvent {
        public readonly isMock = true;
      }

      const originalWindow = globalThis.window;
      const originalDocument = globalThis.document;
      const originalHTMLElement = globalThis.HTMLElement;
      const originalMouseEvent = globalThis.MouseEvent;

      try {
        // @ts-expect-error - mock globals for DOM test
        globalThis.HTMLElement = MockHTMLElement;
        // @ts-expect-error - mock globals for DOM test
        globalThis.MouseEvent = MockMouseEvent;
        // @ts-expect-error - mock globals for DOM test
        globalThis.window = { HTMLElement: MockHTMLElement };
        const mockChild = Object.assign(new MockHTMLElement(), {
          tagName: 'INPUT',
          isContentEditable: false,
          focus: () => {},
        });
        const mockBtn = Object.assign(new MockHTMLElement(), {
          tagName: 'BUTTON',
          focus: () => {},
        });
        const mockBody = { contains: (el: unknown) => el === mockChild };
        const mockParent = Object.assign(new MockHTMLElement(), {
          contains: (el: unknown) => el === mockChild,
        });

        const mockDoc = {
          body: mockBody,
          activeElement: mockChild,
        } as never;

        Object.defineProperty(globalThis, 'document', {
          value: mockDoc,
          configurable: true,
          writable: true,
        });

        expect(isTextEditableElement(mockChild)).toBe(true);
        expect(isTextEditableElement(mockBtn)).toBe(false);
        expect(isClickableElement(mockBtn)).toBe(true);
        expect(canElementReceiveFocus(mockChild)).toBe(true);
        expect(
          isContainedInPath(
            [mockChild, mockParent] as never,
            mockChild as never,
            mockParent as never,
          ),
        ).toBe(true);
        expect(isFocusWithin(mockParent as never, mockChild as never)).toBe(true);
        expect(isPointerOrMouseEvent(new MockMouseEvent())).toBe(true);
      } finally {
        globalThis.window = originalWindow;
        globalThis.document = originalDocument;
        globalThis.HTMLElement = originalHTMLElement;
        globalThis.MouseEvent = originalMouseEvent;
      }
    });
  });

  describe('Responsive Placement Mode Guards', () => {
    it('evaluates bottom-sheet mode with isBottomSheetMode', () => {
      expect(isBottomSheetMode('bottom-sheet', false)).toBe(true);
      expect(isBottomSheetMode('auto', true)).toBe(true);
      expect(isBottomSheetMode('auto', false)).toBe(false);
      expect(isBottomSheetMode(undefined, false, 'docked-bottom')).toBe(true);
      expect(isBottomSheetMode('modal', false)).toBe(false);
    });

    it('evaluates centered modal mode with isCenteredModalMode', () => {
      expect(isCenteredModalMode('modal')).toBe(true);
      expect(isCenteredModalMode(undefined, 'fixed-center')).toBe(true);
      expect(isCenteredModalMode('bottom-sheet')).toBe(false);
    });

    it('evaluates docked-top mode with isDockedTopMode', () => {
      expect(isDockedTopMode('docked-top')).toBe(true);
      expect(isDockedTopMode('docked-bottom')).toBe(false);
      expect(isDockedTopMode(undefined)).toBe(false);
    });
  });
});

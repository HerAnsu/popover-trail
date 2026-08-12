import type { VirtualElement } from '@floating-ui/react';
import type {
  AnchorEventLike,
  PopoverDisplayOptions,
  PopoverEntryDiscriminatedState,
  PopoverKey,
  PopoverMiddleware,
  PopoverPlacement,
  PopoverResolver,
  PopoverStoreEvent,
  TrailEntry,
  ValidatedAnchorRef,
  ViewportX,
  ViewportY,
} from '../types';
import { VALID_PLACEMENTS_SET } from '../constants';

/**
 * Type Guard function checking if a TrailEntry has finished resolving data successfully.
 * Narrows entry.data to TData (eliminating undefined) within conditional blocks.
 *
 * @template TData - The resolved data payload type.
 * @param entry - The TrailEntry to inspect.
 * @returns True if entry has resolved data without error or loading state.
 *
 * @example
 * ```typescript
 * if (isResolvedEntry(entry)) {
 *   console.log(entry.data.title); // TypeScript knows entry.data is TData
 * }
 * ```
 *
 * @see {@link isLoadingEntry}
 * @see {@link isErrorEntry}
 * @see {@link getEntryState}
 */
export function isResolvedEntry<TData>(
  entry: TrailEntry<TData> | undefined,
): entry is TrailEntry<TData> & { data: TData; isLoading: false; error: null } {
  return (
    entry !== undefined && !entry.isLoading && entry.error === null && entry.data !== undefined
  );
}

/**
 * Type Guard checking if a TrailEntry is currently performing data resolution.
 *
 * @template TData - The resolved data payload type.
 * @param entry - The TrailEntry to inspect.
 * @returns True if entry is loading.
 *
 * @example
 * ```typescript
 * if (isLoadingEntry(entry)) {
 *   return <Spinner />;
 * }
 * ```
 *
 * @see {@link isResolvedEntry}
 * @see {@link isErrorEntry}
 */
export function isLoadingEntry<TData>(
  entry: TrailEntry<TData> | undefined,
): entry is TrailEntry<TData> & { isLoading: true } {
  return entry !== undefined && entry.isLoading === true;
}

/**
 * Type Guard checking if a TrailEntry encountered a resolution error.
 *
 * @template TData - The resolved data payload type.
 * @param entry - The TrailEntry to inspect.
 * @returns True if entry has a non-null Error.
 *
 * @example
 * ```typescript
 * if (isErrorEntry(entry)) {
 *   return <ErrorMessage error={entry.error} />;
 * }
 * ```
 *
 * @see {@link isResolvedEntry}
 * @see {@link isLoadingEntry}
 */
export function isErrorEntry<TData>(
  entry: TrailEntry<TData> | undefined,
): entry is TrailEntry<TData> & { error: Error } {
  return entry !== undefined && entry.error instanceof Error;
}

/**
 * Extracts a discriminated state object from a TrailEntry for pattern matching (`switch (state.status)`).
 *
 * @template TData - The resolved data payload type.
 * @param entry - The TrailEntry to inspect.
 * @returns Discriminated union state object.
 *
 * @example
 * ```typescript
 * const state = getEntryState(entry);
 * switch (state.status) {
 *   case 'loading': return <Spinner />;
 *   case 'error': return <ErrorView error={state.error} />;
 *   case 'success': return <CardView data={state.data} />;
 * }
 * ```
 *
 * @see {@link isResolvedEntry}
 */
export function getEntryState<TData>(
  entry: TrailEntry<TData>,
): PopoverEntryDiscriminatedState<TData> {
  if (entry.isLoading) {
    return { status: 'loading', isLoading: true, data: undefined, error: null };
  }
  if (entry.error) {
    return { status: 'error', isLoading: false, data: undefined, error: entry.error };
  }
  if (isResolvedEntry(entry)) {
    return { status: 'success', isLoading: false, data: entry.data, error: null };
  }
  return { status: 'loading', isLoading: true, data: undefined, error: null };
}

/**
 * Utility constructor for creating branded PopoverKey string instances.
 *
 * @template T - The string key type.
 * @param key - The string key value.
 * @returns A branded PopoverKey value.
 */
export function createPopoverKey<T extends string>(key: T): PopoverKey<T> {
  return key as PopoverKey<T>;
}

/**
 * Helper function providing automatic type inference when creating custom PopoverResolver functions.
 *
 * @template TData - The resolved data payload type.
 * @template TContext - The external context type.
 * @param resolver - The resolver callback function.
 * @returns The typed PopoverResolver callback.
 */
export function definePopoverResolver<TData = unknown, TContext = unknown>(
  resolver: PopoverResolver<TData, TContext>,
): PopoverResolver<TData, TContext> {
  return resolver;
}

/** Alias for definePopoverResolver for backward compatibility. */
export function createPopoverResolver<TData = unknown, TContext = unknown>(
  resolver: PopoverResolver<TData, TContext>,
): PopoverResolver<TData, TContext> {
  return definePopoverResolver(resolver);
}

/** Type guard checking if an AnchorEventLike source is a Floating UI VirtualElement. */
export function isVirtualElementAnchor(source: AnchorEventLike): source is VirtualElement {
  return Boolean(
    source &&
    'getBoundingClientRect' in source &&
    typeof source.getBoundingClientRect === 'function' &&
    !('currentTarget' in source),
  );
}

/** Type guard checking if an AnchorEventLike source is a DOM event with a currentTarget HTMLElement. */
export function isEventAnchor(
  source: AnchorEventLike,
): source is { currentTarget: HTMLElement; stopPropagation?: () => void } {
  return Boolean(source && 'currentTarget' in source && source.currentTarget);
}

function createDefaultDOMRect(): DOMRect {
  if (typeof DOMRect !== 'undefined') {
    return new DOMRect(0, 0, 0, 0);
  }
  return {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    toJSON: () => ({}),
  } satisfies DOMRect;
}

const NULL_ANCHOR_REF: ValidatedAnchorRef = Object.freeze({
  getBoundingClientRect: createDefaultDOMRect,
});

/**
 * Validates and converts an AnchorEventLike source into a ValidatedAnchorRef with geometry bounds.
 */
export function toValidatedAnchorRef(source: AnchorEventLike): ValidatedAnchorRef {
  if (!source) {
    return NULL_ANCHOR_REF;
  }
  if ('getBoundingClientRect' in source && typeof source.getBoundingClientRect === 'function') {
    return source as ValidatedAnchorRef;
  }
  if (
    'currentTarget' in source &&
    source.currentTarget &&
    typeof source.currentTarget.getBoundingClientRect === 'function'
  ) {
    const el = source.currentTarget;
    return {
      currentTarget: el,
      getBoundingClientRect: () => el.getBoundingClientRect(),
    };
  }
  return NULL_ANCHOR_REF;
}

/** Converter creating a branded ViewportX coordinate value. */
export function toViewportX(x: number): ViewportX {
  return (Number.isFinite(x) ? x : 0) as ViewportX;
}

/** Converter creating a branded ViewportY coordinate value. */
export function toViewportY(y: number): ViewportY {
  return (Number.isFinite(y) ? y : 0) as ViewportY;
}

/**
 * Utility helper to create a VirtualElement / AnchorEventLike object from coordinates.
 * Useful for opening popovers at mouse clicks, context menus, or canvas coordinates.
 */
export function createVirtualElement(x: number, y: number, width = 0, height = 0): AnchorEventLike {
  const safeX = Number.isFinite(x) ? x : 0;
  const safeY = Number.isFinite(y) ? y : 0;
  const safeWidth = Number.isFinite(width) ? Math.max(0, width) : 0;
  const safeHeight = Number.isFinite(height) ? Math.max(0, height) : 0;

  return {
    getBoundingClientRect: () =>
      ({
        x: safeX,
        y: safeY,
        left: safeX,
        top: safeY,
        right: safeX + safeWidth,
        bottom: safeY + safeHeight,
        width: safeWidth,
        height: safeHeight,
        toJSON: () => ({
          x: safeX,
          y: safeY,
          left: safeX,
          top: safeY,
          right: safeX + safeWidth,
          bottom: safeY + safeHeight,
          width: safeWidth,
          height: safeHeight,
        }),
      }) as DOMRect,
  };
}

/** Type guard for 'open_root' event. */
export function isOpenRootEvent<TData>(
  event: PopoverStoreEvent<TData>,
): event is Extract<PopoverStoreEvent<TData>, { type: 'open_root' }> {
  return isStoreEvent(event, 'open_root');
}

/** Type guard for 'push_nested' event. */
export function isPushNestedEvent<TData>(
  event: PopoverStoreEvent<TData>,
): event is Extract<PopoverStoreEvent<TData>, { type: 'push_nested' }> {
  return isStoreEvent(event, 'push_nested');
}

/** Type guard for 'close' event. */
export function isCloseEvent<TData>(
  event: PopoverStoreEvent<TData>,
): event is Extract<PopoverStoreEvent<TData>, { type: 'close' }> {
  return isStoreEvent(event, 'close');
}

/** Type guard for 'pin' event. */
export function isPinEvent<TData>(
  event: PopoverStoreEvent<TData>,
): event is Extract<PopoverStoreEvent<TData>, { type: 'pin' }> {
  return isStoreEvent(event, 'pin');
}

/** Type guard for 'unpin' event. */
export function isUnpinEvent<TData>(
  event: PopoverStoreEvent<TData>,
): event is Extract<PopoverStoreEvent<TData>, { type: 'unpin' }> {
  return isStoreEvent(event, 'unpin');
}

/** Type guard for 'resolve_start' event. */
export function isResolveStartEvent<TData>(
  event: PopoverStoreEvent<TData>,
): event is Extract<PopoverStoreEvent<TData>, { type: 'resolve_start' }> {
  return isStoreEvent(event, 'resolve_start');
}

/** Type guard for 'resolve_success' event. */
export function isResolveSuccessEvent<TData>(
  event: PopoverStoreEvent<TData>,
): event is Extract<PopoverStoreEvent<TData>, { type: 'resolve_success' }> {
  return isStoreEvent(event, 'resolve_success');
}

/** Type guard for 'resolve_error' event. */
export function isResolveErrorEvent<TData>(
  event: PopoverStoreEvent<TData>,
): event is Extract<PopoverStoreEvent<TData>, { type: 'resolve_error' }> {
  return isStoreEvent(event, 'resolve_error');
}

/** Type guard for 'clear' event. */
export function isClearEvent<TData>(
  event: PopoverStoreEvent<TData>,
): event is Extract<PopoverStoreEvent<TData>, { type: 'clear' }> {
  return isStoreEvent(event, 'clear');
}

/**
 * Generic type guard filtering a PopoverStoreEvent by its discriminator type string.
 *
 * @template TData - The resolved data payload type.
 * @template TType - Targeted event discriminator string literal.
 * @param event - Event object to inspect.
 * @param type - Target event type string.
 * @returns True if event.type === type with narrowed payload properties.
 *
 * @example
 * ```typescript
 * if (isStoreEvent(event, 'resolve_success')) {
 *   console.log(event.data); // TS knows event is resolve_success with data payload
 * }
 * ```
 */
export function isStoreEvent<
  TData = unknown,
  TType extends PopoverStoreEvent<TData>['type'] = PopoverStoreEvent<TData>['type'],
>(
  event: PopoverStoreEvent<TData>,
  type: TType,
): event is Extract<PopoverStoreEvent<TData>, { type: TType }> {
  return event.type === type;
}

/**
 * Type-safe configuration builder helper preserving literal types for display options.
 */
export function definePopoverConfig<T extends PopoverDisplayOptions>(config: T): T {
  return config;
}

/**
 * Type-safe middleware definition helper ensuring state patch structural validity.
 */
export function definePopoverMiddleware<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  middleware: PopoverMiddleware<TData, TContext, TPopoverKey>,
): PopoverMiddleware<TData, TContext, TPopoverKey> {
  return middleware;
}

/**
 * Safely extracts a numeric value from a style property (number, CSS pixel string like '120px', or undefined),
 * avoiding unsafe 'as number' type assertions.
 */
export function extractNumericStyle(val: unknown): number {
  if (typeof val === 'number') return Number.isNaN(val) ? 0 : val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Assertion guard verifying a value is a valid TrailEntry object.
 */
export function assertIsTrailEntry<TData = unknown>(
  value: unknown,
): asserts value is TrailEntry<TData> {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('key' in value) ||
    typeof value.key !== 'string'
  ) {
    throw new TypeError(`Expected TrailEntry object, received: ${typeof value}`);
  }
}

/**
 * Assertion guard verifying a value is a valid DOMRect object.
 */
export function assertIsDOMRect(value: unknown): asserts value is DOMRect {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('width' in value) ||
    !('height' in value) ||
    typeof value.width !== 'number' ||
    typeof value.height !== 'number'
  ) {
    throw new TypeError(`Expected DOMRect object, received: ${typeof value}`);
  }
}

/**
 * Type guard checking if a string value is a valid Floating UI PopoverPlacement direction.
 */
export function isPopoverPlacement(val: unknown): val is PopoverPlacement {
  return typeof val === 'string' && VALID_PLACEMENTS_SET.has(val);
}

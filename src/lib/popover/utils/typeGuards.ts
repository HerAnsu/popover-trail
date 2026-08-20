import type { VirtualElement } from '@floating-ui/react';
import type { TrailEntry, PopoverEntryDiscriminatedState } from '../types/entryTypes';
import type { PopoverPlacement, PopoverDisplayOptions } from '../types/configTypes';
import type { PopoverStoreEvent } from '../types/eventTypes';
import type {
  AnchorEventLike,
  ValidatedAnchorRef,
  ViewportX,
  ViewportY,
  PopoverResolver,
  PopoverMiddleware,
} from '../types/storeTypes';
import type { PopoverKey } from '../types/branded';
import { VALID_PLACEMENTS_SET } from '../constants';

/**
 * Type guard verifying if a `TrailEntry` has resolved data successfully.
 * Narrows `entry.data` to `TData` (non-undefined) and `entry.error` to `null`.
 *
 * @template TData - Resolved data payload type.
 * @param entry - TrailEntry candidate.
 * @returns `true` if resolved, `false` otherwise.
 *
 * @example
 * ```typescript
 * if (isResolvedEntry(entry)) {
 *   console.log(entry.data.name); // data is typed as TData
 * }
 * ```
 */
export function isResolvedEntry<TData>(
  entry: TrailEntry<TData> | undefined,
): entry is TrailEntry<TData> & { data: TData; isLoading: false; error: null } {
  return (
    entry !== undefined && !entry.isLoading && entry.error === null && entry.data !== undefined
  );
}

/**
 * Type guard verifying if a `TrailEntry` is actively fetching data.
 *
 * @template TData - Resolved data payload type.
 * @param entry - TrailEntry candidate.
 * @returns `true` if loading.
 */
export function isLoadingEntry<TData>(
  entry: TrailEntry<TData> | undefined,
): entry is TrailEntry<TData> & { isLoading: true } {
  return entry?.isLoading === true;
}

/**
 * Type guard verifying if a `TrailEntry` encountered an error during data resolution.
 * Narrows `entry.error` to `Error`.
 *
 * @template TData - Resolved data payload type.
 * @param entry - TrailEntry candidate.
 * @returns `true` if in error state.
 */
export function isErrorEntry<TData>(
  entry: TrailEntry<TData> | undefined,
): entry is TrailEntry<TData> & { error: Error } {
  return entry !== undefined && entry.error instanceof Error;
}

/**
 * Extracts a normalized discriminated state object from a `TrailEntry` for switch/case pattern matching.
 *
 * @template TData - Resolved data payload type.
 * @param entry - Target trail entry.
 * @returns Discriminated state with `{ status: 'loading' | 'error' | 'success', data, error, isLoading }`.
 *
 * @example
 * ```typescript
 * const state = getEntryState(entry);
 * switch (state.status) {
 *   case 'success': return renderSuccess(state.data);
 *   case 'error': return renderError(state.error);
 *   case 'loading': return renderLoading();
 * }
 * ```
 */
export function getEntryState<TData>(
  entry: TrailEntry<TData> | undefined | null,
): PopoverEntryDiscriminatedState<TData> {
  if (!entry) {
    return { status: 'loading', isLoading: true, data: undefined, error: null };
  }
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
 * Constructs a nominal `PopoverKey` branded string identifier.
 *
 * @template T - String key literal type.
 * @param key - Raw key string.
 * @returns Branded `PopoverKey<T>`.
 */
export function createPopoverKey<T extends string>(key: T): PopoverKey<T> {
  return key as PopoverKey<T>;
}

/**
 * Identity helper for defining a `PopoverResolver` with full generic type inference.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - External context type.
 * @param resolver - Resolver implementation function.
 * @returns The same resolver function with enforced types.
 *
 * @example
 * ```typescript
 * const userResolver = definePopoverResolver(async (key, parentData, ctx) => {
 *   return fetchUserData(key);
 * });
 * ```
 */
export function definePopoverResolver<TData = unknown, TContext = unknown>(
  resolver: PopoverResolver<TData, TContext>,
): PopoverResolver<TData, TContext> {
  return resolver;
}

/** Alias for `definePopoverResolver` for backward compatibility. */
export function createPopoverResolver<TData = unknown, TContext = unknown>(
  resolver: PopoverResolver<TData, TContext>,
): PopoverResolver<TData, TContext> {
  return definePopoverResolver(resolver);
}

/** Type guard checking if an `AnchorEventLike` source is a Floating UI `VirtualElement`. */
export function isVirtualElementAnchor(source?: AnchorEventLike | null): source is VirtualElement {
  return Boolean(
    source &&
    'getBoundingClientRect' in source &&
    typeof source.getBoundingClientRect === 'function' &&
    !('currentTarget' in source),
  );
}

/** Type guard checking if an AnchorEventLike source is a DOM event with a currentTarget HTMLElement. */
export function isEventAnchor(
  source?: AnchorEventLike | null,
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
export function toValidatedAnchorRef(source?: AnchorEventLike | null): ValidatedAnchorRef {
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
      getBoundingClientRect: () => el?.getBoundingClientRect(),
    };
  }
  return NULL_ANCHOR_REF;
}

/**
 * Converter creating a branded ViewportX coordinate value with NaN safety.
 */
export function toViewportX(x: number): ViewportX {
  return (Number.isFinite(x) ? x : 0) as ViewportX;
}

/**
 * Converter creating a branded ViewportY coordinate value with NaN safety.
 */
export function toViewportY(y: number): ViewportY {
  return (Number.isFinite(y) ? y : 0) as ViewportY;
}

/**
 * Factory helper creating a VirtualElement / AnchorEventLike object from coordinates.
 */
export function createVirtualElement(
  x: number,
  y: number,
  width = 0,
  height = 0,
): AnchorEventLike & { getBoundingClientRect: () => DOMRect } {
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
): event is Extract<PopoverStoreEvent<TData>, { type: 'open_root' | 'popover:open_root' }> {
  return event.type === 'open_root' || event.type === 'popover:open_root';
}

/** Type guard for 'push_nested' event. */
export function isPushNestedEvent<TData>(
  event: PopoverStoreEvent<TData>,
): event is Extract<PopoverStoreEvent<TData>, { type: 'push_nested' | 'popover:push_nested' }> {
  return event.type === 'push_nested' || event.type === 'popover:push_nested';
}

/** Type guard for 'close' event. */
export function isCloseEvent<TData>(
  event: PopoverStoreEvent<TData>,
): event is Extract<PopoverStoreEvent<TData>, { type: 'close' | 'popover:close' }> {
  return event.type === 'close' || event.type === 'popover:close';
}

/** Type guard for 'pin' event. */
export function isPinEvent<TData>(
  event: PopoverStoreEvent<TData>,
): event is Extract<PopoverStoreEvent<TData>, { type: 'pin' | 'popover:pin' }> {
  return event.type === 'pin' || event.type === 'popover:pin';
}

/** Type guard for 'unpin' event. */
export function isUnpinEvent<TData>(
  event: PopoverStoreEvent<TData>,
): event is Extract<PopoverStoreEvent<TData>, { type: 'unpin' | 'popover:unpin' }> {
  return event.type === 'unpin' || event.type === 'popover:unpin';
}

/** Type guard for 'resolve_start' event. */
export function isResolveStartEvent<TData>(
  event: PopoverStoreEvent<TData>,
): event is Extract<PopoverStoreEvent<TData>, { type: 'resolve_start' | 'popover:resolve_start' }> {
  return event.type === 'resolve_start' || event.type === 'popover:resolve_start';
}

/** Type guard for 'resolve_success' event. */
export function isResolveSuccessEvent<TData>(
  event: PopoverStoreEvent<TData>,
): event is Extract<
  PopoverStoreEvent<TData>,
  { type: 'resolve_success' | 'popover:resolve_success' }
> {
  return event.type === 'resolve_success' || event.type === 'popover:resolve_success';
}

/** Type guard for 'resolve_error' event. */
export function isResolveErrorEvent<TData>(
  event: PopoverStoreEvent<TData>,
): event is Extract<PopoverStoreEvent<TData>, { type: 'resolve_error' | 'popover:resolve_error' }> {
  return event.type === 'resolve_error' || event.type === 'popover:resolve_error';
}

/** Type guard for 'clear' event. */
export function isClearEvent<TData>(
  event: PopoverStoreEvent<TData>,
): event is Extract<PopoverStoreEvent<TData>, { type: 'clear' | 'popover:clear' }> {
  return event.type === 'clear' || event.type === 'popover:clear';
}

/**
 * Generic type guard narrowing a `PopoverStoreEvent` to a specific event type.
 *
 * @template TData - Resolved data payload type.
 * @template TType - Target event type discriminator.
 * @param event - PopoverStoreEvent candidate.
 * @param type - Target event type name.
 * @returns `true` if event matches the given type.
 */
export function isStoreEvent<
  TData = unknown,
  TType extends PopoverStoreEvent<TData>['type'] = PopoverStoreEvent<TData>['type'],
>(
  event: PopoverStoreEvent<TData>,
  type: TType,
): event is Extract<PopoverStoreEvent<TData>, { type: TType }> {
  return (
    event.type === type || event.type === `popover:${type}` || `popover:${event.type}` === type
  );
}

/**
 * Identity helper for defining a `PopoverDisplayOptions` configuration object with full autocompletion.
 *
 * @template T - Display options type.
 * @param config - Configuration options object.
 * @returns The same configuration object with strict typing.
 */
export function definePopoverConfig<T extends PopoverDisplayOptions>(config: T): T {
  return config;
}

/**
 * Identity helper for defining a `PopoverMiddleware` interceptor function with full typing.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global external context type.
 * @template TPopoverKey - Popover key identifier union type.
 * @param middleware - Middleware function implementation.
 * @returns The same middleware function with enforced types.
 *
 * @example
 * ```typescript
 * const loggingMiddleware = definePopoverMiddleware((patch, state) => {
 *   console.log('State patch applied:', patch);
 *   return patch;
 * });
 * ```
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
 * Safely extracts a numeric pixel value from a CSS style property (number or string with 'px').
 * Returns 0 if value is not a valid number.
 *
 * @param val - Numeric or string CSS value.
 * @returns Parsed finite number.
 */
export function extractNumericStyle(val: unknown): number {
  if (typeof val === 'number') return Number.isNaN(val) ? 0 : val;
  if (typeof val === 'string') {
    const parsed = Number.parseFloat(val);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Assertion function verifying that `value` matches the `TrailEntry` interface.
 * Throws a `TypeError` if invalid.
 *
 * @param value - Candidate object to validate.
 * @throws {TypeError} If `value` is not a valid TrailEntry.
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
 * Assertion function verifying that `value` matches the `DOMRect` interface.
 * Throws a `TypeError` if invalid.
 *
 * @param value - Candidate object to validate.
 * @throws {TypeError} If `value` is not a valid DOMRect.
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
 * Type guard verifying if `val` is a valid Floating UI `PopoverPlacement` direction string.
 *
 * @param val - Value to check.
 * @returns `true` if `val` is a valid placement (`'top'`, `'bottom-start'`, etc.).
 */
export function isPopoverPlacement(val: unknown): val is PopoverPlacement {
  return typeof val === 'string' && VALID_PLACEMENTS_SET.has(val);
}

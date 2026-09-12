/**
 * Universal Type Utilities and Algebraic Type Operators for popover-trail.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module types/utilityTypes
 */

/**
 * Represents a value that may be either synchronous or wrapped in a Promise.
 *
 * @template T - Underlying resolved type.
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * Explicit domain type for a value that may be null.
 *
 * @template T - Base type.
 */
export type Nullable<T> = T | null;

/**
 * Explicit domain type for a value that may be null or undefined.
 *
 * @template T - Base type.
 */
export type Maybe<T> = T | null | undefined;

/**
 * Union of all JavaScript falsy primitive values.
 */
export type Falsy = false | 0 | -0 | 0n | '' | null | undefined;

/**
 * Unary predicate function returning a boolean.
 *
 * @template T - Argument type.
 */
export type Predicate<T> = (value: T) => boolean;

/**
 * Asynchronous or synchronous unary predicate function returning boolean or Promise<boolean>.
 *
 * @template T - Argument type.
 */
export type AsyncPredicate<T> = (value: T) => MaybePromise<boolean>;

/**
 * Extracts the union of all property values of an object type `T`.
 *
 * @template T - Object structure.
 *
 * @example
 * ```typescript
 * const status = { IDLE: 'idle', OPEN: 'open' } as const;
 * type Status = ValueOf<typeof status>; // 'idle' | 'open'
 * ```
 */
export type ValueOf<T> = T[keyof T];

/**
 * Recursively makes all properties of an object or nested collections optional.
 * Perfect complement to `DeepReadonly<T>` for configs, options, and test overrides.
 *
 * @template T - Target type.
 */
export type DeepPartial<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends Map<infer K, infer V>
    ? Map<DeepPartial<K>, DeepPartial<V>>
    : T extends ReadonlyMap<infer K, infer V>
      ? ReadonlyMap<DeepPartial<K>, DeepPartial<V>>
      : T extends Set<infer U>
        ? Set<DeepPartial<U>>
        : T extends ReadonlySet<infer U>
          ? ReadonlySet<DeepPartial<U>>
          : T extends (infer U)[]
            ? DeepPartial<U>[]
            : T extends readonly (infer U)[]
              ? readonly DeepPartial<U>[]
              : T extends object
                ? { [K in keyof T]?: DeepPartial<T[K]> }
                : T;


/**
 * Extracts the success payload type `T` from a monadic Result structure.
 *
 * @template R - Result type.
 *
 * @example
 * ```typescript
 * type Res = Result<{ id: string }, Error>;
 * type Data = InferOk<Res>; // { id: string }
 * ```
 */
export type InferOk<R> = R extends { readonly success: true; readonly data: infer T }
  ? T
  : never;

/**
 * Extracts the failure error type `E` from a monadic Result structure.
 *
 * @template R - Result type.
 *
 * @example
 * ```typescript
 * type Res = Result<{ id: string }, PopoverError>;
 * type ErrType = InferErr<Res>; // PopoverError
 * ```
 */
export type InferErr<R> = R extends { readonly success: false; readonly error: infer E }
  ? E
  : never;

/**
 * Type-level tuple guaranteeing at least one element at compile-time.
 *
 * @template T - Array element type.
 */
export type NonEmptyArray<T> = readonly [T, ...T[]];

/**
 * Extracts the payload type for a specific event key from an event map.
 *
 * @template TEventMap - Event dictionary mapping names to events.
 * @template TKey - Key in event map.
 */
export type EventPayload<
  TEventMap,
  TKey extends keyof TEventMap,
> = TEventMap[TKey];

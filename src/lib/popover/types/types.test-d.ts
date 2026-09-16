import { describe, it, expectTypeOf } from 'vitest';
import {
  type TrailEntry,
  type SuccessTrailEntry,
  type LoadingTrailEntry,
  type ErrorTrailEntry,
  type DiscriminatedTrailEntry,
  type PopoverRect,
  type UsePopoverResult,
  type PopoverEventMap,
  type PopoverEventHandlerMap,
  type Register,
  type RegisteredKeys,
  type PopoverKey,
  type TriggerId,
  type ScopeId,
  type SubscriptionId,
  type WorkerTaskId,
  type CausalSequence,
  type ZIndexDepth,
  type StorageKey,
  type ChannelId,
  type OwnerId,
  type ParentKey,
  type ExtractActionPayload,
  type StoreActionPayloadMap,
  type PopoverEntryDiscriminatedState,
  type ValidNextFSMState,
  type DAGEdge,
  type DAGCycleError,
  type TopologicalSortResult,
  type QuadrantIndex,
  type SpatialQuadrant,
  type Result,
  type CacheKey,
  type CacheEntryState,
  type CacheEventHandlerMap,
  type HistoryCapacity,
  type HistoryError,
  type PopoverNotFoundError,
  type SingularMatrixError,
  type SpatialNotFoundError,
  type DurationMs,
  type TimestampMs,
  type Unbrand,
  type BrandTagOf,
  type IsBranded,
  type AnyBrand,
  type NarrowTrailEntry,
  type MaybePromise,
  type Nullable,
  type Maybe,
  type Falsy,
  type Predicate,
  type AsyncPredicate,
  type ValueOf,
  type DeepPartial,
  type InferOk,
  type InferErr,
  type NonEmptyArray,
  type EventPayload,
  emptyRecord,
  unbrand,
  collectResults,
  partitionResults,
  usingResult,
  usingAsyncResult,
  composeMiddlewares,
  matchActionState,
  invertMatrix2DResult,
  isSuccessEntry,
  isIdleEntry,
} from '../index';

import type {
  PopoverFSMState,
  IdleFSMState,
  HydratingFSMState,
  ResolvedTrailingFSMState,
  ResolvedPinnedFSMState,
  ErrorFSMState,
  UnmountingFSMState,
} from '../store/fsm';
import type { WorkerTaskMessage } from '../utils/worker/workerTypes';

describe('Type-Level Static Assertions (test-d)', () => {
  it('verifies TrailEntry and DiscriminatedTrailEntry subtypes', () => {
    expectTypeOf<SuccessTrailEntry<{ id: string }>>().toMatchTypeOf<TrailEntry<{ id: string }>>();
    expectTypeOf<LoadingTrailEntry>().toMatchTypeOf<TrailEntry>();
    expectTypeOf<ErrorTrailEntry>().toMatchTypeOf<TrailEntry>();
    expectTypeOf<DiscriminatedTrailEntry<{ id: string }>>().toMatchTypeOf<
      TrailEntry<{ id: string }>
    >();
  });

  it('verifies type guard narrowing on entries', () => {
    const entry = {} as TrailEntry<{ count: number }>;
    if (isSuccessEntry(entry)) {
      expectTypeOf(entry.data).toEqualTypeOf<{ count: number }>();
    }
    if (isIdleEntry(entry)) {
      expectTypeOf(entry.isLoading).toEqualTypeOf<false | undefined>();
    }
  });

  it('verifies PopoverRect geometry isolation', () => {
    expectTypeOf<PopoverRect>().toHaveProperty('top');
    expectTypeOf<PopoverRect>().toHaveProperty('left');
    expectTypeOf<PopoverRect>().toHaveProperty('width');
    expectTypeOf<PopoverRect>().toHaveProperty('height');
  });

  it('verifies UsePopoverResult', () => {
    expectTypeOf<UsePopoverResult<string>>().toHaveProperty('isOpen');
  });

  it('verifies UsePopoverResult discriminated narrowing on isOpen', () => {
    const testNarrowing = (res: UsePopoverResult<string>) => {
      if (res.isOpen) {
        expectTypeOf(res.entry).toMatchTypeOf<TrailEntry<string>>();
        expectTypeOf(res.isPinned).toBeBoolean();
      } else {
        expectTypeOf(res.entry).toBeUndefined();
        expectTypeOf(res.isPinned).toEqualTypeOf<false>();
      }
    };
    expectTypeOf(testNarrowing).toBeFunction();
  });

  it('verifies PopoverEventMap strongly maps event keys', () => {
    expectTypeOf<PopoverEventMap['popover:open_root']>().toHaveProperty('ownerId');
    expectTypeOf<PopoverEventMap['popover:resolve_success']>().toHaveProperty('data');
  });

  it('verifies PopoverEventHandlerMap strongly narrows callback parameter', () => {
    type Handlers = PopoverEventHandlerMap<{ id: number }>;
    type ResolveSuccessHandler = NonNullable<Handlers['popover:resolve_success']>;
    expectTypeOf<ResolveSuccessHandler>().parameters.toMatchTypeOf<
      [{ key: string; data: { id: number } }]
    >();
  });

  it('verifies global Register fallback is string when unregistered', () => {
    expectTypeOf<Register>().toBeObject();
    expectTypeOf<RegisteredKeys>().toEqualTypeOf<string>();
  });

  it('verifies nominal branded types are disjoint and prevent key mixing', () => {
    expectTypeOf<PopoverKey>().not.toMatchTypeOf<TriggerId>();
    expectTypeOf<TriggerId>().not.toMatchTypeOf<PopoverKey>();
    expectTypeOf<ScopeId>().not.toMatchTypeOf<SubscriptionId>();
    expectTypeOf<OwnerId>().not.toMatchTypeOf<ParentKey>();
    expectTypeOf<WorkerTaskId>().not.toMatchTypeOf<CausalSequence>();
    expectTypeOf<StorageKey>().not.toMatchTypeOf<ChannelId>();
    expectTypeOf<StorageKey>().not.toMatchTypeOf<PopoverKey>();
  });

  it('verifies ExtractActionPayload and StoreActionPayloadMap', () => {
    expectTypeOf<ExtractActionPayload<'OPEN_ROOT'>>().toHaveProperty('key');
    expectTypeOf<ExtractActionPayload<'OPEN_ROOT'>>().toHaveProperty('rect');
    expectTypeOf<ExtractActionPayload<'RESOLVE_SUCCESS', { count: number }>>()
      .toHaveProperty('data')
      .toEqualTypeOf<{ count: number }>();
    expectTypeOf<StoreActionPayloadMap['CLOSE_ALL']>().toEqualTypeOf<{ type: 'CLOSE_ALL' }>();
  });

  it('verifies WorkerTaskMessage discriminated union narrows on action', () => {
    const testWorkerNarrowing = (msg: WorkerTaskMessage) => {
      if (msg.action === 'abort') {
        expectTypeOf(msg.action).toEqualTypeOf<'abort'>();
        expectTypeOf(msg.id).toBeNumber();
      } else {
        expectTypeOf(msg.action).toEqualTypeOf<'resolve' | undefined>();
        expectTypeOf(msg.id).toBeNumber();
      }
    };
    expectTypeOf(testWorkerNarrowing).toBeFunction();
  });

  it('verifies PopoverEntryDiscriminatedState includes idle variant', () => {
    expectTypeOf<{
      status: 'idle';
      isLoading: false;
      data: undefined;
      error: null;
    }>().toMatchTypeOf<PopoverEntryDiscriminatedState>();
  });

  it('verifies FSM states form a strict discriminated union', () => {
    expectTypeOf<IdleFSMState>().toMatchTypeOf<PopoverFSMState>();
    expectTypeOf<HydratingFSMState>().toMatchTypeOf<PopoverFSMState>();
    expectTypeOf<ResolvedTrailingFSMState>().toMatchTypeOf<PopoverFSMState>();
    expectTypeOf<ResolvedPinnedFSMState>().toMatchTypeOf<PopoverFSMState>();
    expectTypeOf<ErrorFSMState>().toMatchTypeOf<PopoverFSMState>();
    expectTypeOf<UnmountingFSMState>().toMatchTypeOf<PopoverFSMState>();
  });

  it('verifies ValidNextFSMState computes valid transitions at type level', () => {
    expectTypeOf<ValidNextFSMState<'Idle'>>().toEqualTypeOf<'Hydrating'>();
    expectTypeOf<ValidNextFSMState<'Unmounting'>>().toEqualTypeOf<'Idle' | 'Hydrating'>();
  });

  it('verifies DAGEdge and TopologicalSortResult structure', () => {
    expectTypeOf<DAGEdge>().toMatchTypeOf<{ from: string; to: string }>();
    expectTypeOf<TopologicalSortResult<string>>().toMatchTypeOf<
      Result<readonly string[], DAGCycleError<string>>
    >();
  });

  it('verifies SpatialQuadrant and QuadrantIndex types', () => {
    expectTypeOf<0>().toMatchTypeOf<QuadrantIndex>();
    expectTypeOf<-1>().toMatchTypeOf<SpatialQuadrant>();
    expectTypeOf<5>().not.toMatchTypeOf<SpatialQuadrant>();
  });

  it('verifies collectResults and partitionResults typing', () => {
    expectTypeOf(collectResults<number, string>).toBeFunction();
    expectTypeOf(partitionResults<number, string>).toBeFunction();
  });

  it('verifies CacheKey nominal branding is disjoint', () => {
    expectTypeOf<CacheKey>().not.toMatchTypeOf<PopoverKey>();
    expectTypeOf<CacheKey>().not.toMatchTypeOf<StorageKey>();
  });

  it('verifies CacheEntryState discriminated union and variants', () => {
    expectTypeOf<{
      status: 'fresh';
      data: number;
      expiry: number;
    }>().toMatchTypeOf<CacheEntryState<number>>();
    expectTypeOf<{
      status: 'stale';
      data: number;
      staleAt: number;
    }>().toMatchTypeOf<CacheEntryState<number>>();
    expectTypeOf<{
      status: 'expired';
      data: number;
      expiry: number;
    }>().toMatchTypeOf<CacheEntryState<number>>();
  });

  it('verifies CacheEventHandlerMap strongly types event parameter', () => {
    type Handlers = CacheEventHandlerMap<number>;
    type HitHandler = NonNullable<Handlers['hit']>;
    expectTypeOf<HitHandler>().parameters.toMatchTypeOf<[{ key: string; value: number }]>();
  });

  it('verifies usingResult and composeMiddlewares are functions', () => {
    expectTypeOf(usingResult).toBeFunction();
    expectTypeOf(usingAsyncResult).toBeFunction();
    expectTypeOf(composeMiddlewares).toBeFunction();
  });

  it('verifies HistoryCapacity is disjoint from other numeric brands', () => {
    expectTypeOf<HistoryCapacity>().not.toMatchTypeOf<WorkerTaskId>();
    expectTypeOf<HistoryCapacity>().not.toMatchTypeOf<ZIndexDepth>();
  });

  it('verifies matchActionState and invertMatrix2DResult are functions', () => {
    expectTypeOf(matchActionState).toBeFunction();
    expectTypeOf(invertMatrix2DResult).toBeFunction();
  });

  it('verifies spatial and history monadic error contracts', () => {
    expectTypeOf<HistoryError>().toMatchTypeOf<
      { type: 'undo_underflow'; message: string } | { type: 'redo_underflow'; message: string }
    >();
    expectTypeOf<PopoverNotFoundError>().toMatchTypeOf<{
      type: 'popover_not_found';
      key: string;
      message: string;
    }>();
    expectTypeOf<SingularMatrixError>().toMatchTypeOf<{
      type: 'singular_matrix';
      message: string;
      determinant: number;
    }>();
    expectTypeOf<SpatialNotFoundError>().toMatchTypeOf<{
      type: 'spatial_not_found';
      message: string;
    }>();
  });

  it('verifies Unbrand, BrandTagOf, IsBranded, and AnyBrand utility types', () => {
    expectTypeOf<Unbrand<PopoverKey>>().toEqualTypeOf<string>();
    expectTypeOf<Unbrand<DurationMs>>().toEqualTypeOf<number>();
    expectTypeOf<Unbrand<TimestampMs>>().toEqualTypeOf<number>();
    expectTypeOf<Unbrand<number>>().toEqualTypeOf<number>();

    expectTypeOf<BrandTagOf<PopoverKey>>().toEqualTypeOf<'PopoverKey'>();
    expectTypeOf<BrandTagOf<DurationMs>>().toEqualTypeOf<'DurationMs'>();
    expectTypeOf<BrandTagOf<TimestampMs>>().toEqualTypeOf<'TimestampMs'>();

    expectTypeOf<IsBranded<PopoverKey>>().toEqualTypeOf<true>();
    expectTypeOf<IsBranded<string>>().toEqualTypeOf<false>();

    expectTypeOf<PopoverKey>().toMatchTypeOf<AnyBrand>();
    expectTypeOf<DurationMs>().toMatchTypeOf<AnyBrand>();
  });

  it('verifies NarrowTrailEntry narrows to exact variant', () => {
    expectTypeOf<NarrowTrailEntry<{ id: string }, 'success'>>().toEqualTypeOf<
      SuccessTrailEntry<{ id: string }>
    >();
    expectTypeOf<NarrowTrailEntry<unknown, 'loading'>>().toEqualTypeOf<LoadingTrailEntry>();
    expectTypeOf<NarrowTrailEntry<unknown, 'error'>>().toEqualTypeOf<ErrorTrailEntry>();
  });

  it('verifies emptyRecord returns frozen empty record singleton', () => {
    expectTypeOf(emptyRecord).toBeFunction();
    const rec = emptyRecord<string, number>();
    expectTypeOf(rec).toMatchTypeOf<Readonly<Partial<Record<string, number>>>>();
  });

  it('verifies unbrand function extracts primitive type', () => {
    expectTypeOf(unbrand).toBeFunction();
    const key = 'test' as PopoverKey;
    const raw = unbrand(key);
    expectTypeOf(raw).toEqualTypeOf<string>();
    const dur = 100 as DurationMs;
    const rawDur = unbrand(dur);
    expectTypeOf(rawDur).toEqualTypeOf<number>();
  });

  it('verifies MaybePromise, Nullable, Maybe, and Falsy type utilities', () => {
    expectTypeOf<MaybePromise<string>>().toEqualTypeOf<string | Promise<string>>();
    expectTypeOf<Nullable<number>>().toEqualTypeOf<number | null>();
    expectTypeOf<Maybe<boolean>>().toEqualTypeOf<boolean | null | undefined>();
    expectTypeOf<false>().toMatchTypeOf<Falsy>();
    expectTypeOf<0>().toMatchTypeOf<Falsy>();
    expectTypeOf<null>().toMatchTypeOf<Falsy>();
    expectTypeOf<undefined>().toMatchTypeOf<Falsy>();
  });

  it('verifies Predicate and AsyncPredicate functional utilities', () => {
    type TestPred = Predicate<number>;
    expectTypeOf<TestPred>().toEqualTypeOf<(value: number) => boolean>();

    type TestAsyncPred = AsyncPredicate<string>;
    expectTypeOf<TestAsyncPred>().toEqualTypeOf<(value: string) => MaybePromise<boolean>>();
  });

  it('verifies ValueOf, DeepPartial, NonEmptyArray, and EventPayload', () => {
    const config = { a: 1, b: 'two', c: true } as const;
    expectTypeOf<ValueOf<typeof config>>().toEqualTypeOf<1 | 'two' | true>();

    interface Nested {
      x: number;
      inner: { y: string; items: number[] };
    }
    type PartialNested = DeepPartial<Nested>;
    expectTypeOf<PartialNested>().toMatchTypeOf<{
      x?: number;
      inner?: { y?: string; items?: number[] };
    }>();

    type NonEmpty = NonEmptyArray<string>;
    expectTypeOf<['hello']>().toMatchTypeOf<NonEmpty>();

    type EventMap = { open: { key: string }; close: { key: string } };
    expectTypeOf<EventPayload<EventMap, 'open'>>().toEqualTypeOf<{ key: string }>();
  });

  it('verifies InferOk and InferErr extract payload types from Result', () => {
    type TestResult = Result<{ user: string }, { code: number }>;
    expectTypeOf<InferOk<TestResult>>().toEqualTypeOf<{ user: string }>();
    expectTypeOf<InferErr<TestResult>>().toEqualTypeOf<{ code: number }>();
  });
});

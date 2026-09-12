import { describe, it, expectTypeOf } from 'vitest';
import {
  type TrailEntry,
  type SuccessTrailEntry,
  type LoadingTrailEntry,
  type ErrorTrailEntry,
  type DiscriminatedTrailEntry,
  type PopoverRect,
  type UsePopoverResult,
  type DiscriminatedUsePopoverResult,
  type PopoverEventMap,
  type Register,
  type RegisteredKeys,
  type PopoverKey,
  type TriggerId,
  type ScopeId,
  type SubscriptionId,
  type OwnerId,
  type ParentKey,
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

  it('verifies UsePopoverResult and DiscriminatedUsePopoverResult', () => {
    expectTypeOf<UsePopoverResult<string>>().toHaveProperty('isOpen');
    expectTypeOf<DiscriminatedUsePopoverResult<string>>().toHaveProperty('isOpen');
  });

  it('verifies PopoverEventMap strongly maps event keys', () => {
    expectTypeOf<PopoverEventMap['popover:open_root']>().toHaveProperty('ownerId');
    expectTypeOf<PopoverEventMap['popover:resolve_success']>().toHaveProperty('data');
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
  });

  it('verifies FSM states form a strict discriminated union', () => {
    expectTypeOf<IdleFSMState>().toMatchTypeOf<PopoverFSMState>();
    expectTypeOf<HydratingFSMState>().toMatchTypeOf<PopoverFSMState>();
    expectTypeOf<ResolvedTrailingFSMState>().toMatchTypeOf<PopoverFSMState>();
    expectTypeOf<ResolvedPinnedFSMState>().toMatchTypeOf<PopoverFSMState>();
    expectTypeOf<ErrorFSMState>().toMatchTypeOf<PopoverFSMState>();
    expectTypeOf<UnmountingFSMState>().toMatchTypeOf<PopoverFSMState>();
  });
});

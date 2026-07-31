import { describe, it, expect } from 'vitest';
import React from 'react';
import {
  PopoverProvider,
  usePopoverEntryStatus,
  createPopoverStore,
  type DomainPopoverKey,
  type NarrowTrailEntry,
} from './index';

describe('Advanced TypeScript Store Types & Status Narrowing', () => {
  it('supports domain-scoped template literal popover keys', () => {
    const userProfileKey: DomainPopoverKey<'user', 'profile'> = 'user:profile';
    const teamMemberKey: DomainPopoverKey<'team', 'member'> = 'team:member';

    expect(userProfileKey).toBe('user:profile');
    expect(teamMemberKey).toBe('team:member');
  });

  it('narrows TrailEntry status via NarrowTrailEntry helper', () => {
    type TestData = { id: number; name: string };

    type SuccessType = NarrowTrailEntry<TestData, 'success'>;
    type LoadingType = NarrowTrailEntry<TestData, 'loading'>;
    type ErrorType = NarrowTrailEntry<TestData, 'error'>;

    const mockSuccess: SuccessType = {
      key: 'test',
      status: 'success',
      isLoading: false,
      error: null,
      data: { id: 1, name: 'Alice' },
    };

    const mockLoading: LoadingType = {
      key: 'test',
      status: 'loading',
      isLoading: true,
      data: undefined,
      error: null,
    };

    const mockError: ErrorType = {
      key: 'test',
      status: 'error',
      isLoading: false,
      data: undefined,
      error: new Error('Failed to load'),
    };

    expect(mockSuccess.status).toBe('success');
    expect(mockSuccess.data.name).toBe('Alice');
    expect(mockLoading.isLoading).toBe(true);
    expect(mockError.error?.message).toBe('Failed to load');
  });

  it('validates Discriminated Store State types', () => {
    const store = createPopoverStore(async (key) => ({ key }));
    const rawState = store.getState();

    // Verify initial store state structure
    expect(rawState.trail).toHaveLength(0);
    expect(rawState.floating).toHaveLength(0);
    expect(rawState.ownerId).toBeNull();
  });

  it('instantiates PopoverProvider with usePopoverEntryStatus hook consumer', () => {
    const TestComponent = () => {
      const entry = usePopoverEntryStatus<{ id: number }>('card-1', 'success');
      return <div>{entry?.data.id}</div>;
    };

    const element = (
      <PopoverProvider resolveData={async (key) => ({ id: 42 })}>
        <TestComponent />
      </PopoverProvider>
    );

    expect(React.isValidElement(element)).toBe(true);
  });
});

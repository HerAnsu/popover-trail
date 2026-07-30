import { describe, it, expect } from 'vitest';
import {
  toValidatedAnchorRef,
  type TrailEntry,
  type SuccessTrailEntry,
  type AnchorEventLike,
} from './index';

describe('Discriminated TrailEntry & Geometry Validation', () => {
  it('narrows TrailEntry payload when status is success', () => {
    const successEntry: SuccessTrailEntry<{ title: string }> = {
      key: 'card-1',
      status: 'success',
      isLoading: false,
      error: null,
      data: { title: 'Pop-1' },
    };

    const entry: TrailEntry<{ title: string }> = successEntry;

    if (entry.status === 'success') {
      // TypeScript guarantees entry.data is defined
      expect(entry.data?.title).toBe('Pop-1');
    }
    expect(entry.isLoading).toBe(false);
  });

  it('validates anchor ref geometry using toValidatedAnchorRef', () => {
    const syntheticEvent = {
      currentTarget: {
        getBoundingClientRect: () =>
          ({
            x: 10,
            y: 20,
            width: 100,
            height: 50,
            top: 20,
            bottom: 70,
            left: 10,
            right: 110,
            toJSON: () => ({}),
          }) as DOMRect,
      } as HTMLElement,
    };

    const validatedRef = toValidatedAnchorRef(syntheticEvent);
    expect(validatedRef.getBoundingClientRect).toBeDefined();

    const rect = validatedRef.getBoundingClientRect();
    expect(rect.x).toBe(10);
    expect(rect.y).toBe(20);
    expect(rect.width).toBe(100);
    expect(rect.height).toBe(50);
  });

  it('returns fallback bounding rect when anchor source lacks geometry', () => {
    const emptySource = {} as AnchorEventLike;
    const validatedRef = toValidatedAnchorRef(emptySource);
    const rect = validatedRef.getBoundingClientRect();

    expect(rect.width).toBe(0);
    expect(rect.height).toBe(0);
  });
});

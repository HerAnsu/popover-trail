import { describe, it, expect } from 'vitest';
import { createSuccessEntry, createLoadingEntry, createErrorEntry, createIdleEntry } from './index';

describe('entryVariants module', () => {
  it('creates success variant entry with data', () => {
    const entry = createSuccessEntry('k1', undefined, null, undefined, undefined, { value: 42 });
    expect(entry.status).toBe('success');
    expect(entry.data).toEqual({ value: 42 });
    expect(entry.isLoading).toBe(false);
    expect(entry.error).toBeNull();
  });

  it('creates loading variant entry', () => {
    const entry = createLoadingEntry('k2', 'parent', null, undefined);
    expect(entry.status).toBe('loading');
    expect(entry.isLoading).toBe(true);
    expect(entry.data).toBeNull();
    expect(entry.error).toBeNull();
  });

  it('creates error variant entry with Error instance', () => {
    const err = new Error('Test failure');
    const entry = createErrorEntry('k3', undefined, null, undefined, err);
    expect(entry.status).toBe('error');
    expect(entry.isLoading).toBe(false);
    expect(entry.error).toBe(err);
  });

  it('creates idle variant entry', () => {
    const entry = createIdleEntry('k4', undefined, null, undefined);
    expect(entry.status).toBe('loading');
    expect(entry.isLoading).toBe(false);
    expect(entry.error).toBeNull();
    expect(entry.data).toBeNull();
  });

  it('preserves existing entry display options in variants', () => {
    const existing = createSuccessEntry('k5', undefined, null, {
      placement: 'top',
      collision: { boundary: 'clippingAncestors', enabled: true },
    });
    const next = createLoadingEntry('k5', undefined, null, undefined, existing);
    expect(next.placement).toBe('top');
    expect(next.collision?.boundary).toBe('clippingAncestors');
  });

  it('preserves DOM rect across variant transitions', () => {
    const rect = { top: 10, left: 20, width: 100, height: 50, right: 120, bottom: 60 } as DOMRect;
    const entry = createSuccessEntry('k6', undefined, rect, undefined);
    expect(entry.rect?.top).toBe(10);
    expect(entry.originalRect?.left).toBe(20);
  });
});

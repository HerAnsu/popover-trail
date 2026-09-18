import { describe, it, expect } from 'vitest';
import { createVirtualElement, createDefaultDOMRect } from './virtualElement';

describe('virtualElement', () => {
  it('creates default DOMRect with safe finite dimensions', () => {
    const rect = createDefaultDOMRect();
    expect(rect.x).toBe(0);
    expect(rect.y).toBe(0);
    expect(rect.width).toBe(0);
    expect(rect.height).toBe(0);
  });

  it('creates virtual element from coordinates with finite clamping', () => {
    const el = createVirtualElement(150, 250, 40, 60);
    const rect = el?.getBoundingClientRect();
    expect(rect?.x).toBe(150);
    expect(rect?.y).toBe(250);
    expect(rect?.width).toBe(40);
    expect(rect?.height).toBe(60);
    expect(rect?.right).toBe(190);
    expect(rect?.bottom).toBe(310);
  });

  it('sanitizes NaN and negative dimensions to zero', () => {
    const el = createVirtualElement(Number.NaN, Number.POSITIVE_INFINITY, -50, -10);
    const rect = el?.getBoundingClientRect();
    expect(rect?.x).toBe(0);
    expect(rect?.y).toBe(0);
    expect(rect?.width).toBe(0);
    expect(rect?.height).toBe(0);
  });
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { clampCoordinateToBounds, clampToViewport, clampToContainer } from './dndClamp';

describe('dndClamp utilities', () => {
  const origWin = globalThis.window;
  const origDoc = globalThis.document;

  beforeEach(() => {
    globalThis.window = origWin;
    globalThis.document = origDoc;
  });

  afterEach(() => {
    globalThis.window = origWin;
    globalThis.document = origDoc;
  });

  const baseNodeRect = {
    top: 100,
    left: 100,
    bottom: 200,
    right: 200,
    width: 100,
    height: 100,
  };

  it('preserves coordinates when transform remains within bounds', () => {
    const transform = { x: 50, y: 50, scaleX: 1.5, scaleY: 1.5 };
    const bounds = { left: 0, top: 0, right: 500, bottom: 500 };

    const result = clampCoordinateToBounds(transform, baseNodeRect, bounds);

    expect(result).toEqual({ x: 50, y: 50, scaleX: 1.5, scaleY: 1.5 });
  });

  it('clamps transform to boundary limits when exceeding margins', () => {
    const bounds = { left: 50, top: 50, right: 300, bottom: 300 };

    const tooFarLeft = { x: -200, y: 0, scaleX: 1, scaleY: 1 };
    expect(clampCoordinateToBounds(tooFarLeft, baseNodeRect, bounds).x).toBe(-50);

    const tooFarRight = { x: 500, y: 0, scaleX: 1, scaleY: 1 };
    expect(clampCoordinateToBounds(tooFarRight, baseNodeRect, bounds).x).toBe(100);

    const tooFarUp = { x: 0, y: -300, scaleX: 1, scaleY: 1 };
    expect(clampCoordinateToBounds(tooFarUp, baseNodeRect, bounds).y).toBe(-50);

    const tooFarDown = { x: 0, y: 400, scaleX: 1, scaleY: 1 };
    expect(clampCoordinateToBounds(tooFarDown, baseNodeRect, bounds).y).toBe(100);
  });

  it('clamps coordinates to window viewport dimensions in browser context', () => {
    globalThis.window = { innerWidth: 1024, innerHeight: 768 } as unknown as Window &
      typeof globalThis;
    globalThis.document = {} as unknown as Document;

    const transform = { x: 1500, y: 1200, scaleX: 1, scaleY: 1 };
    const result = clampToViewport(transform, baseNodeRect);

    // maxX = 1024 - 100 - 100 = 824
    // maxY = 768 - 100 - 100 = 568
    expect(result.x).toBe(824);
    expect(result.y).toBe(568);
  });

  it('falls back to default 1920x1080 dimensions in SSR / non-browser context', () => {
    globalThis.window = undefined as unknown as Window & typeof globalThis;
    globalThis.document = undefined as unknown as Document;

    const transform = { x: 2500, y: 2000, scaleX: 1, scaleY: 1 };
    const result = clampToViewport(transform, baseNodeRect);

    // maxX = 1920 - 100 - 100 = 1720
    // maxY = 1080 - 100 - 100 = 880
    expect(result.x).toBe(1720);
    expect(result.y).toBe(880);
  });

  it('clamps coordinates within custom container boundaries', () => {
    const containerRect = { left: 50, top: 50, right: 400, bottom: 400 };
    const transform = { x: -300, y: 600, scaleX: 1, scaleY: 1 };

    const result = clampToContainer(transform, baseNodeRect, containerRect);

    // minX = 50 - 100 = -50
    // maxY = 400 - 100 - 100 = 200
    expect(result.x).toBe(-50);
    expect(result.y).toBe(200);
  });
});

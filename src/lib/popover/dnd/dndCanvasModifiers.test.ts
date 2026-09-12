import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Modifier } from '@dnd-kit/core';
import { useCanvasModifiers } from './dndCanvasModifiers';

type ModifierArgs = Parameters<Modifier>[0];

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useMemo: <T>(fn: () => T): T => fn(),
    useCallback: <T extends (...args: readonly unknown[]) => unknown>(fn: T): T => fn,
  };
});

describe('useCanvasModifiers', () => {
  const origWin = globalThis.window;
  const origDoc = globalThis.document;

  beforeEach(() => {
    globalThis.window = { innerWidth: 1000, innerHeight: 800 } as unknown as Window &
      typeof globalThis;
    globalThis.document = {} as unknown as Document;
  });

  afterEach(() => {
    globalThis.window = origWin;
    globalThis.document = origDoc;
  });

  const baseNodeRect = {
    top: 50,
    left: 50,
    bottom: 150,
    right: 150,
    width: 100,
    height: 100,
  };

  it('returns empty modifier list when all options are disabled', () => {
    const list = useCanvasModifiers({
      containerRef: { current: null },
      activeEntries: [],
    });

    expect(list).toEqual([]);
  });

  it('creates window restriction modifier that clamps to viewport', () => {
    const list = useCanvasModifiers({
      restrictToWindow: true,
      containerRef: { current: null },
      activeEntries: [],
    });

    expect(list).toHaveLength(1);
    const windowModifier = list[0];

    const unconstrainedArgs = {
      active: { id: 'card-1' },
      activeNodeRect: null,
      transform: { x: 5000, y: 5000, scaleX: 1, scaleY: 1 },
    } as unknown as ModifierArgs;

    expect(windowModifier?.(unconstrainedArgs)).toEqual({
      x: 5000,
      y: 5000,
      scaleX: 1,
      scaleY: 1,
    });

    const activeArgs = {
      active: { id: 'card-1' },
      activeNodeRect: baseNodeRect,
      transform: { x: 2000, y: 2000, scaleX: 1, scaleY: 1 },
    } as unknown as ModifierArgs;

    // maxX = 1000 - 50 - 100 = 850
    // maxY = 800 - 50 - 100 = 650
    const clamped = windowModifier?.(activeArgs);
    expect(clamped?.x).toBe(850);
    expect(clamped?.y).toBe(650);
  });

  it('composes custom axis lock modifiers', () => {
    const horizontalAxisLock: Modifier = ({ transform }) => ({
      ...transform,
      y: 0,
    });
    const verticalAxisLock: Modifier = ({ transform }) => ({
      ...transform,
      x: 0,
    });

    const list = useCanvasModifiers({
      modifiers: [horizontalAxisLock, verticalAxisLock],
      containerRef: { current: null },
      activeEntries: [],
    });

    expect(list).toHaveLength(2);

    const args = {
      active: { id: 'card-axis' },
      activeNodeRect: baseNodeRect,
      transform: { x: 40, y: 80, scaleX: 1, scaleY: 1 },
    } as unknown as ModifierArgs;

    const lockedH = list[0]?.(args);
    expect(lockedH).toEqual({ x: 40, y: 0, scaleX: 1, scaleY: 1 });

    const lockedV = list[1]?.(args);
    expect(lockedV).toEqual({ x: 0, y: 80, scaleX: 1, scaleY: 1 });
  });

  it('creates container restriction modifier that clamps to container rect', () => {
    const mockContainer = {
      getBoundingClientRect: () => ({
        top: 0,
        left: 0,
        right: 400,
        bottom: 300,
        width: 400,
        height: 300,
      }),
    } as unknown as HTMLDivElement;

    const list = useCanvasModifiers({
      restrictToContainer: true,
      containerRef: { current: mockContainer },
      activeEntries: [],
    });

    expect(list).toHaveLength(1);
    const containerModifier = list[0];

    const args = {
      active: { id: 'card-1' },
      activeNodeRect: baseNodeRect,
      transform: { x: 1000, y: 1000, scaleX: 1, scaleY: 1 },
    } as unknown as ModifierArgs;

    // maxX = 400 - 50 - 100 = 250
    // maxY = 300 - 50 - 100 = 150
    const clamped = containerModifier?.(args);
    expect(clamped?.x).toBe(250);
    expect(clamped?.y).toBe(150);
  });
});

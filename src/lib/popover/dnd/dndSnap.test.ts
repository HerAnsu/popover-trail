import { describe, it, expect } from 'vitest';
import { createMagneticSnapModifier } from './dndSnap';

type ModifierArgs = Parameters<ReturnType<typeof createMagneticSnapModifier>>[0];

describe('dndSnap createMagneticSnapModifier', () => {
  it('returns unchanged transform when activeNodeRect is missing', () => {
    const modifier = createMagneticSnapModifier(() => []);
    const args = {
      active: { id: 'card-1' },
      activeNodeRect: null,
      transform: { x: 10, y: 20, scaleX: 1, scaleY: 1 },
    } as ModifierArgs;

    const res = modifier(args);
    expect(res).toEqual({ x: 10, y: 20, scaleX: 1, scaleY: 1 });
  });

  it('snaps dragged card to adjacent obstacle within threshold', () => {
    const obstacles = [{ id: 'card-2', rect: { x: 200, y: 100, width: 100, height: 100 } }];

    const modifier = createMagneticSnapModifier(() => obstacles, 15);

    const args = {
      active: { id: 'card-1' },
      activeNodeRect: { left: 50, top: 100, width: 100, height: 100 },
      transform: { x: 45, y: 0, scaleX: 1, scaleY: 1 },
    } as ModifierArgs;

    const res = modifier(args);
    expect(res.x).toBe(50);
  });
});

import { describe, it, expect } from 'vitest';
import { getPopoverStyles } from './styles';

describe('styles - getPopoverStyles', () => {
  it('generates style object with absolute positioning and transforms', () => {
    const style = getPopoverStyles({
      finalLayoutPos: { top: 100.4, left: 200.7 },
      offset: { x: 10, y: 20 },
      dragX: 5,
      dragY: 5,
      rotation: 2,
      rotationX: 1,
      rotationY: 3,
      zIndex: 1050,
    });

    expect(style.position).toBe('absolute');
    expect(style.top).toBe(100);
    expect(style.left).toBe(201);
    expect(style.zIndex).toBe(1050);
    expect(style.willChange).toBe('transform');
    expect(style.transform).toContain('translate(15px, 25px)');
    expect(style.transform).toContain('rotateX(1deg)');
    expect(style.transform).toContain('rotateY(3deg)');
    expect(style.transform).toContain('rotateZ(2deg)');
  });

  it('preserves referential identity for identical input arguments (memoization)', () => {
    const params = {
      finalLayoutPos: { top: 50, left: 50 },
      offset: { x: 0, y: 0 },
      zIndex: 1000,
    };

    const style1 = getPopoverStyles(params);
    const style2 = getPopoverStyles(params);

    expect(style1).toBe(style2);
  });
});

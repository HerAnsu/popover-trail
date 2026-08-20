import { describe, it, expect } from 'vitest';
import {
  FixedCenterLayoutStrategy,
  DockedBottomLayoutStrategy,
  DockedTopLayoutStrategy,
  RelativeFloatingLayoutStrategy,
  LayoutStrategyRegistry,
  type PopoverLayoutStrategyEngine,
} from './layoutStrategies';
import { RectBounds } from './valueObjects';

describe('layoutStrategies utility', () => {
  const mockTrigger = RectBounds.of(50, 100, 100, 30);
  const mockPopover = RectBounds.of(0, 0, 300, 200);

  describe('FixedCenterLayoutStrategy', () => {
    it('computes centered point based on viewport and popover dimensions', () => {
      const strategy = new FixedCenterLayoutStrategy();
      const pos = strategy.computePosition({
        triggerRect: mockTrigger,
        popoverRect: mockPopover,
        viewportWidth: 1000,
        viewportHeight: 800,
      });

      expect(pos.x).toBe((1000 - 300) / 2);
      expect(pos.y).toBe((800 - 200) / 2);
    });
  });

  describe('DockedBottomLayoutStrategy', () => {
    it('docked position at bottom of viewport', () => {
      const strategy = new DockedBottomLayoutStrategy();
      const pos = strategy.computePosition({
        triggerRect: mockTrigger,
        popoverRect: mockPopover,
        viewportHeight: 600,
      });

      expect(pos.x).toBe(0);
      expect(pos.y).toBe(600 - 200);
    });
  });

  describe('DockedTopLayoutStrategy', () => {
    it('docked top position returns zero coordinates', () => {
      const strategy = new DockedTopLayoutStrategy();
      const pos = strategy.computePosition({ triggerRect: mockTrigger });
      expect(pos.x).toBe(0);
      expect(pos.y).toBe(0);
    });
  });

  describe('RelativeFloatingLayoutStrategy', () => {
    const strategy = new RelativeFloatingLayoutStrategy();

    it('positions popover relative to trigger for all placements', () => {
      // bottom
      const b = strategy.computePosition({
        triggerRect: mockTrigger,
        placement: 'bottom',
        offset: 10,
      });
      expect(b.x).toBe(mockTrigger.left);
      expect(b.y).toBe(mockTrigger.bottom + 10);

      // top
      const t = strategy.computePosition({
        triggerRect: mockTrigger,
        placement: 'top',
        offset: 10,
      });
      expect(t.x).toBe(mockTrigger.left);
      expect(t.y).toBe(mockTrigger.top - 10);

      // right
      const r = strategy.computePosition({
        triggerRect: mockTrigger,
        placement: 'right',
        offset: 10,
      });
      expect(r.x).toBe(mockTrigger.right + 10);
      expect(r.y).toBe(mockTrigger.top);

      // left
      const l = strategy.computePosition({
        triggerRect: mockTrigger,
        placement: 'left',
        offset: 10,
      });
      expect(l.x).toBe(mockTrigger.left - 10);
      expect(l.y).toBe(mockTrigger.top);

      // bottom-end
      const be = strategy.computePosition({
        triggerRect: mockTrigger,
        placement: 'bottom-end',
        offset: 10,
      });
      expect(be.x).toBe(mockTrigger.right);
      expect(be.y).toBe(mockTrigger.bottom + 10);
    });
  });

  describe('LayoutStrategyRegistry', () => {
    it('registers and retrieves layout strategies with fallback', () => {
      const registry = new LayoutStrategyRegistry();
      expect(registry.get('fixed-center').id).toBe('fixed-center');
      expect(registry.get('docked-bottom').id).toBe('docked-bottom');
      expect(registry.get('docked-top').id).toBe('docked-top');
      expect(registry.get('unknown-strategy').id).toBe('floating-ui');

      const dockedBottomPos = registry.get('docked-bottom').computePosition({
        triggerRect: mockTrigger,
        popoverRect: mockPopover,
        viewportHeight: 500,
      });
      expect(dockedBottomPos.y).toBe(300);

      const dockedTopPos = registry.get('docked-top').computePosition({ triggerRect: mockTrigger });
      expect(dockedTopPos.x).toBe(0);

      const custom: PopoverLayoutStrategyEngine = {
        id: 'custom-strategy',
        computePosition: () => mockTrigger.center,
      };

      registry.register(custom);
      expect(registry.get('custom-strategy').id).toBe('custom-strategy');
      expect(registry.has('custom-strategy')).toBe(true);
      expect(registry.listStrategies()).toContain('custom-strategy');

      registry.unregister('custom-strategy');
      expect(registry.has('custom-strategy')).toBe(false);
    });
  });
});

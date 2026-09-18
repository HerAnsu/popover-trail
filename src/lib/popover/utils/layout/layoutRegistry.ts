/**
 * Registry Manager for Pluggable Layout Positioning Strategies.
 * Clean Architecture Layer 2: Headless State Management.
 *
 * @module utils/layout/layoutRegistry
 */

import {
  FixedCenterLayoutStrategy,
  DockedBottomLayoutStrategy,
  DockedTopLayoutStrategy,
} from './dockedStrategies';
import { RelativeFloatingLayoutStrategy } from './floatingStrategy';
import type { PopoverLayoutStrategyEngine } from './layoutStrategyTypes';

const relativeFloatingLayoutStrategy = new RelativeFloatingLayoutStrategy();
const fixedCenterLayoutStrategy = new FixedCenterLayoutStrategy();
const dockedBottomLayoutStrategy = new DockedBottomLayoutStrategy();
const dockedTopLayoutStrategy = new DockedTopLayoutStrategy();

/**
 * Central registry managing pluggable layout positioning strategies.
 *
 * @example
 * ```typescript
 * const strategy = globalLayoutStrategyRegistry.get('floating-ui');
 * const pos = strategy.computePosition(params);
 * ```
 */
export class LayoutStrategyRegistry {
  private readonly strategies = new Map<string, PopoverLayoutStrategyEngine>();

  constructor() {
    this.register(relativeFloatingLayoutStrategy);
    this.register(fixedCenterLayoutStrategy);
    this.register(dockedBottomLayoutStrategy);
    this.register(dockedTopLayoutStrategy);
  }

  register(strategy: PopoverLayoutStrategyEngine): void {
    if (!strategy || !strategy.id) return;
    this.strategies.set(strategy.id, strategy);
  }

  has(id: string): boolean {
    return this.strategies.has(id);
  }

  unregister(id: string): boolean {
    return this.strategies.delete(id);
  }

  listStrategies(): string[] {
    return [...this.strategies.keys()];
  }

  get(id: string): PopoverLayoutStrategyEngine {
    return this.strategies.get(id) ?? relativeFloatingLayoutStrategy;
  }
}

export const globalLayoutStrategyRegistry = new LayoutStrategyRegistry();

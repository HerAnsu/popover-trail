/**
 * Composable, Fault-Isolated Resetter Factories for Object Pools.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/poolReset
 */

import { tryResetItem } from './poolOperations';

export function composeResetters<T>(...resetters: Array<(item: T) => void>): (item: T) => void {
  return (item: T) => {
    for (const fn of resetters) {
      if (fn !== undefined) {
        tryResetItem(fn, item);
      }
    }
  };
}

export function createPropertyResetter<T extends object>(defaults: Partial<T>): (item: T) => void {
  return (item: T) => {
    Object.assign(item, defaults);
  };
}

export function createCollectionResetter<T extends { clear: () => void }>(): (item: T) => void {
  return (item: T) => {
    tryResetItem((c) => c.clear(), item);
  };
}

export function createArrayResetter<T extends { length: number }>(): (item: T) => void {
  return (item: T) => {
    item.length = 0;
  };
}

export function createVector2DResetter(
  defaultX = 0,
  defaultY = 0,
): (item: { x: number; y: number }) => void {
  return (item: { x: number; y: number }) => {
    item.x = defaultX;
    item.y = defaultY;
  };
}

export function createBoundingBoxResetter(
  defaultX = 0,
  defaultY = 0,
  defaultWidth = 0,
  defaultHeight = 0,
): (item: { x: number; y: number; width: number; height: number }) => void {
  return (item: { x: number; y: number; width: number; height: number }) => {
    item.x = defaultX;
    item.y = defaultY;
    item.width = defaultWidth;
    item.height = defaultHeight;
  };
}

export function createNoopResetter<T>(): (item: T) => void {
  return () => {};
}

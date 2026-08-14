import { useCallback, useEffect } from 'react';
import { usePopoverStore } from '../../context/usePopoverStore';
import { shallowEqual } from '../../utils/equality';
import type { PopoverActions, PopoverStore, TrailEntry } from '../../types';

const DEFAULT_OFFSET = Object.freeze({ x: 0, y: 0 });

export function resolveTransitionClassName(
  status: string | undefined,
  entryClasses: { mounting?: string; unmounting?: string; mounted?: string },
  globalClasses: { mounting?: string; unmounting?: string; mounted?: string },
): string {
  if (!status || (status !== 'mounting' && status !== 'mounted' && status !== 'unmounting')) {
    return '';
  }
  return entryClasses[status] ?? globalClasses[status] ?? '';
}

export function useCardMountingTransition(
  key: string,
  status: string | undefined,
  actions: PopoverActions,
): void {
  useEffect(() => {
    if (status === 'mounting') {
      let rAF2: number;
      const rAF1 = requestAnimationFrame(() => {
        rAF2 = requestAnimationFrame(() => {
          actions.setTransitionStatus(key, 'mounted');
        });
      });
      return () => {
        cancelAnimationFrame(rAF1);
        if (rAF2) {
          cancelAnimationFrame(rAF2);
        }
      };
    }
    return undefined;
  }, [key, status, actions]);
}

export function useCardStoreSlice(entryKey: string) {
  return usePopoverStore(
    useCallback(
      (state: PopoverStore) => ({
        offset: state.offsets[entryKey] ?? DEFAULT_OFFSET,
        zIndex: state.zIndexOrder.indexOf(entryKey),
        isTop:
          state.zIndexOrder.length > 0 &&
          state.zIndexOrder[state.zIndexOrder.length - 1] === entryKey,
        enableArrowNavigation: state.enableArrowNavigation,
        trail: state.trail,
        floating: state.floating,
        baseZIndex: state.baseZIndex,
        mountingClassName: state.mountingClassName,
        unmountingClassName: state.unmountingClassName,
        mountedClassName: state.mountedClassName,
        zIndexBaseMap: state.zIndexBaseMap,
      }),
      [entryKey],
    ),
    shallowEqual,
  );
}

export function resolveEffectiveBaseZIndex(
  entry: TrailEntry,
  zIndexBaseMap?: Record<string, number>,
  baseZIndex?: number,
): number {
  if (entry.baseZIndex !== undefined) return entry.baseZIndex;
  if (entry.stackGroup && zIndexBaseMap && zIndexBaseMap[entry.stackGroup] !== undefined) {
    return zIndexBaseMap[entry.stackGroup];
  }
  return baseZIndex ?? 1000;
}

export function resolveCardButtonControls(
  entry: TrailEntry,
  cardFeatures?: { enablePin?: boolean; enableClose?: boolean; enableDrag?: boolean },
) {
  const isPinEnabled =
    entry.enablePin ?? cardFeatures?.enablePin ?? entry.buttonControls?.enablePin ?? true;
  const isCloseEnabled =
    entry.enableClose ?? cardFeatures?.enableClose ?? entry.buttonControls?.enableClose ?? true;
  const isDragEnabled =
    entry.enableDrag ?? cardFeatures?.enableDrag ?? entry.buttonControls?.enableDrag ?? true;
  const customBtns = entry.customButtons ?? entry.buttonControls?.customButtons ?? [];

  return {
    enablePin: isPinEnabled,
    enableClose: isCloseEnabled,
    enableDrag: isDragEnabled,
    customButtons: customBtns,
  };
}

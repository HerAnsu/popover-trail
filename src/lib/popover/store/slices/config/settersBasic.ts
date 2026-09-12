/**
 * Basic and Numeric State Setters Sub-Slice for Popover Configuration.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module store/slices/config/settersBasic
 */

import type {
  ConfigSliceSetters,
  FocusLockOptions,
  PopoverResponsiveMode,
  PopoverStateData,
  StatePatch,
} from '../../../types';
import { isNonNegativeFinite, isPositiveFinite } from '../../../utils/typeGuards';
import { isZIndex, isDurationMs } from '../../../utils/guards/valueObjectGuards';
import { isFocusLockOptions } from '../../../utils/guards/configGuards';
import { validateBaseZIndex } from '../../../validators';
import type { ConfigSliceContext } from '../context';

export type BasicConfigSetters<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = Pick<
  ConfigSliceSetters<TData, TContext, TPopoverKey>,
  | 'setOwnerId'
  | 'setClosePinnedDescendants'
  | 'setEnableArrowNavigation'
  | 'setDebug'
  | 'setCascadeOffsetStep'
  | 'setExitTransitionDuration'
  | 'setDefaultOffset'
  | 'setBaseZIndex'
  | 'setAllowDragWhenPinned'
  | 'setAllowDragWhenUnpinned'
  | 'setMobileBreakpoint'
  | 'setFocusLockOptions'
  | 'setStackGroupFilter'
  | 'setResponsiveMode'
>;

export function createBasicConfigSetters<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  ctx: ConfigSliceContext<TData, TContext, TPopoverKey>,
): BasicConfigSetters<TData, TContext, TPopoverKey> {
  const { set, get } = ctx;

  const setIfChanged = <K extends keyof PopoverStateData<TData, TContext, TPopoverKey>>(
    key: K,
    value: PopoverStateData<TData, TContext, TPopoverKey>[K],
  ) => {
    if (get()[key] !== value) {
      const patch: StatePatch<TData, TContext, TPopoverKey> = { [key]: value };
      set(patch);
    }
  };

  return {
    setOwnerId: (ownerId: string | null) => setIfChanged('ownerId', ownerId),
    setClosePinnedDescendants: (close: boolean) => setIfChanged('closePinnedDescendants', close),
    setEnableArrowNavigation: (enable: boolean) => setIfChanged('enableArrowNavigation', enable),
    setDebug: (debug: boolean) => setIfChanged('debug', debug),
    setCascadeOffsetStep: (step: number) => {
      if (isNonNegativeFinite(step)) setIfChanged('cascadeOffsetStep', step);
    },
    setExitTransitionDuration: (duration: number) => {
      if (isDurationMs(duration) || isNonNegativeFinite(duration))
        setIfChanged('exitTransitionDuration', duration);
    },
    setDefaultOffset: (offset: number) => {
      if (isNonNegativeFinite(offset)) setIfChanged('defaultOffset', offset);
    },
    setBaseZIndex: (baseZIndex: number) => {
      validateBaseZIndex(baseZIndex);
      if (isZIndex(baseZIndex) || isNonNegativeFinite(baseZIndex))
        setIfChanged('baseZIndex', baseZIndex);
    },
    setAllowDragWhenPinned: (allow: boolean) => setIfChanged('allowDragWhenPinned', allow),
    setAllowDragWhenUnpinned: (allow: boolean) => setIfChanged('allowDragWhenUnpinned', allow),
    setMobileBreakpoint: (bp: number) => {
      if (isPositiveFinite(bp)) setIfChanged('mobileBreakpoint', bp);
    },
    setFocusLockOptions: (options: FocusLockOptions | null) => {
      if (options === null || isFocusLockOptions(options))
        setIfChanged('focusLockOptions', options);
    },
    setStackGroupFilter: (stackGroup: string | null) =>
      setIfChanged('activeStackGroup', stackGroup),
    setResponsiveMode: (mode: PopoverResponsiveMode) => setIfChanged('responsiveMode', mode),
  };
}

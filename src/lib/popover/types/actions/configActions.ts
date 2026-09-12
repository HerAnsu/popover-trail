/**
 * Action Signatures for Configuration, Styling, and Lifecycle Options Slices.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module types/actions/configActions
 */

import type { ButtonControlConfig, ZIndexBaseMap } from '../config/timingConfig';
import type { CollisionConfig, FocusLockOptions } from '../config/collisionConfig';
import type { PopoverResponsiveMode } from '../config/displayConfig';
import type { PopoverSlotComponents } from '../config/storeConfig';
import type { PopoverTransitionStatus } from '../entry/entryBase';
import type { PopoverResolver } from '../state/resolvers';
import type { PopoverStateData } from '../state/taxonomy';
import type { StackGroupId } from '../branded';

export interface ConfigSliceActions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  updateConfig: (patch: Partial<PopoverStateData<TData, TContext, TPopoverKey>>) => void;
  setContext: (context: TContext) => void;
  setResolveData: (resolver: PopoverResolver<TData, TContext>) => void;
  setOwnerId: (ownerId: string | null) => void;
  setClosePinnedDescendants: (close: boolean) => void;
  setCollisionConfig: (config: CollisionConfig | null) => void;
  setEnableArrowNavigation: (enable: boolean) => void;
  setDebug: (debug: boolean) => void;
  hoverEnter: (key: TPopoverKey) => void;
  hoverLeave: (key: TPopoverKey, delay?: number) => void;
  setCascadeOffsetStep: (step: number) => void;
  setTransitionStatus: (key: TPopoverKey, status: PopoverTransitionStatus) => void;
  setExitTransitionDuration: (duration: number) => void;
  setDefaultOffset: (offset: number) => void;
  setBaseZIndex: (baseZIndex: number) => void;
  setGlobalAnimationClassNames: (mounting: string, unmounting: string, mounted: string) => void;
  setAllowDragWhenPinned: (allow: boolean) => void;
  setAllowDragWhenUnpinned: (allow: boolean) => void;
  setMobileBreakpoint: (breakpoint: number) => void;
  setResponsiveMode: (mode: PopoverResponsiveMode) => void;
  setStackGroupFilter: (group: StackGroupId | string | null) => void;
  setButtonControls: (key: TPopoverKey, controls: ButtonControlConfig) => void;
  toggleButtonControl: (
    key: TPopoverKey,
    control: 'enablePin' | 'enableClose' | 'enableDrag',
    enabled?: boolean,
  ) => void;
  setSlotComponents: (components: PopoverSlotComponents | null) => void;
  setZIndexBaseMap: (map: ZIndexBaseMap | null) => void;
  setFocusLockOptions: (options: FocusLockOptions | null) => void;
}

export type ConfigSliceSetters<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = Omit<
  ConfigSliceActions<TData, TContext, TPopoverKey>,
  | 'updateConfig'
  | 'hoverEnter'
  | 'hoverLeave'
  | 'setTransitionStatus'
  | 'setButtonControls'
  | 'toggleButtonControl'
>;

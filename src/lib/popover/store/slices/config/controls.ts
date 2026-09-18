/**
 * Card Button Controls Domain Action Sub-Slice for popover-trail.
 * Encapsulates pin/close button visibility flags on individual card entries.
 *
 * @module store/slices/config/controls
 */

import type { ButtonControlConfig, ConfigSliceActions } from '../../../types';
import { findEntryInStore, shallowEqual } from '../../../utils/storeHelpers';
import { patchEntryInLists } from '../../reducers/stack';
import type { ConfigSliceContext } from '../context';

export type ControlsSliceActions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = Pick<
  ConfigSliceActions<TData, TContext, TPopoverKey>,
  'setButtonControls' | 'toggleButtonControl'
>;

/**
 * @example
 * ```ts
 * const controlsSlice = createControlsSlice(ctx);
 * controlsSlice.setButtonControls('card-1', { enablePin: false });
 * ```
 *
 * @template TData - Resolved popover data payload type.
 * @template TContext - Global shared store context type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param ctx - Slice context container with Zustand accessors.
 * @returns Button control configuration actions.
 */
export function createControlsSlice<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  ctx: ConfigSliceContext<TData, TContext, TPopoverKey>,
): ControlsSliceActions<TData, TContext, TPopoverKey> {
  const { set, get } = ctx;

  const patchControls = (
    key: TPopoverKey,
    updater: (prev?: ButtonControlConfig) => ButtonControlConfig,
  ) => {
    if (!key) return;
    const { floating, trail } = get();
    const entry = findEntryInStore(floating, trail, key);
    if (!entry) return;

    const nextControls = updater(entry.buttonControls);
    if (shallowEqual(entry.buttonControls, nextControls)) return;

    set(({ floating: f, trail: t }) =>
      patchEntryInLists<TData, TContext, TPopoverKey>(f, t, key, (prev) => ({
        ...prev,
        buttonControls: nextControls,
      })),
    );
  };

  return {
    setButtonControls: (key: TPopoverKey, config: ButtonControlConfig) => {
      patchControls(key, (prev) => ({ ...prev, ...config }));
    },

    toggleButtonControl: (
      key: TPopoverKey,
      controlName: 'enablePin' | 'enableClose' | 'enableDrag',
      enabled?: boolean,
    ) => {
      patchControls(key, (prev) => {
        const currentValue = prev?.[controlName] ?? true;
        return {
          ...prev,
          [controlName]: enabled ?? !currentValue,
        };
      });
    },
  };
}

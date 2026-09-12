/**
 * Store Action Command Payload Discriminated Union for popover-trail.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module types/actions/actionPayloads
 */

import type { DragOffset, PopoverRect } from '../geometry';
import type { PopoverTransitionStatus } from '../entry/entryBase';
import type { OpenNestedOptions, OpenRootOptions } from '../config/optionsConfig';

export const STORE_ACTION_TYPES = [
  'OPEN_ROOT',
  'PUSH_NESTED',
  'CLOSE_BY_KEY',
  'CLOSE_FROM',
  'CLOSE_TOPMOST',
  'CLOSE_ALL',
  'CLEAR_TRAIL',
  'TOGGLE_PIN',
  'BRING_TO_FRONT',
  'UPDATE_OFFSET',
  'RESOLVE_START',
  'RESOLVE_SUCCESS',
  'RESOLVE_ERROR',
  'SET_CONTEXT',
  'SET_TRANSITION_STATUS',
  'SET_DEBUG',
] as const;

export type StoreActionType = (typeof STORE_ACTION_TYPES)[number];

export type StoreActionPayload<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> =
  | {
      type: 'OPEN_ROOT';
      key: TPopoverKey;
      rect?: DOMRect | PopoverRect | null;
      options?: OpenRootOptions;
    }
  | { type: 'PUSH_NESTED'; key: TPopoverKey; parentKey: TPopoverKey; options?: OpenNestedOptions }
  | { type: 'CLOSE_BY_KEY'; key: TPopoverKey; options?: { transition?: boolean } }
  | { type: 'CLOSE_FROM'; index: number; options?: { transition?: boolean } }
  | { type: 'CLOSE_TOPMOST'; options?: { transition?: boolean } }
  | { type: 'CLOSE_ALL' }
  | { type: 'CLEAR_TRAIL' }
  | { type: 'TOGGLE_PIN'; key: TPopoverKey; rect?: DOMRect | PopoverRect }
  | { type: 'BRING_TO_FRONT'; key: TPopoverKey }
  | { type: 'UPDATE_OFFSET'; key: TPopoverKey; offset: DragOffset }
  | { type: 'RESOLVE_START'; key: TPopoverKey }
  | { type: 'RESOLVE_SUCCESS'; key: TPopoverKey; data: TData }
  | { type: 'RESOLVE_ERROR'; key: TPopoverKey; error: Error }
  | { type: 'SET_CONTEXT'; context: TContext }
  | { type: 'SET_TRANSITION_STATUS'; key: TPopoverKey; status: PopoverTransitionStatus }
  | { type: 'SET_DEBUG'; debug: boolean };

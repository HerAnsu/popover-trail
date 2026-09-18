/**
 * Finite State Automata (FSM) Module for popover-trail.
 *
 * @module store/fsm
 */

import type { PopoverStateValue } from './fsmTypes';
import type { PopoverFSMOptions } from './fsmInitializer';
import { VALID_TRANSITIONS } from './fsmMatrix';

export * from './fsmTypes';
export * from './fsmMatrix';
export * from './fsmInitializer';
export * from './fsmTransitions';
export * from './PopoverCardFSM';
export * from './fsmRegistry';
export * from './fsmObserver';
export * from './fsmGuards';

export type PopoverFSMInitialParam<TData = unknown, TPopoverKey extends string = string> =
  | PopoverStateValue
  | PopoverFSMOptions<TData, TPopoverKey>;
export type ValidStateTransitions = typeof VALID_TRANSITIONS;

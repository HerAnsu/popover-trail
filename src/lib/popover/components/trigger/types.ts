/**
 * Prop Types and Render Prop Contracts for PopoverTrigger.
 *
 * @module components/trigger/types
 */

import type React from 'react';
import type { OpenRootOptions, OpenNestedOptions, PopoverPlacement } from '../../types';

/**
 * Combined event handlers and accessibility attributes passed to custom trigger render props.
 */
export interface PopoverTriggerChildProps extends Record<string, unknown> {
  /** ARIA popup role declaration ('dialog'). */
  'aria-haspopup': 'dialog';
  /** Whether the associated popover card is currently open. */
  'aria-expanded': boolean;
  /** HTML id of the controlled popover card. */
  'aria-controls': string;
  /** Click event handler triggering popover toggle. */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  /** Pointer enter handler for hover-delayed opening. */
  onMouseEnter?: (e: React.MouseEvent<HTMLElement>) => void;
  /** Pointer leave handler for hover-delayed closing. */
  onMouseLeave?: (e: React.MouseEvent<HTMLElement>) => void;
  /** Keyboard handler for Enter/Space activation. */
  onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
  /** Focus event handler. */
  onFocus?: (e: React.FocusEvent<HTMLElement>) => void;
  /** Forwarded ref for element anchoring and positioning. */
  ref?: React.Ref<HTMLElement>;
}

/** Base prop types for the `<PopoverTrigger>` component. */
export interface BasePopoverTriggerProps<TPopoverKey extends string = string> {
  /** The unique key of the popover card that this trigger opens. */
  popoverKey: TPopoverKey;
  /** Layout placement direction preference relative to the trigger (e.g. 'right', 'bottom-start'). */
  placement?: PopoverPlacement;
  /** Custom distance gap offset override from trigger in pixels. */
  offset?: number;
  /** Extra trigger options configuration (hover delays, boundary collision behavior). */
  options?: Omit<OpenRootOptions | OpenNestedOptions, 'placement' | 'offset'>;
  /** CSS class to apply to the child element when the popover is active. */
  activeClassName?: string;
  /** If true, passes trigger props to child without forcing cloneElement mutations. */
  asChild?: boolean;
  /** React element child or render prop callback function. */
  children: React.ReactElement | ((props: PopoverTriggerChildProps) => React.ReactNode);
}

/** Prop types for a Root Trigger (spawns a new trail stack). */
export interface RootPopoverTriggerProps<
  TPopoverKey extends string = string,
> extends BasePopoverTriggerProps<TPopoverKey> {
  /** Root triggers cannot specify a parentKey. */
  parentKey?: never;
}

/** Prop types for a Nested Child Trigger (pushes child popover onto parent stack). */
export interface NestedPopoverTriggerProps<
  TPopoverKey extends string = string,
> extends BasePopoverTriggerProps<TPopoverKey> {
  /** The parent popover key that spawned this nested trigger. */
  parentKey: string;
}

/** Discriminated union representation of PopoverTriggerProps. */
export type PopoverTriggerProps<TPopoverKey extends string = string> =
  | RootPopoverTriggerProps<TPopoverKey>
  | NestedPopoverTriggerProps<TPopoverKey>;

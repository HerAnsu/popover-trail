/**
 * Hover Timings, Button Controls, and Keyboard Maps for popover-trail.
 * Clean Architecture Layer 1: Core Domain.
 *
 * @module types/config/timingConfig
 */

import type { StackGroupId } from '../branded';

export const KNOWN_KEYBOARD_KEYS = [
  'Escape',
  'Enter',
  'Tab',
  'Space',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
  'PageUp',
  'PageDown',
] as const;

export type KnownKeyboardKey = (typeof KNOWN_KEYBOARD_KEYS)[number] | (string & {});

export type KeyboardShortcutMap = Partial<Record<KnownKeyboardKey, (key: string) => void>>;

export type ZIndexBaseMap = Record<StackGroupId | string, number>;

export interface HoverConfig {
  enabled: boolean;
  openDelay?: number;
  closeDelay?: number;
  closeOnMouseLeave?: boolean;
}

export interface ButtonControlConfig {
  enablePin?: boolean;
  enableClose?: boolean;
  enableDrag?: boolean;
  customButtons?: ReadonlyArray<{
    id: string;
    label: string;
    icon?: string;
    disabled?: boolean;
    onClick?: (key: string) => void;
  }>;
}

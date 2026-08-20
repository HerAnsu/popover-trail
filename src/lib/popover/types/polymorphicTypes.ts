/**
 * Polymorphic Component Prop Utilities for popover-trail.
 * Provides strict element ref and prop inference for components accepting an `as` prop.
 *
 * @module types/polymorphicTypes
 */

import type { ElementType, ComponentPropsWithoutRef, ComponentPropsWithRef } from 'react';

/**
 * Extracts the appropriate `ref` type for a polymorphic element or component.
 *
 * @template E - The React element type (e.g. `'button'`, `'a'`, or a custom component).
 *
 * @example
 * ```typescript
 * type ButtonRef = PolymorphicRef<'button'>; // React.Ref<HTMLButtonElement>
 * type AnchorRef = PolymorphicRef<'a'>;      // React.Ref<HTMLAnchorElement>
 * ```
 */
export type PolymorphicRef<E extends ElementType> = ComponentPropsWithRef<E>['ref'];

/**
 * Constructs props for a polymorphic component, merging custom props with the HTML attributes
 * of element `E` while preserving forwarded `ref` typing.
 *
 * @template E - The underlying element or component tag type.
 * @template P - Custom component props.
 *
 * @example
 * ```tsx
 * export type PopoverCardProps<E extends ElementType = 'div'> =
 *   PolymorphicPropsWithRef<E, { cardKey: string }>;
 * ```
 */
export type PolymorphicPropsWithRef<E extends ElementType, P extends object = object> = P &
  Omit<ComponentPropsWithRef<E>, keyof P | 'as'> & {
    /** Override the underlying rendered DOM element or component. */
    as?: E;
  };

/**
 * Constructs props for a polymorphic component without ref forwarding.
 *
 * @template E - The underlying element or component tag type.
 * @template P - Custom component props.
 *
 * @example
 * ```tsx
 * export type TimelineStepProps<E extends ElementType = 'li'> =
 *   PolymorphicProps<E, { index: number }>;
 * ```
 */
export type PolymorphicProps<E extends ElementType, P extends object = object> = P &
  Omit<ComponentPropsWithoutRef<E>, keyof P | 'as'> & {
    /** Override the underlying rendered DOM element or component. */
    as?: E;
  };

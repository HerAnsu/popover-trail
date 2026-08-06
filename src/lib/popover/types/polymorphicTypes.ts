/**
 * Polymorphic Component Prop Utilities for popover-trail.
 * Provides strict element ref and prop inference for components accepting an `as` prop.
 *
 * @module types/polymorphicTypes
 */

import type { ElementType, ComponentPropsWithoutRef, ComponentPropsWithRef } from 'react';

/** Helper type inferring the ref prop type of a polymorphic component element. */
export type PolymorphicRef<E extends ElementType> = ComponentPropsWithRef<E>['ref'];

/** Polymorphic component props helper including strict element ref type inference. */
export type PolymorphicPropsWithRef<E extends ElementType, P = object> = P &
  Omit<ComponentPropsWithoutRef<E>, keyof P | 'as'> & {
    as?: E;
    ref?: PolymorphicRef<E>;
  };

/** Polymorphic component props helper without ref. */
export type PolymorphicProps<E extends ElementType, P = object> = P &
  Omit<ComponentPropsWithoutRef<E>, keyof P | 'as'> & {
    as?: E;
  };

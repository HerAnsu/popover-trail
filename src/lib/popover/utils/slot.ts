/**
 * Headless Composition Slot and Props Merging Primitive.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/slot
 */

import React, { cloneElement, isValidElement, forwardRef } from 'react';
import { clsx } from './clsx';
import { isReactRefObject, extractElementRef } from './guards/reactGuards';
import { isRecordObject } from './typeGuards';

/**
 * Composes two optional event handlers into a single callback.
 * Invokes `originalHandler` followed by `ourHandler`.
 *
 * @template E - Event object type.
 * @param originalHandler - Consumer's pre-existing event handler.
 * @param ourHandler - Internal library event handler.
 * @returns Combined event handler executing both functions sequentially.
 *
 * @example
 * ```typescript
 * const handleClick = composeHandlers(
 *   props.onClick,
 *   (e) => { console.log('Internal click handled'); },
 * );
 * ```
 */
export function composeHandlers<E>(
  originalHandler?: ((e: E) => void) | null,
  ourHandler?: ((e: E) => void) | null,
): (e: E) => void {
  return (e: E) => {
    originalHandler?.(e);
    ourHandler?.(e);
  };
}

/**
 * Merges slot properties with underlying child properties:
 * - Concatenates `className` strings via `clsx`.
 * - Merges nested `style` objects.
 * - Chains conflicting `on*` event handlers with `composeHandlers`.
 * - Overwrites remaining attributes with child properties taking precedence.
 *
 * @param slotProps - Host slot properties.
 * @param childProps - Target child component properties.
 * @returns Consolidated merged property dictionary.
 *
 * @example
 * ```typescript
 * const merged = mergeProps(
 *   { className: 'btn-slot', onClick: onSlotClick },
 *   { className: 'btn-child', onClick: onChildClick },
 * );
 * ```
 */
export function mergeProps(
  slotProps: Record<string, unknown>,
  childProps: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...slotProps, ...childProps };

  const slotClass = typeof slotProps.className === 'string' ? slotProps.className : undefined;
  const childClass = typeof childProps.className === 'string' ? childProps.className : undefined;
  if (slotClass || childClass) {
    result.className = clsx(slotClass, childClass);
  }

  if (slotProps.style || childProps.style) {
    result.style = {
      ...(typeof slotProps.style === 'object' && slotProps.style !== null ? slotProps.style : {}),
      ...(typeof childProps.style === 'object' && childProps.style !== null
        ? childProps.style
        : {}),
    };
  }

  for (const propName in slotProps) {
    if (Object.hasOwn(slotProps, propName) && propName.startsWith('on') && typeof slotProps[propName] === 'function') {
      const childHandler = childProps[propName];
      const slotHandler = slotProps[propName];
      if (typeof childHandler === 'function' && typeof slotHandler === 'function') {
        result[propName] = composeHandlers(
          (e: unknown) => childHandler(e),
          (e: unknown) => slotHandler(e),
        );
      }
    }
  }

  return result;
}

function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null): void {
  if (typeof ref === 'function') ref(node);
  else if (isReactRefObject<T>(ref)) ref.current = node;
}

export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

/**
 * Headless Polymorphic Slot Component.
 * Clones its single child element and merges incoming properties, classes, styles, and refs
 * without rendering an unnecessary wrapper DOM node (`asChild` pattern).
 *
 * @example
 * ```tsx
 * <Slot className="custom-trigger" onClick={handleOpen}>
 *   <button type="button">Open Popover</button>
 * </Slot>
 * ```
 */
export const Slot = forwardRef<HTMLElement, SlotProps>(({ children, ...slotProps }, ref) => {
  if (isValidElement(children)) {
    const childRef = extractElementRef<HTMLElement>(children);
    const mergedRef = (node: HTMLElement | null) => {
      assignRef(ref, node);
      assignRef(childRef, node);
    };

    const childProps = isRecordObject(children.props) ? children.props : {};
    const safeSlotProps = isRecordObject(slotProps) ? slotProps : {};

    return cloneElement(
      children,
      mergeProps(safeSlotProps, {
        ...childProps,
        ref: mergedRef,
      }),
    );
  }

  return null;
});

Slot.displayName = 'Slot';

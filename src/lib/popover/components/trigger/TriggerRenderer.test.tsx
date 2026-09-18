import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { createRef } from 'react';
import { TriggerRenderer } from './TriggerRenderer';
import { TriggerRegistry } from '../../utils/triggerRegistry';
import type { PopoverTriggerChildProps } from './types';

type EffectCallback = () => (() => void) | void;
const capturedEffects: EffectCallback[] = [];
let nodeRefHolder = { current: null as HTMLElement | null };

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  const mockedRef = <T,>(_init: T) => nodeRefHolder as unknown as { current: T };
  const mockedEff = (fn: EffectCallback) => {
    capturedEffects.push(fn);
  };
  const mockedCb = <T extends (...args: readonly unknown[]) => unknown>(fn: T): T => fn;
  const mockOverrides = { useRef: mockedRef, useEffect: mockedEff, useCallback: mockedCb };
  return { ...actual, ...mockOverrides, default: { ...actual, ...mockOverrides } };
});

vi.mock('../../hooks/useHookUtils', () => ({
  useMergedRef: (
    nodeRef: React.RefObject<HTMLElement | null>,
    childRef?: React.Ref<HTMLElement>,
  ) => {
    return (node: HTMLElement | null) => {
      if (nodeRef && 'current' in nodeRef)
        (nodeRef as { current: HTMLElement | null }).current = node;
      if (typeof childRef === 'function') childRef(node);
      else if (childRef && 'current' in childRef)
        (childRef as { current: HTMLElement | null }).current = node;
    };
  },
}));

describe('TriggerRenderer component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedEffects.length = 0;
    nodeRefHolder = { current: null };
    TriggerRegistry.clear();
  });

  const runEffects = (): Array<() => void> => {
    const cleanups: Array<() => void> = [];
    for (const eff of capturedEffects) {
      const c = eff();
      if (typeof c === 'function') cleanups.push(c);
    }
    return cleanups;
  };

  it('delegates to custom render prop with a11y attributes and active class', () => {
    let capturedProps: PopoverTriggerChildProps | null = null;
    const renderProp = (props: PopoverTriggerChildProps) => {
      capturedProps = props;
      return (
        <button type="button" {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
          Trigger
        </button>
      );
    };

    TriggerRenderer({
      popoverKey: 'card-1',
      triggerProps: { 'aria-controls': 'menu-card-1', className: 'btn-base' },
      isOpen: true,
      activeClassName: 'btn-active',
      children: renderProp,
    });

    expect(capturedProps).not.toBeNull();
    const props = capturedProps as unknown as PopoverTriggerChildProps;
    expect(props['aria-haspopup']).toBe('dialog');
    expect(props['aria-expanded']).toBe(true);
    expect(props['aria-controls']).toBe('menu-card-1');
    expect(props.className).toBe('btn-base btn-active');
  });

  it('delegates to child element via slot cloning and composes handlers', () => {
    const triggerClick = vi.fn();
    const childClick = vi.fn();
    const mockEvent = {} as React.MouseEvent<HTMLElement>;

    const child = (
      <button className="base-class" onClick={childClick}>
        Child Button
      </button>
    );
    const vnode = TriggerRenderer({
      popoverKey: 'card-2',
      triggerProps: { onClick: triggerClick },
      isOpen: false,
      activeClassName: 'active-class',
      children: child,
    });

    expect(React.isValidElement(vnode)).toBe(true);
    if (
      React.isValidElement<{
        className?: string;
        onClick?: (e: unknown) => void;
        'aria-expanded'?: boolean;
      }>(vnode)
    ) {
      expect(vnode.props['aria-expanded']).toBe(false);
      expect(vnode.props.className).toBe('base-class');
      vnode.props.onClick?.(mockEvent);
      expect(triggerClick).toHaveBeenCalledWith(mockEvent);
      expect(childClick).toHaveBeenCalledWith(mockEvent);
    }
  });

  it('forwards ref correctly to child ref', () => {
    const forwardedRef = createRef<HTMLButtonElement>();
    const child = <button ref={forwardedRef}>Target</button>;
    const vnode = TriggerRenderer({
      popoverKey: 'card-3',
      triggerProps: {},
      isOpen: false,
      children: child,
    });

    if (React.isValidElement<{ ref?: React.Ref<HTMLElement> }>(vnode)) {
      const refHandler = vnode.props.ref;
      expect(refHandler).toBeDefined();
      const mockBtn = {} as HTMLButtonElement;
      if (typeof refHandler === 'function') refHandler(mockBtn);
      expect(forwardedRef.current).toBe(mockBtn);
    }
  });

  it('registers node in TriggerRegistry on mount and unregisters on unmount', () => {
    const mockElement = {} as HTMLElement;
    nodeRefHolder.current = mockElement;

    TriggerRenderer({
      popoverKey: 'card-reg',
      triggerProps: {},
      isOpen: false,
      children: <button>Reg</button>,
    });

    const cleanups = runEffects();
    expect(TriggerRegistry.has('card-reg')).toBe(true);
    expect(TriggerRegistry.get('card-reg')).toBe(mockElement);

    for (const c of cleanups) c();
    expect(TriggerRegistry.has('card-reg')).toBe(false);
  });
});

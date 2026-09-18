import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { CardActionButtonBase } from './CardActionButtonBase';

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useCallback: <T extends (...args: readonly unknown[]) => unknown>(fn: T): T => fn,
  };
});

describe('CardActionButtonBase component', () => {
  it('propagates click to both onAction and onClick handlers when enabled', () => {
    const onAction = vi.fn();
    const onClick = vi.fn();
    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.MouseEvent<HTMLButtonElement>;

    const element = CardActionButtonBase({
      onAction,
      onClick,
      children: 'Click Me',
    });

    expect(element.type).toBe('button');
    expect(element.props.type).toBe('button');
    expect(element.props.disabled).toBeUndefined();

    element.props.onClick?.(mockEvent);

    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith(mockEvent);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(mockEvent);
  });

  it('prevents default and suppresses actions when disabled is true', () => {
    const onAction = vi.fn();
    const onClick = vi.fn();
    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.MouseEvent<HTMLButtonElement>;

    const element = CardActionButtonBase({
      onAction,
      onClick,
      disabled: true,
      children: 'Disabled Button',
    });

    expect(element.props.disabled).toBe(true);

    element.props.onClick?.(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(onAction).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('sets aria-label attribute correctly on the element', () => {
    const element = CardActionButtonBase({
      onAction: vi.fn(),
      ariaLabel: 'Close Dialog Card',
      children: '✕',
    });

    expect(element.props['aria-label']).toBe('Close Dialog Card');
    expect(element.props.children).toBe('✕');
  });

  it('supports polymorphic as prop and suppresses native button type', () => {
    const onAction = vi.fn();
    const element = CardActionButtonBase({
      as: 'a',
      href: '#section',
      onAction,
      children: 'Anchor Link',
    });

    expect(element.type).toBe('a');
    expect(element.props.type).toBeUndefined();
    expect(element.props.href).toBe('#section');
  });
});

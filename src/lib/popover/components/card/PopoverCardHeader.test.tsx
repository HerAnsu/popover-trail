import { describe, it, expect } from 'vitest';
import React from 'react';
import { PopoverCardHeader } from './PopoverCardHeader';
import { PopoverCardHandle } from './PopoverCardHandle';
import { PopoverCardPinButton } from './PopoverCardPinButton';
import { PopoverCardCloseButton } from './PopoverCardCloseButton';

describe('PopoverCardHeader component', () => {
  it('attaches drag handle as root container with default classes and styles', () => {
    const vnode = PopoverCardHeader({});

    expect(vnode.type).toBe(PopoverCardHandle);
    expect(vnode.props.className).toContain('pt-card-header');
    expect(vnode.props.style?.display).toBe('flex');
    expect(vnode.props.style?.justifyContent).toBe('space-between');
    expect(React.isValidElement(vnode)).toBe(true);
  });

  it('renders title slot when title prop is provided', () => {
    const vnode = PopoverCardHeader({ title: 'Card Title' });
    const titleElement = vnode.props.children[0];

    expect(React.isValidElement(titleElement)).toBe(true);
    if (React.isValidElement<{ className?: string; children?: React.ReactNode }>(titleElement)) {
      expect(titleElement.type).toBe('span');
      expect(titleElement.props.className).toBe('pt-card-title');
      expect(titleElement.props.children).toBe('Card Title');
    }
  });

  it('omits title slot when title is undefined', () => {
    const vnode = PopoverCardHeader({});
    const titleElement = vnode.props.children[0];

    expect(titleElement).toBeNull();
  });

  it('renders custom children in the compound header slot', () => {
    const customBadge = <span key="badge">Status</span>;
    const vnode = PopoverCardHeader({ children: customBadge });
    const renderedChild = vnode.props.children[1];

    expect(renderedChild).toBe(customBadge);
  });

  it('renders both pin and close action buttons by default', () => {
    const vnode = PopoverCardHeader({});
    const actionsWrapper = vnode.props.children[2];

    expect(React.isValidElement(actionsWrapper)).toBe(true);
    if (
      React.isValidElement<{ children?: [React.ReactElement | null, React.ReactElement | null] }>(
        actionsWrapper,
      )
    ) {
      const [pinBtn, closeBtn] = actionsWrapper.props.children ?? [null, null];
      expect(pinBtn?.type).toBe(PopoverCardPinButton);
      expect(closeBtn?.type).toBe(PopoverCardCloseButton);
    }
  });

  it('selectively hides pin or close button based on props', () => {
    const vnodeNoPin = PopoverCardHeader({ showPin: false, showClose: true });
    const actionsWrapperNoPin = vnodeNoPin.props.children[2];

    if (
      React.isValidElement<{ children?: [React.ReactElement | null, React.ReactElement | null] }>(
        actionsWrapperNoPin,
      )
    ) {
      const [pinBtn, closeBtn] = actionsWrapperNoPin.props.children ?? [null, null];
      expect(pinBtn).toBeNull();
      expect(closeBtn?.type).toBe(PopoverCardCloseButton);
    }

    const vnodeNoClose = PopoverCardHeader({ showPin: true, showClose: false });
    const actionsWrapperNoClose = vnodeNoClose.props.children[2];

    if (
      React.isValidElement<{ children?: [React.ReactElement | null, React.ReactElement | null] }>(
        actionsWrapperNoClose,
      )
    ) {
      const [pinBtn, closeBtn] = actionsWrapperNoClose.props.children ?? [null, null];
      expect(pinBtn?.type).toBe(PopoverCardPinButton);
      expect(closeBtn).toBeNull();
    }
  });

  it('merges custom className and custom style overrides', () => {
    const vnode = PopoverCardHeader({
      className: 'custom-header',
      style: { backgroundColor: 'red', gap: '16px' },
    });

    expect(vnode.props.className).toContain('pt-card-header');
    expect(vnode.props.className).toContain('custom-header');
    expect(vnode.props.style?.backgroundColor).toBe('red');
    expect(vnode.props.style?.gap).toBe('16px');
    expect(vnode.props.style?.display).toBe('flex');
  });

  it('truncates title when maxTitleLength is specified', () => {
    const vnode = PopoverCardHeader({
      title: 'Very Long Popover Title Heading',
      maxTitleLength: 15,
    });
    const titleElement = vnode.props.children[0];

    expect(titleElement).not.toBeNull();
    if (React.isValidElement<{ children?: string }>(titleElement)) {
      expect(titleElement.props.children).toBe(`${'Very Long Popover Title Heading'.slice(0, 12)}...`);
    }
  });
});

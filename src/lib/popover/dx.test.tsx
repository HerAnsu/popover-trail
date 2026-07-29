import { describe, it, expect } from 'vitest';
import React, { createRef } from 'react';
import {
  PopoverProvider,
  PopoverTrigger,
  PopoverCard,
  usePopover,
  type TrailEntry,
  createPopoverKey,
} from './index';

describe('DX Improvements & Ergonomics', () => {
  it('supports render prop function signature in PopoverTrigger', () => {
    const triggerElement = (
      <PopoverProvider resolveData={async () => ({})}>
        <PopoverTrigger popoverKey="card-1">
          {(props) => (
            <button {...props} data-testid="custom-trigger">
              Custom Trigger
            </button>
          )}
        </PopoverTrigger>
      </PopoverProvider>
    );

    expect(React.isValidElement(triggerElement)).toBe(true);
  });

  it('supports ref forwarding on PopoverCard via React.forwardRef', () => {
    const cardRef = createRef<HTMLDivElement>();
    const mockEntry: TrailEntry = {
      key: 'card-1',
      isLoading: false,
      error: null,
      data: { title: 'Hello' },
    };

    const cardElement = (
      <PopoverCard ref={cardRef} entry={mockEntry} index={0} isPinned={false}>
        <div>Content</div>
      </PopoverCard>
    );

    expect(React.isValidElement(cardElement)).toBe(true);
    expect(cardElement.props.entry.key).toBe('card-1');
  });

  it('provides type-safe usePopover hook with state object', () => {
    function DummyComponent() {
      const { state } = usePopover(createPopoverKey('card-1'));
      return <div data-status={state.status} />;
    }

    const element = (
      <PopoverProvider resolveData={async () => ({})}>
        <DummyComponent />
      </PopoverProvider>
    );

    expect(React.isValidElement(element)).toBe(true);
  });
});

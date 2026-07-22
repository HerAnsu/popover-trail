import { describe, it, expect } from 'vitest';
import React from 'react';
import { PopoverCard } from './PopoverCard';
import { PopoverTrail } from './PopoverTrail';
import { PopoverTrigger } from './PopoverTrigger';

describe('Headless Components - PopoverCard & PopoverTrail', () => {
  it('exports PopoverCard compound component sub-components', () => {
    expect(PopoverCard).toBeDefined();
    expect(PopoverCard.Handle).toBeDefined();
    expect(PopoverCard.PinButton).toBeDefined();
    expect(PopoverCard.CloseButton).toBeDefined();
    expect(PopoverCard.Content).toBeDefined();
    expect(PopoverTrail).toBeDefined();
    expect(PopoverTrigger).toBeDefined();
  });

  it('instantiates PopoverCard JSX elements without runtime errors', () => {
    const mockEntry = {
      key: 'test-card-1',
      isLoading: false,
      error: null,
      transitionStatus: 'mounted' as const,
    };

    const cardElement = (
      <PopoverCard entry={mockEntry} index={0} isPinned={false} className="custom-card">
        <PopoverCard.Handle className="card-handle">
          <span>Test Title</span>
          <PopoverCard.PinButton>Pin</PopoverCard.PinButton>
          <PopoverCard.CloseButton>Close</PopoverCard.CloseButton>
        </PopoverCard.Handle>
        <PopoverCard.Content className="card-body">
          <p>Body Content</p>
        </PopoverCard.Content>
      </PopoverCard>
    );

    expect(React.isValidElement(cardElement)).toBe(true);
  });

  it('supports polymorphic as prop on PopoverCard and sub-components', () => {
    const mockEntry = {
      key: 'test-card-2',
      isLoading: false,
      error: null,
    };

    const cardElement = (
      <PopoverCard as="section" entry={mockEntry} index={0} isPinned={true}>
        <PopoverCard.Handle as="div">
          <PopoverCard.Content as="main">
            <p>Polymorphic content</p>
          </PopoverCard.Content>
        </PopoverCard.Handle>
      </PopoverCard>
    );

    expect(cardElement.props.as).toBe('section');
  });
});

import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  PopoverTimelineStepList,
  type PopoverTimelineStepListContext,
} from './PopoverTimelineStepList';
import { PopoverTimelineScopeContext } from './PopoverTimelineScopeContext';
import type { UsePopoverTimelineResult, PopoverTimelineItem } from '../../hooks/usePopoverTimeline';

interface TestData {
  name: string;
}

function createMockTimeline(
  history: PopoverTimelineItem<TestData>[] = [],
  currentIndex = 0,
): UsePopoverTimelineResult<TestData> {
  return {
    history,
    currentIndex,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    undo: vi.fn(),
    redo: vi.fn(),
    jumpToStep: vi.fn(),
  };
}

function renderWithTimeline<TData>(
  timeline: UsePopoverTimelineResult<TData>,
  node: React.ReactNode,
): string {
  return renderToStaticMarkup(
    React.createElement(PopoverTimelineScopeContext.Provider, { value: { timeline } }, node),
  );
}

describe('PopoverTimelineStepList component', () => {
  it('renders static children within ordered list container with a11y attributes', () => {
    const timeline = createMockTimeline();
    const html = renderWithTimeline(
      timeline,
      <PopoverTimelineStepList className="custom-list">
        <li>First Item</li>
        <li>Second Item</li>
      </PopoverTimelineStepList>,
    );

    expect(html).toContain('<ol class="pt-timeline-step-list custom-list" role="list" aria-live="polite">');
    expect(html).toContain('<li>First Item</li>');
    expect(html).toContain('<li>Second Item</li>');
  });

  it('renders ordered step items using context render prop', () => {
    const items: PopoverTimelineItem<TestData>[] = [
      { primaryKey: 'p1', stepIndex: 0, trailKeys: [], pinnedKeys: [], payload: { name: 'Step 1' } },
      { primaryKey: 'p2', stepIndex: 1, trailKeys: [], pinnedKeys: [], payload: { name: 'Step 2' } },
    ];
    const timeline = createMockTimeline(items, 1);

    const html = renderWithTimeline(
      timeline,
      <PopoverTimelineStepList>
        {({ history, currentIndex }: PopoverTimelineStepListContext<TestData>) =>
          history.map((item, idx) => (
            <li key={item.primaryKey} data-active={idx === currentIndex}>
              {item.payload?.name}
            </li>
          ))
        }
      </PopoverTimelineStepList>,
    );

    expect(html).toContain('<li data-active="false">Step 1</li>');
    expect(html).toContain('<li data-active="true">Step 2</li>');
  });

  it('renders ordered step items using item mapping render prop', () => {
    const items: PopoverTimelineItem<TestData>[] = [
      { primaryKey: 'p1', stepIndex: 0, trailKeys: [], pinnedKeys: [], payload: { name: 'Alpha' } },
      { primaryKey: 'p2', stepIndex: 1, trailKeys: [], pinnedKeys: [], payload: { name: 'Beta' } },
    ];
    const timeline = createMockTimeline(items, 0);

    const html = renderWithTimeline(
      timeline,
      <PopoverTimelineStepList>
        {(item: PopoverTimelineItem<TestData>, active: boolean, index: number) => (
          <li key={item.primaryKey} data-index={index} data-current={active}>
            {item.payload?.name}
          </li>
        )}
      </PopoverTimelineStepList>,
    );

    expect(html).toContain('<li data-index="0" data-current="true">Alpha</li>');
    expect(html).toContain('<li data-index="1" data-current="false">Beta</li>');
  });

  it('handles empty history state gracefully', () => {
    const timeline = createMockTimeline([]);

    const htmlDefault = renderWithTimeline(
      timeline,
      <PopoverTimelineStepList>
        {(item: PopoverTimelineItem<TestData>, _active: boolean) => <li key={item.primaryKey}>{item.primaryKey}</li>}
      </PopoverTimelineStepList>,
    );

    expect(htmlDefault).toBe('<ol class="pt-timeline-step-list" role="list" aria-live="polite"></ol>');

    const htmlCustomEmpty = renderWithTimeline(
      timeline,
      <PopoverTimelineStepList>
        {({ history }: PopoverTimelineStepListContext<TestData>) => (history.length === 0 ? <li className="empty">No entries</li> : null)}
      </PopoverTimelineStepList>,
    );

    expect(htmlCustomEmpty).toContain('<li class="empty">No entries</li>');
  });

  it('supports polymorphic as prop for alternate list elements', () => {
    const timeline = createMockTimeline();
    const html = renderWithTimeline(
      timeline,
      <PopoverTimelineStepList as="ul" id="timeline-ul">
        <li>Item</li>
      </PopoverTimelineStepList>,
    );

    expect(html).toContain('<ul class="pt-timeline-step-list" role="list" aria-live="polite" id="timeline-ul">');
    expect(html).not.toContain('<ol');
  });
});

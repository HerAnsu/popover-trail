import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PopoverTimelineUndoButton } from './PopoverTimelineUndoButton';
import { PopoverTimelineRedoButton } from './PopoverTimelineRedoButton';
import type { UsePopoverTimelineResult } from '../../hooks/usePopoverTimeline';

const mockUndo = vi.fn();
const mockRedo = vi.fn();

function createMockTimeline(canUndo: boolean, canRedo: boolean): UsePopoverTimelineResult<unknown> {
  return {
    history: [],
    currentIndex: 0,
    canUndo,
    canRedo,
    undo: mockUndo,
    redo: mockRedo,
    jumpToStep: vi.fn(),
  };
}

let activeScope = { timeline: createMockTimeline(false, false) };

vi.mock('./PopoverTimelineScopeContext', () => ({
  usePopoverTimelineScope: () => activeScope,
}));

describe('PopoverTimelineButtonsState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('disables undo button when canUndo is false and suppresses clicks', () => {
    const timeline = createMockTimeline(false, true);
    activeScope = { timeline };
    const customOnClick = vi.fn();
    const preventDefault = vi.fn();

    const html = renderToStaticMarkup(
      <PopoverTimelineUndoButton onClick={customOnClick}>Revert</PopoverTimelineUndoButton>,
    );

    expect(html).toContain('disabled=""');
    expect(html).toContain('aria-label="Undo Popover Action"');
    expect(html).toContain('Revert');

    const vnode = PopoverTimelineUndoButton({ onClick: customOnClick });
    vnode.props.onClick?.({ preventDefault } as unknown as React.MouseEvent<HTMLElement>);

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(mockUndo).not.toHaveBeenCalled();
    expect(customOnClick).not.toHaveBeenCalled();
  });

  it('enables undo button when canUndo is true and triggers undo on click', () => {
    const timeline = createMockTimeline(true, false);
    activeScope = { timeline };
    const customOnClick = vi.fn();

    const html = renderToStaticMarkup(<PopoverTimelineUndoButton onClick={customOnClick} />);

    expect(html).not.toContain('disabled=""');
    expect(html).toContain('Undo');

    const vnode = PopoverTimelineUndoButton({ onClick: customOnClick });
    vnode.props.onClick?.({} as React.MouseEvent<HTMLElement>);

    expect(mockUndo).toHaveBeenCalledTimes(1);
    expect(customOnClick).toHaveBeenCalledTimes(1);
  });

  it('disables redo button when canRedo is false and suppresses clicks', () => {
    const timeline = createMockTimeline(true, false);
    activeScope = { timeline };
    const customOnClick = vi.fn();
    const preventDefault = vi.fn();

    const html = renderToStaticMarkup(<PopoverTimelineRedoButton onClick={customOnClick} />);

    expect(html).toContain('disabled=""');
    expect(html).toContain('aria-label="Redo Popover Action"');
    expect(html).toContain('Redo');

    const vnode = PopoverTimelineRedoButton({ onClick: customOnClick });
    vnode.props.onClick?.({ preventDefault } as unknown as React.MouseEvent<HTMLElement>);

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(mockRedo).not.toHaveBeenCalled();
    expect(customOnClick).not.toHaveBeenCalled();
  });

  it('enables redo button when canRedo is true and triggers redo on click', () => {
    const timeline = createMockTimeline(false, true);
    activeScope = { timeline };
    const customOnClick = vi.fn();

    const html = renderToStaticMarkup(<PopoverTimelineRedoButton onClick={customOnClick} />);

    expect(html).not.toContain('disabled=""');

    const vnode = PopoverTimelineRedoButton({ onClick: customOnClick });
    vnode.props.onClick?.({} as React.MouseEvent<HTMLElement>);

    expect(mockRedo).toHaveBeenCalledTimes(1);
    expect(customOnClick).toHaveBeenCalledTimes(1);
  });

  it('honors explicit disabled prop even if timeline state allows action', () => {
    const timeline = createMockTimeline(true, true);
    activeScope = { timeline };

    const htmlUndo = renderToStaticMarkup(<PopoverTimelineUndoButton disabled={true} />);
    expect(htmlUndo).toContain('disabled=""');

    const htmlRedo = renderToStaticMarkup(<PopoverTimelineRedoButton disabled={true} />);
    expect(htmlRedo).toContain('disabled=""');
  });

  it('supports polymorphic as prop', () => {
    const timeline = createMockTimeline(true, true);
    activeScope = { timeline };

    const html = renderToStaticMarkup(<PopoverTimelineUndoButton as="span" />);

    expect(html).toContain('<span class="pt-timeline-undo-btn"');
    expect(html).not.toContain('type="button"');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PopoverTimelineStep, type PopoverTimelineStepProps } from './PopoverTimelineStep';

const mockJumpToStep = vi.fn();
let mockTimeline = {
  currentIndex: 1,
  canUndo: true,
  canRedo: true,
  history: [
    { primaryKey: 's0', stepIndex: 0 },
    { primaryKey: 's1', stepIndex: 1 },
    { primaryKey: 's2', stepIndex: 2 },
  ],
  jumpToStep: mockJumpToStep,
};

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    memo: <T,>(fn: T): T => fn,
  };
});

vi.mock('./PopoverTimelineScopeContext', () => ({
  usePopoverTimelineScope: () => ({ timeline: mockTimeline }),
}));

interface RenderedStepProps {
  type?: string;
  className?: string;
  'data-index'?: number;
  'data-key'?: string;
  'data-current'?: string;
  'aria-current'?: string;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
  style?: React.CSSProperties;
}

function renderStep<E extends React.ElementType = 'button'>(
  props: PopoverTimelineStepProps<E>,
): React.ReactElement<RenderedStepProps> {
  const vnode = PopoverTimelineStep(props) as React.ReactElement<RenderedStepProps>;
  const Component = vnode.type as (p: unknown) => React.ReactElement<RenderedStepProps>;
  return Component(vnode.props);
}

describe('PopoverTimelineStep component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTimeline = {
      currentIndex: 1,
      canUndo: true,
      canRedo: true,
      history: [
        { primaryKey: 's0', stepIndex: 0 },
        { primaryKey: 's1', stepIndex: 1 },
        { primaryKey: 's2', stepIndex: 2 },
      ],
      jumpToStep: mockJumpToStep,
    };
  });

  it('renders step with key, index, label fallback, and button attributes', () => {
    const el = renderStep({
      index: 0,
      label: 'Setup Phase',
    });

    expect(el.type).toBe('button');
    expect(el.props.type).toBe('button');
    expect(el.props['data-index']).toBe(0);
    expect(el.props['data-key']).toBe('Setup Phase');
    expect(el.props.children).toBe('Setup Phase');
  });

  it('sets active state indicators when step matches currentIndex', () => {
    const elActive = renderStep({ index: 1 });

    expect(elActive.props.className).toContain('pt-timeline-step-current');
    expect(elActive.props['data-current']).toBe('true');
    expect(elActive.props['aria-current']).toBe('step');

    const elInactive = renderStep({ index: 0 });

    expect(elInactive.props.className).not.toContain('pt-timeline-step-current');
    expect(elInactive.props['data-current']).toBe('false');
    expect(elInactive.props['aria-current']).toBeUndefined();
  });

  it('allows explicit active prop override', () => {
    const el = renderStep({ index: 0, active: true });

    expect(el.props['data-current']).toBe('true');
    expect(el.props['aria-current']).toBe('step');
  });

  it('triggers jumpToStep on click and delegates to onClick prop', () => {
    const customOnClick = vi.fn();
    const mockEvent = {} as React.MouseEvent<HTMLElement>;

    const el = renderStep({
      index: 2,
      onClick: customOnClick,
    });

    el.props.onClick?.(mockEvent);

    expect(mockJumpToStep).toHaveBeenCalledWith(2);
    expect(customOnClick).toHaveBeenCalledWith(mockEvent);
  });

  it('handles keyboard navigation with ArrowLeft and ArrowRight', () => {
    const el = renderStep({ index: 1 });

    const leftEvent = {
      key: 'ArrowLeft',
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent<HTMLElement>;
    el.props.onKeyDown?.(leftEvent);

    expect(leftEvent.preventDefault).toHaveBeenCalled();
    expect(mockJumpToStep).toHaveBeenCalledWith(0);

    const rightEvent = {
      key: 'ArrowRight',
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent<HTMLElement>;
    el.props.onKeyDown?.(rightEvent);

    expect(rightEvent.preventDefault).toHaveBeenCalled();
    expect(mockJumpToStep).toHaveBeenCalledWith(2);
  });

  it('renders static markup correctly via React DOM server', () => {
    const html = renderToStaticMarkup(<PopoverTimelineStep index={1} label="Active Item" />);

    expect(html).toContain('pt-timeline-step-current');
    expect(html).toContain('aria-current="step"');
    expect(html).toContain('data-current="true"');
    expect(html).toContain('Active Item');
  });

  it('supports polymorphic as prop without button type', () => {
    const el = renderStep({ as: 'li', index: 0 });

    expect(el.type).toBe('li');
    expect(el.props.type).toBeUndefined();
  });

  it('truncates label when maxLabelLength is provided', () => {
    const el = renderStep({
      index: 0,
      label: 'Very Long Step Label In Timeline',
      maxLabelLength: 15,
    });

    expect(el.props.children).toBe(`${'Very Long Step Label In Timeline'.slice(0, 12)}...`);
    expect(el.props['data-key']).toBe(`${'Very Long Step Label In Timeline'.slice(0, 12)}...`);
  });
});

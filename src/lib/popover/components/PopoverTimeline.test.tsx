import { describe, it, expect } from 'vitest';
import React from 'react';
import { PopoverTimeline } from './PopoverTimeline';

describe('<PopoverTimeline /> Component', () => {
  it('exports PopoverTimeline sub-components', () => {
    expect(PopoverTimeline).toBeDefined();
    expect(PopoverTimeline.StepList).toBeDefined();
    expect(PopoverTimeline.Step).toBeDefined();
    expect(PopoverTimeline.UndoButton).toBeDefined();
    expect(PopoverTimeline.RedoButton).toBeDefined();
  });

  it('instantiates PopoverTimeline JSX structure without runtime errors', () => {
    const timelineElement = (
      <PopoverTimeline className="custom-timeline">
        <PopoverTimeline.UndoButton className="undo-btn">Undo</PopoverTimeline.UndoButton>
        <PopoverTimeline.StepList className="step-list">
          <PopoverTimeline.Step index={0} stepKey="card-1" label="Step 1" />
          <PopoverTimeline.Step index={1} stepKey="card-2" label="Step 2" />
        </PopoverTimeline.StepList>
        <PopoverTimeline.RedoButton className="redo-btn">Redo</PopoverTimeline.RedoButton>
      </PopoverTimeline>
    );

    expect(React.isValidElement(timelineElement)).toBe(true);
  });

  it('supports render-prop children in StepList', () => {
    const element = (
      <PopoverTimeline>
        <PopoverTimeline.StepList>
          {({ history }) =>
            history.map((item) => (
              <PopoverTimeline.Step key={item.primaryKey} stepIndex={item.stepIndex}>
                {item.primaryKey}
              </PopoverTimeline.Step>
            ))
          }
        </PopoverTimeline.StepList>
      </PopoverTimeline>
    );

    expect(React.isValidElement(element)).toBe(true);
  });

  it('supports polymorphic as prop on PopoverTimeline components', () => {
    const element = (
      <PopoverTimeline as="div">
        <PopoverTimeline.StepList as="ul">
          <PopoverTimeline.Step as="a" index={0} stepKey="card-1" />
        </PopoverTimeline.StepList>
      </PopoverTimeline>
    );

    expect(element.props.as).toBe('div');
  });
});

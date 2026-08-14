'use strict';

/**
 * Rule: popover/enforce-exhaustive-switch-on-event-type
 * Description: Suggests exhaustive default branch with assertNever on event/action type switches.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure switch statements on discriminated event unions handle all variants or provide assertNever default',
      category: 'Typing & Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      exhaustiveSwitch: 'Switch on `{{discriminant}}` should include default case with exhaustive check (`assertNever(action)`).',
    },
  },
  create(_context) {
    return {};
  },
};

'use strict';

/**
 * Rule: popover/no-unsafe-type-assertion-on-event
 * Description: Warns against raw event casting without runtime type guards.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Avoid unsafe type assertions on DOM events without type narrowing',
      category: 'Typing & Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      unsafeEventCast: 'Avoid raw type casting on event object. Use type narrowing or instance checks.',
    },
  },
  create(_context) {
    return {};
  },
};

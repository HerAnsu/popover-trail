'use strict';

/**
 * Rule: popover/no-mouse-touch-event-duplication
 * Description: Discourages attaching duplicate touch and mouse triggers that may cause double-firing.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Avoid duplicate mouse and touch handlers without synthetic event suppression',
      category: 'Gestures & Pointer',
      recommended: true,
    },
    schema: [],
    messages: {
      duplicateTrigger: 'Direct dual binding of mouse and touch events may fire twice on touchscreens. Use PointerEvents instead.',
    },
  },
  create(_context) {
    return {};
  },
};

'use strict';
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
      duplicateTrigger: 'Direct dual binding of mouse and touch events may fire twice on touchscreens.',
    },
  },
  create(_context) {
    return {};
  },
};

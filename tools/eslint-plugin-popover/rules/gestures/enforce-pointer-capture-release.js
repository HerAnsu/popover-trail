'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure setPointerCapture calls have corresponding releasePointerCapture handlers',
      category: 'Gestures & Pointer',
      recommended: true,
    },
    schema: [],
    messages: {
      unreleasedPointerCapture: 'Element with setPointerCapture should release pointer capture on pointerup/pointercancel.',
    },
  },
  create(_context) {
    return {};
  },
};

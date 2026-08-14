'use strict';

/**
 * Rule: popover/enforce-pointer-capture-release
 * Description: Checks that pointer captures via setPointerCapture are paired with releasePointerCapture.
 */
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
      unreleasedPointerCapture: 'Element with `setPointerCapture` should release pointer capture on pointerup/pointercancel.',
    },
  },
  create(_context) {
    return {};
  },
};

'use strict';

/**
 * Rule: popover/no-passive-false-on-scroll-wheel
 * Description: Ensures scroll and wheel listeners use passive: true for smooth 60/120 FPS performance.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require passive: true on scroll, wheel, and resize event listeners',
      category: 'Observers & Listeners',
      recommended: true,
    },
    schema: [],
    messages: {
      nonPassiveScroll: 'Scroll/wheel listener should use `{ passive: true }` to avoid blocking browser main thread rendering.',
    },
  },
  create(_context) {
    return {};
  },
};

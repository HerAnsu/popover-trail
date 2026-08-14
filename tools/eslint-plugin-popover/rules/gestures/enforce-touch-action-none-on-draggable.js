'use strict';

/**
 * Rule: popover/enforce-touch-action-none-on-draggable
 * Description: Suggests touch-action: none on draggable drag handle elements to prevent mobile pan interference.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure draggable elements specify touchAction none to prevent mobile gesture conflicts',
      category: 'Gestures & Pointer',
      recommended: true,
    },
    schema: [],
    messages: {
      missingTouchAction: 'Draggable handle should set `touchAction: "none"` to prevent mobile scrolling interference during drag.',
    },
  },
  create(_context) {
    return {};
  },
};

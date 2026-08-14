'use strict';
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

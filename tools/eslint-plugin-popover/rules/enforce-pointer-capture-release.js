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
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee && node.callee.property && node.callee.property.name === 'setPointerCapture') {
          const src = context.getSourceCode ? context.getSourceCode().getText() : '';
          if (!src.includes('releasePointerCapture')) {
            context.report({ node, messageId: 'unreleasedPointerCapture' });
          }
        }
      },
    };
  },
};

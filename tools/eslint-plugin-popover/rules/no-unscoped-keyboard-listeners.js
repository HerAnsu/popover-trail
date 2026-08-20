'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensure global keyboard listeners are scoped to active or top-level popover cards',
      category: 'Keyboard Navigation',
      recommended: true,
    },
    schema: [],
    messages: {
      unscopedKeyboard:
        'Global keydown listener should verify card active focus or zIndex elevation.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (filename.includes('.test.')) return {};
    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.property &&
          node.callee.property.name === 'addEventListener' &&
          node.arguments[0] &&
          node.arguments[0].value === 'keydown' &&
          node.callee.object &&
          node.callee.object.name === 'window'
        ) {
          const src = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (!src.includes('active') && !src.includes('isOpen') && !src.includes('selected')) {
            context.report({ node, messageId: 'unscopedKeyboard' });
          }
        }
      },
    };
  },
};

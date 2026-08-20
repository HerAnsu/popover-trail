'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure viewport resize handlers are throttled to prevent layout thrashing',
      category: 'Responsive & Viewport',
      recommended: true,
    },
    schema: [],
    messages: {
      unthrottledResize:
        'Window resize listener should be throttled or debounced to avoid layout thrashing.',
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
          node.arguments[0].value === 'resize'
        ) {
          const handler = node.arguments[1];
          if (
            handler &&
            (handler.type === 'ArrowFunctionExpression' || handler.type === 'FunctionExpression')
          ) {
            const src = context.getSourceCode ? context.getSourceCode().getText(handler) : '';
            if (
              src.includes('getBoundingClientRect') &&
              !src.includes('throttle') &&
              !src.includes('debounce') &&
              !src.includes('requestAnimationFrame')
            ) {
              context.report({ node, messageId: 'unthrottledResize' });
            }
          }
        }
      },
    };
  },
};

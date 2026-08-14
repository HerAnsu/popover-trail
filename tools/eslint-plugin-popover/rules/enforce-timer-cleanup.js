'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure useEffect starting setTimeout or setInterval returns a cleanup function',
      category: 'Memory & Timers',
      recommended: true,
    },
    schema: [],
    messages: {
      missingTimerCleanup: 'useEffect with timer (setTimeout/setInterval) should return a cleanup function to prevent memory leaks.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee && (node.callee.name === 'useEffect' || node.callee.name === 'useLayoutEffect')) {
          const callback = node.arguments[0];
          if (callback && (callback.type === 'ArrowFunctionExpression' || callback.type === 'FunctionExpression')) {
            const src = context.getSourceCode ? context.getSourceCode().getText(callback) : '';
            if ((src.includes('setTimeout') || src.includes('setInterval')) && !src.includes('clearTimeout') && !src.includes('clearInterval') && !src.includes('return')) {
              context.report({ node, messageId: 'missingTimerCleanup' });
            }
          }
        }
      },
    };
  },
};

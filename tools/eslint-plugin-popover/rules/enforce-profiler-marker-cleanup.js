'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure performance profiler marks are cleaned up to prevent memory growth',
      category: 'Profiling & Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      missingClearMarks: 'Calls to performance.mark() should clear marks with performance.clearMarks() when measurement ends.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.property &&
          node.callee.property.name === 'mark' &&
          node.callee.object &&
          node.callee.object.name === 'performance'
        ) {
          const src = context.getSourceCode ? context.getSourceCode().getText() : '';
          if (!src.includes('clearMarks')) {
            context.report({ node, messageId: 'missingClearMarks' });
          }
        }
      },
    };
  },
};

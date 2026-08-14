'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure dedicated Web Workers are terminated in component or hook cleanup',
      category: 'Web Worker & Offload',
      recommended: true,
    },
    schema: [],
    messages: {
      missingTerminate: 'Dedicated Web Worker instance should be terminated via `worker.terminate()` in cleanup.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (filename.includes('.test.')) return {};
    return {
      NewExpression(node) {
        if (node.callee && node.callee.name === 'Worker') {
          const src = context.getSourceCode ? context.getSourceCode().getText() : '';
          if (!src.includes('terminate()')) {
            context.report({ node, messageId: 'missingTerminate' });
          }
        }
      },
    };
  },
};

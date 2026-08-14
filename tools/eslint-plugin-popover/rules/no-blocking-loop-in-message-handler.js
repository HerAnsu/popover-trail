/**
 * @fileoverview Disallow infinite or unyielding while loops in Web Worker onmessage callbacks.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow blocking while (true) loops in worker onmessage handlers to maintain responsive event handling.',
      category: 'Concurrency',
      recommended: true,
    },
    schema: [],
    messages: {
      noBlockingWorkerLoop: 'Avoid synchronous while(true) in worker onmessage handler; use iterative chunking or queue.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      WhileStatement(node) {
        if (
          node.test &&
          node.test.type === 'Literal' &&
          node.test.value === true &&
          (filename.includes('worker') || filename.includes('Worker'))
        ) {
          context.report({
            node,
            messageId: 'noBlockingWorkerLoop',
          });
        }
      },
    };
  },
};

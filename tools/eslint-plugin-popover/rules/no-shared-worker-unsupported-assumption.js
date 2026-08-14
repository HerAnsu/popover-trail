/**
 * @fileoverview Require checking typeof SharedWorker !== 'undefined' before instantiation.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require feature detection check before instantiating SharedWorker.',
      category: 'Resilience',
      recommended: true,
    },
    schema: [],
    messages: {
      requireSharedWorkerCheck: 'Check typeof SharedWorker !== "undefined" before creating SharedWorker instance.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      NewExpression(node) {
        if (node.callee && node.callee.name === 'SharedWorker') {
          const scope = context.getSourceCode ? context.getSourceCode().getText() : '';
          if (scope && !scope.includes("typeof SharedWorker !== 'undefined'")) {
            context.report({
              node,
              messageId: 'requireSharedWorkerCheck',
            });
          }
        }
      },
    };
  },
};

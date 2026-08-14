/**
 * @fileoverview Absolutely disallow synchronous XMLHttpRequest in client packages.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow synchronous XMLHttpRequest which blocks UI thread.',
      category: 'Resilience',
      recommended: true,
    },
    schema: [],
    messages: {
      noSyncXhr: 'Synchronous XMLHttpRequest is strictly forbidden; use fetch() with async/await.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.property &&
          node.callee.property.name === 'open' &&
          node.arguments &&
          node.arguments[2] &&
          node.arguments[2].type === 'Literal' &&
          node.arguments[2].value === false
        ) {
          context.report({
            node,
            messageId: 'noSyncXhr',
          });
        }
      },
    };
  },
};

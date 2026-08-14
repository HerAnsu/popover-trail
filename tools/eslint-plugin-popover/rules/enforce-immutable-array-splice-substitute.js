/**
 * @fileoverview Disallow mutable Array.prototype.splice() in store reducers.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow mutable Array.splice() in reducers; use filter(), slice(), or toSpliced().',
      category: 'Store Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      noSpliceInStore: 'Do not mutate array directly with splice(); use filter() or toSpliced() to maintain immutability.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.property &&
          node.callee.property.name === 'splice' &&
          node.callee.object &&
          (node.callee.object.name === 'trail' ||
            node.callee.object.name === 'floating' ||
            node.callee.object.name === 'pinned')
        ) {
          context.report({
            node,
            messageId: 'noSpliceInStore',
          });
        }
      },
    };
  },
};

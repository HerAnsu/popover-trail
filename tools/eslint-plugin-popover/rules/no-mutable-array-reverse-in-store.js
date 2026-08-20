/**
 * @fileoverview Disallow mutable Array reverse() or sort() directly in reducers.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow mutable Array.reverse() and Array.sort() without defensive cloning in reducers.',
      category: 'Correctness',
      recommended: true,
    },
    schema: [],
    messages: {
      noMutableSort:
        'Do not mutate arrays directly with sort() or reverse(); clone first with [...arr] or arr.slice().',
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
          (node.callee.property.name === 'reverse' || node.callee.property.name === 'sort') &&
          node.callee.object &&
          node.callee.object.type === 'Identifier' &&
          (node.callee.object.name === 'trail' ||
            node.callee.object.name === 'floating' ||
            node.callee.object.name === 'zIndexOrder')
        ) {
          context.report({
            node,
            messageId: 'noMutableSort',
          });
        }
      },
    };
  },
};

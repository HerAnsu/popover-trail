/**
 * @fileoverview Disallow adding event listeners inside loops or recursive blocks.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow registering event listeners directly inside loops to prevent memory leaks.',
      category: 'Memory',
      recommended: true,
    },
    schema: [],
    messages: {
      noListenerInLoop: 'Do not register addEventListener inside a loop; attach once outside or use event delegation.',
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
          node.callee.property.name === 'addEventListener'
        ) {
          let parent = node.parent;
          while (parent) {
            if (
              parent.type === 'ForStatement' ||
              parent.type === 'ForOfStatement' ||
              parent.type === 'ForInStatement' ||
              parent.type === 'WhileStatement'
            ) {
              context.report({
                node,
                messageId: 'noListenerInLoop',
              });
              break;
            }
            parent = parent.parent;
          }
        }
      },
    };
  },
};

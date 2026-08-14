'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure state snapshots are sanitized of non-serializable objects (Functions, DOM)',
      category: 'Cross-Tab Bus',
      recommended: true,
    },
    schema: [],
    messages: {
      unsafeSnapshot: 'State snapshots must only contain serializable JSON data.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.property &&
          node.callee.property.name === 'takeSnapshot' &&
          node.arguments.length > 0 &&
          node.arguments[0].type === 'Identifier' &&
          node.arguments[0].name === 'window'
        ) {
          context.report({ node, messageId: 'unsafeSnapshot' });
        }
      },
    };
  },
};

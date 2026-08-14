/**
 * @fileoverview Disallow mutating self globals in Web Worker resolver scripts.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow mutating global self properties in Web Worker script contexts.',
      category: 'Resilience',
      recommended: true,
    },
    schema: [],
    messages: {
      noGlobalWorkerMutation: 'Do not mutate global self.{{ prop }} inside worker resolver script.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('worker') && !filename.includes('Worker')) return {};

    return {
      AssignmentExpression(node) {
        if (
          node.left &&
          node.left.type === 'MemberExpression' &&
          node.left.object &&
          node.left.object.name === 'self' &&
          node.left.property &&
          node.left.property.name !== 'onmessage' &&
          node.left.property.name !== 'onerror'
        ) {
          context.report({
            node,
            messageId: 'noGlobalWorkerMutation',
            data: { prop: node.left.property.name },
          });
        }
      },
    };
  },
};

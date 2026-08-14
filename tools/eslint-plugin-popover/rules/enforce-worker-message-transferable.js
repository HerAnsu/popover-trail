/**
 * @fileoverview Recommend Transferable objects when passing large binary buffers to Web Workers.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend passing Transferable buffers in postMessage second argument for zero-copy IPC.',
      category: 'Concurrency',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestTransferable: 'Passing ArrayBuffer to worker.postMessage without transfer list; add transfer list for zero-copy IPC.',
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
          node.callee.property.name === 'postMessage' &&
          node.arguments.length === 1 &&
          node.arguments[0] &&
          node.arguments[0].type === 'Identifier' &&
          (node.arguments[0].name.includes('Buffer') || node.arguments[0].name.includes('ArrayBuffer'))
        ) {
          context.report({
            node,
            messageId: 'suggestTransferable',
          });
        }
      },
    };
  },
};

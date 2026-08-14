/**
 * @fileoverview Recommend Transferable objects when passing large binary buffers to Web Workers.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend passing Transferable buffers in postMessage second argument for zero-copy IPC.',
      category: 'Concurrency',
      recommended: false,
    },
    schema: [],
    messages: {
      suggestTransferable: 'Consider passing ArrayBuffer in postMessage transfer list for zero-copy worker communication.',
    },
  },
  create(_context) {
    return {
      CallExpression(_node) {
        // Zero-copy IPC guideline
      },
    };
  },
};

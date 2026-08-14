/**
 * @fileoverview Recommend Atomics operations when writing to SharedArrayBuffer.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage using Atomics.store or Atomics.compareExchange when modifying SharedArrayBuffer.',
      category: 'Concurrency',
      recommended: true,
    },
    schema: [],
    messages: {
      useAtomicsForSharedBuffer: 'Direct array assignment on SharedArrayBuffer view in {{ name }}; consider Atomics.store().',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      AssignmentExpression(node) {
        if (
          node.left &&
          node.left.type === 'MemberExpression' &&
          node.left.object &&
          node.left.object.name &&
          node.left.object.name.toLowerCase().includes('sharedarray')
        ) {
          context.report({
            node,
            messageId: 'useAtomicsForSharedBuffer',
            data: { name: node.left.object.name },
          });
        }
      },
    };
  },
};

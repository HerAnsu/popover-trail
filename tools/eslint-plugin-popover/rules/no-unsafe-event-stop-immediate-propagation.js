/**
 * @fileoverview Disallow calling event.stopImmediatePropagation() in library interaction handlers.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow stopImmediatePropagation which breaks composability with host app listeners.',
      category: 'Correctness',
      recommended: true,
    },
    schema: [],
    messages: {
      noStopImmediate:
        'Avoid stopImmediatePropagation(); use stopPropagation() or custom event delegation.',
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
          node.callee.property.name === 'stopImmediatePropagation'
        ) {
          context.report({
            node,
            messageId: 'noStopImmediate',
          });
        }
      },
    };
  },
};

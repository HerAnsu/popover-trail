/**
 * @fileoverview Disallow Math.random() in core ID generation; enforce deterministic counters or crypto.randomUUID.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow raw Math.random() in key generation to avoid duplicate ID collisions in fast cascades.',
      category: 'Clean Code',
      recommended: true,
    },
    schema: [],
    messages: {
      noMathRandomInKeys:
        'Do not use Math.random() for popover IDs; use atomic counter or crypto.randomUUID().',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.object &&
          node.callee.object.name === 'Math' &&
          node.callee.property &&
          node.callee.property.name === 'random' &&
          node.parent &&
          node.parent.type === 'BinaryExpression'
        ) {
          context.report({
            node,
            messageId: 'noMathRandomInKeys',
          });
        }
      },
    };
  },
};

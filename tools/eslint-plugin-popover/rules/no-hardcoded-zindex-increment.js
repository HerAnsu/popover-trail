/**
 * @fileoverview Disallow arbitrary large magic numbers added to zIndex calculations.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow magic numbers added to zIndex; use relative layer ordering or stackGroup base maps.',
      category: 'Architecture',
      recommended: true,
    },
    schema: [],
    messages: {
      noMagicZIndexIncrement: 'Do not add arbitrary magic numbers (+{{ val }}) to zIndex. Use zIndexBaseMap or relative stacking.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      BinaryExpression(node) {
        if (
          node.operator === '+' &&
          node.left &&
          node.left.name === 'zIndex' &&
          node.right &&
          node.right.type === 'Literal' &&
          typeof node.right.value === 'number' &&
          node.right.value > 100
        ) {
          context.report({
            node,
            messageId: 'noMagicZIndexIncrement',
            data: { val: node.right.value },
          });
        }
      },
    };
  },
};

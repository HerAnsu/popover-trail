/**
 * @fileoverview Recommend vector helper methods for complex matrix3d transform generation.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage structured vector transform helper functions over manual matrix string concatenation.',
      category: 'Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      useMatrixHelper: 'Avoid raw string interpolation for {{ matrix }}; use buildMatrix3DTransform() helper.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      TemplateLiteral(node) {
        const text = node.quasis.map((q) => q.value.raw).join('');
        if (text.includes('matrix3d(') && node.expressions.length > 4) {
          const parent = node.parent;
          if (parent && parent.type === 'Property' && parent.key && parent.key.name === 'transform') {
            context.report({
              node,
              messageId: 'useMatrixHelper',
              data: { matrix: 'matrix3d' },
            });
          }
        }
      },
    };
  },
};

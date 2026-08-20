/**
 * @fileoverview Recommend Float32Array for matrix3d vector calculations.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Recommend Float32Array or Float64Array for 4x4 matrix storage to maximize SIMD performance.',
      category: 'Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestTypedArray:
        'Matrix {{ name }} initialized as plain array; consider Float32Array for zero-GC math operations.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (
      filename.includes('eslint-plugin') ||
      filename.includes('rules/') ||
      filename.includes('.test.') ||
      filename.includes('tests/')
    )
      return {};

    return {
      VariableDeclarator(node) {
        if (
          node.id &&
          node.id.name &&
          node.id.name.includes('Matrix') &&
          node.init &&
          node.init.type === 'ArrayExpression' &&
          node.init.elements.length === 16
        ) {
          context.report({
            node,
            messageId: 'suggestTypedArray',
            data: { name: node.id.name },
          });
        }
      },
    };
  },
};

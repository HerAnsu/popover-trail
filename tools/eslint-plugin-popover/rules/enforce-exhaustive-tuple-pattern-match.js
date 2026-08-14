/**
 * @fileoverview Recommend complete tuple handling in 2D coordinate destructuring [x, y].
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend destructuring both x and y coordinates when handling 2D point tuples.',
      category: 'Type Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestTupleCompleteness: 'Destructuring from coordinate tuple {{ name }} only captures 1 element; consider [x, y].',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      VariableDeclarator(node) {
        if (
          node.id &&
          node.id.type === 'ArrayPattern' &&
          node.id.elements.length === 1 &&
          node.init &&
          node.init.type === 'Identifier' &&
          (node.init.name.includes('Coord') || node.init.name.includes('Point') || node.init.name.includes('Vector'))
        ) {
          context.report({
            node,
            messageId: 'suggestTupleCompleteness',
            data: { name: node.init.name },
          });
        }
      },
    };
  },
};

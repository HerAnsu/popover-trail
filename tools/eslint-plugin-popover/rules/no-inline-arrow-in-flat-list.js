/**
 * @fileoverview Disallow complex multi-statement inline arrow functions inside high-frequency JSX lists.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Encourage extracting subcomponents instead of inline heavy multi-line JSX map loops.',
      category: 'Performance',
      recommended: false,
    },
    schema: [],
    messages: {
      extractListSubcomponent:
        'Extract multi-statement inline JSX map callback into a memoized subcomponent.',
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
          node.callee.property.name === 'map' &&
          node.arguments &&
          node.arguments[0] &&
          node.arguments[0].type === 'ArrowFunctionExpression' &&
          node.arguments[0].body &&
          node.arguments[0].body.type === 'BlockStatement' &&
          node.arguments[0].body.body.length > 8
        ) {
          context.report({
            node,
            messageId: 'extractListSubcomponent',
          });
        }
      },
    };
  },
};

/**
 * @fileoverview Disallow deeply nested ternary expressions inside JSX render trees.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow nested ternary operators in JSX; extract to helper or early return.',
      category: 'Clean Code',
      recommended: false,
    },
    schema: [],
    messages: {
      noNestedTernaryInJsx: 'Avoid nested ternary inside JSX; extract to a local variable or render helper.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      ConditionalExpression(node) {
        if (
          (node.consequent && node.consequent.type === 'ConditionalExpression') ||
          (node.alternate && node.alternate.type === 'ConditionalExpression')
        ) {
          let parent = node.parent;
          while (parent) {
            if (parent.type === 'JSXElement' || parent.type === 'JSXFragment') {
              context.report({
                node,
                messageId: 'noNestedTernaryInJsx',
              });
              break;
            }
            parent = parent.parent;
          }
        }
      },
    };
  },
};

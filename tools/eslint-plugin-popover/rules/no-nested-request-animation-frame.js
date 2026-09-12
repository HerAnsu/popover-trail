/**
 * @fileoverview Disallow nesting multiple requestAnimationFrame calls.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow nested requestAnimationFrame callbacks; use loop with state check instead.',
      category: 'Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      noNestedRaf:
        'Avoid deeply nesting requestAnimationFrame within requestAnimationFrame; use a continuous tick function.',
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
      CallExpression(node) {
        if (
          node.callee?.name === 'requestAnimationFrame' &&
          node.arguments[0] &&
          (node.arguments[0].type === 'ArrowFunctionExpression' ||
            node.arguments[0].type === 'FunctionExpression')
        ) {
          let parent = node.parent;
          while (parent) {
            if (
              parent.type === 'CallExpression' &&
              parent.callee?.name === 'requestAnimationFrame'
            ) {
              context.report({
                node,
                messageId: 'noNestedRaf',
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

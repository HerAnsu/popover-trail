/**
 * @fileoverview Disallow redundant double boolean casting like !!Boolean(x) or Boolean(!!x).
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow redundant nested boolean casts.',
      category: 'Clean Code',
      recommended: true,
    },
    schema: [],
    messages: {
      redundantBoolCast: 'Redundant boolean cast detected.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.name === 'Boolean' &&
          node.arguments &&
          node.arguments[0] &&
          node.arguments[0].type === 'UnaryExpression' &&
          node.arguments[0].operator === '!' &&
          node.arguments[0].argument &&
          node.arguments[0].argument.type === 'UnaryExpression' &&
          node.arguments[0].argument.operator === '!'
        ) {
          context.report({
            node,
            messageId: 'redundantBoolCast',
          });
        }
      },
    };
  },
};

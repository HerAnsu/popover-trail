'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer early return null when popover is inactive or not mounted',
      category: 'Component API Design',
      recommended: true,
    },
    schema: [],
    messages: {
      earlyReturn: 'Prefer early return null when isOpen / isMounted is false.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (!filename.includes('components/') || filename.includes('.test.')) return {};
    return {
      IfStatement(node) {
        if (
          node.test &&
          node.test.type === 'UnaryExpression' &&
          node.test.operator === '!' &&
          node.test.argument &&
          (node.test.argument.name === 'isOpen' || node.test.argument.name === 'isMounted') &&
          node.consequent &&
          node.consequent.type === 'ReturnStatement' &&
          node.consequent.argument &&
          node.consequent.argument.type === 'Literal' &&
          node.consequent.argument.value !== null
        ) {
          context.report({ node, messageId: 'earlyReturn' });
        }
      },
    };
  },
};

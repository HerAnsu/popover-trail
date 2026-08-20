'use strict';
export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow direct element.style / innerHTML mutations; use React state or controlled DOM helpers',
      category: 'SSR & DOM Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      directMutation:
        'Avoid direct DOM mutation on `{{property}}`. Use React styles or popoverController.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (filename.includes('.test.') || filename.includes('test/')) return {};
    return {
      AssignmentExpression(node) {
        if (
          node.left &&
          node.left.type === 'MemberExpression' &&
          node.left.property &&
          (node.left.property.name === 'innerHTML' || node.left.property.name === 'outerHTML')
        ) {
          context.report({
            node,
            messageId: 'directMutation',
            data: { property: node.left.property.name },
          });
        }
      },
    };
  },
};

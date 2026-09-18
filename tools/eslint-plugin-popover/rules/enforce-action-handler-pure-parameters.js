/**
 * @fileoverview Disallow mutating input parameters inside action handlers.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow reassigning or mutating function parameter objects inside store actions.',
      category: 'Store Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      noParamMutation:
        'Do not mutate parameter object {{ param }} inside action handler; clone first.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      AssignmentExpression(node) {
        if (
          node.left?.type === 'MemberExpression' &&
          node.left?.object?.name === 'payload'
        ) {
          context.report({
            node,
            messageId: 'noParamMutation',
            data: { param: 'payload' },
          });
        }
      },
    };
  },
};

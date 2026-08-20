/**
 * @fileoverview Recommend checking isSuccess or ok before accessing Result data.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage checking result.ok or result.isSuccess before accessing result.data.',
      category: 'Type Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestResultGuard:
        'Accessing property {{ prop }} directly without checking ok/isSuccess guard.',
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
      MemberExpression(node) {
        if (
          node.object &&
          node.object.name === 'rawResult' &&
          node.property &&
          node.property.name === 'data'
        ) {
          context.report({
            node,
            messageId: 'suggestResultGuard',
            data: { prop: 'data' },
          });
        }
      },
    };
  },
};

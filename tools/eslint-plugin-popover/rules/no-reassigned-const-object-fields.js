/**
 * @fileoverview Disallow property assignment to objects typed as const.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow assigning properties to objects marked as const / readonly.',
      category: 'Type Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      noAssignToConstObject:
        'Cannot reassign property {{ prop }} on constant config object {{ obj }}.',
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
      AssignmentExpression(node) {
        if (
          node.left &&
          node.left.type === 'MemberExpression' &&
          node.left.object &&
          node.left.object.name &&
          /^[A-Z_]+_CONFIG$/.test(node.left.object.name)
        ) {
          context.report({
            node,
            messageId: 'noAssignToConstObject',
            data: {
              prop: node.left.property?.name || 'unknown',
              obj: node.left.object.name,
            },
          });
        }
      },
    };
  },
};

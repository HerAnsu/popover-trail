/**
 * @fileoverview Disallow property assignment to state objects wrapped with Object.freeze.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow mutating properties on frozen state objects.',
      category: 'Store Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      noMutationOfFrozenState: 'Do not assign property {{ prop }} directly to frozen state; return a new state object.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      AssignmentExpression(node) {
        if (
          node.left &&
          node.left.type === 'MemberExpression' &&
          node.left.object &&
          node.left.object.name === 'frozenState'
        ) {
          context.report({
            node,
            messageId: 'noMutationOfFrozenState',
            data: { prop: node.left.property?.name || 'unknown' },
          });
        }
      },
    };
  },
};

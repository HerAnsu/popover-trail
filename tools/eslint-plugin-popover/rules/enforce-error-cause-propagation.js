export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce { cause: err } options pattern when wrapping and re-throwing errors.',
      category: 'Resilience',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestErrorCause: 'Pass original caught error in { cause: err } when throwing PopoverError.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};
    if (!filename.includes('errors') && !filename.includes('Errors')) return {};

    return {
      ThrowStatement(node) {
        if (
          node.argument?.type === 'NewExpression' &&
          node.argument?.callee?.name?.includes?.('Error') &&
          node.argument?.arguments?.length === 1
        ) {
          context.report({
            node,
            messageId: 'suggestErrorCause',
          });
        }
      },
    };
  },
};

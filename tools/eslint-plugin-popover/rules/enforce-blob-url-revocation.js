export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce URL.revokeObjectURL() cleanup to release memory after creating blob URLs.',
      category: 'Memory',
      recommended: true,
    },
    schema: [],
    messages: {
      requireRevokeObjectURL: 'Ensure URL.revokeObjectURL(url) is called to release blob URL memory.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee?.type === 'MemberExpression' &&
          node.callee?.object?.name === 'URL' &&
          node.callee?.property?.name === 'createObjectURL'
        ) {
          const scope = context.getSourceCode?.()?.getText?.() ?? '';
          if (scope && !scope.includes('revokeObjectURL')) {
            context.report({
              node,
              messageId: 'requireRevokeObjectURL',
            });
          }
        }
      },
    };
  },
};

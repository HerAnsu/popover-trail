export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce standard camelCase naming for store action methods',
      category: 'Store Purity',
      recommended: true,
    },
    schema: [],
    messages: {
      invalidActionName: 'Store action `{{name}}` should follow camelCase naming convention.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      Property(node) {
        if (node.key?.name?.includes('-')) {
          context.report({ node, messageId: 'invalidActionName', data: { name: node.key?.name } });
        }
      },
    };
  },
};

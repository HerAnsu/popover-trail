export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage setting maxListeners limit on custom event emitters.',
      category: 'Memory',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestMaxListeners:
        'EventBus class {{ name }} should define a maxListeners limit to detect listener leaks.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      ClassDeclaration(node) {
        if (node.id?.name?.includes('EventBus') || node.id?.name?.includes('Emitter')) {
          const body = context.getSourceCode?.()?.getText?.(node) ?? '';
          if (
            !body.includes('maxListeners') &&
            !body.includes('MAX_LISTENERS') &&
            !body.includes('limit')
          ) {
            context.report({
              node,
              messageId: 'suggestMaxListeners',
              data: { name: node.id?.name },
            });
          }
        }
      },
    };
  },
};

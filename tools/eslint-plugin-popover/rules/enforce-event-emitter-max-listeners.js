/**
 * @fileoverview Recommend setting maxListeners threshold on custom EventEmitters to catch leaks early.
 */

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
    if (
      filename.includes('eslint-plugin') ||
      filename.includes('rules/') ||
      filename.includes('.test.') ||
      filename.includes('tests/')
    )
      return {};

    return {
      ClassDeclaration(node) {
        if (node.id && (node.id.name.includes('EventBus') || node.id.name.includes('Emitter'))) {
          const body = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (
            !body.includes('maxListeners') &&
            !body.includes('MAX_LISTENERS') &&
            !body.includes('limit')
          ) {
            context.report({
              node,
              messageId: 'suggestMaxListeners',
              data: { name: node.id.name },
            });
          }
        }
      },
    };
  },
};

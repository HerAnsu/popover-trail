/**
 * @fileoverview Recommend unregistering tokens from FinalizationRegistry upon manual resource dispose.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Recommend calling registry.unregister(token) when a tracked resource is manually disposed.',
      category: 'Memory',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestUnregisterToken:
        'FinalizationRegistry instance in class {{ name }} should have a corresponding unregister call on dispose.',
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
        const body = context.getSourceCode ? context.getSourceCode().getText(node) : '';
        if (body.includes('new FinalizationRegistry') && !body.includes('.unregister(')) {
          context.report({
            node,
            messageId: 'suggestUnregisterToken',
            data: { name: node.id?.name || 'anonymous' },
          });
        }
      },
    };
  },
};

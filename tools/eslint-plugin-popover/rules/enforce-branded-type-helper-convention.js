/**
 * @fileoverview Recommend create* or to* naming convention for branded type constructor helpers.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce create* or to* prefix on branded type constructor helper functions.',
      category: 'Type Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestBrandedPrefix: 'Branded key factory function {{ name }} should start with "create" or "to" prefix.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      FunctionDeclaration(node) {
        if (
          node.id &&
          node.id.name &&
          node.id.name.endsWith('Key') &&
          !node.id.name.startsWith('create') &&
          !node.id.name.startsWith('to') &&
          !node.id.name.startsWith('as') &&
          !node.id.name.startsWith('is') &&
          !node.id.name.startsWith('use') &&
          !node.id.name.startsWith('get') &&
          !node.id.name.startsWith('select') &&
          !node.id.name.startsWith('validate') &&
          !node.id.name.startsWith('find') &&
          !node.id.name.startsWith('has') &&
          !node.id.name.startsWith('hash')
        ) {
          context.report({
            node,
            messageId: 'suggestBrandedPrefix',
            data: { name: node.id.name },
          });
        }
      },
    };
  },
};

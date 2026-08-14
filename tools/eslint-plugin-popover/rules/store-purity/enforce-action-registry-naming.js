'use strict';
module.exports = {
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
    const filename = context.filename || context.getFilename();
    if (!filename.includes('storeActionRegistry.ts')) return {};
    return {
      Property(node) {
        if (node.key && node.key.name && node.key.name.includes('-')) {
          context.report({ node, messageId: 'invalidActionName', data: { name: node.key.name } });
        }
      },
    };
  },
};

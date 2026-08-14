/**
 * @fileoverview Enforce readonly modifier on public state slice properties.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce readonly modifiers on public state interfaces to preserve immutability.',
      category: 'Type Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      requireReadonlyState: 'State interface property {{ prop }} should be marked as readonly.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('storeTypes') && !filename.includes('State')) return {};

    return {
      TSPropertySignature(node) {
        if (
          node.key &&
          node.key.name &&
          (node.key.name === 'trail' || node.key.name === 'floating') &&
          !node.readonly
        ) {
          context.report({
            node,
            messageId: 'requireReadonlyState',
            data: { prop: node.key.name },
          });
        }
      },
    };
  },
};

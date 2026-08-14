/**
 * @fileoverview Disallow local variables shadowing store instance identifier state or actions.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow inner parameter names shadowing outer store identifiers.',
      category: 'Clean Code',
      recommended: true,
    },
    schema: [],
    messages: {
      noShadowedStoreId: 'Inner identifier "{{ name }}" shadows store instance in scope.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || !filename.includes('store')) return {};

    return {
      FunctionDeclaration(node) {
        if (node.params) {
          for (const param of node.params) {
            if (param.name === 'storeApi' || param.name === 'popoverStore') {
              context.report({
                node: param,
                messageId: 'noShadowedStoreId',
                data: { name: param.name },
              });
            }
          }
        }
      },
    };
  },
};

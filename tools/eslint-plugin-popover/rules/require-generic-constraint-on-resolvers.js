/**
 * @fileoverview Recommend generic default TData = unknown on custom popover resolver interfaces.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce default generic parameter <TData = unknown> on popover resolver interfaces.',
      category: 'Type Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      requireDefaultGeneric: 'Resolver interface {{ name }} should provide default generic parameter <TData = unknown>.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      TSInterfaceDeclaration(node) {
        if (
          node.id &&
          node.id.name &&
          node.id.name.includes('Resolver') &&
          node.typeParameters &&
          node.typeParameters.params.length === 1 &&
          !node.typeParameters.params[0].default
        ) {
          context.report({
            node,
            messageId: 'requireDefaultGeneric',
            data: { name: node.id.name },
          });
        }
      },
    };
  },
};

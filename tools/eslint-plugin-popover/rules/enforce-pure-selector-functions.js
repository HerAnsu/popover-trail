/**
 * @fileoverview Enforce that store selector functions are pure and contain no side-effects or mutations.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce that store selector functions are pure read-only transformations.',
      category: 'Store Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      noSideEffectsInSelector:
        'Selector function {{ name }} must not invoke state mutating methods.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (
      filename.includes('eslint-plugin') ||
      filename.includes('rules/') ||
      !filename.includes('Selectors')
    )
      return {};

    return {
      FunctionDeclaration(node) {
        if (node.id && node.id.name.startsWith('select')) {
          const body = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (body.includes('.push(') || body.includes('.splice(') || body.includes('setState(')) {
            context.report({
              node,
              messageId: 'noSideEffectsInSelector',
              data: { name: node.id.name },
            });
          }
        }
      },
    };
  },
};

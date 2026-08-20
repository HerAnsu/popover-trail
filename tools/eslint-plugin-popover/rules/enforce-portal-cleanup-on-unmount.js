/**
 * @fileoverview Enforce removing dynamically created portal root DOM containers when host unmounts.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce cleanup of custom portal root DOM nodes when PopoverProvider unmounts.',
      category: 'Memory',
      recommended: true,
    },
    schema: [],
    messages: {
      requirePortalCleanup:
        'Dynamically created portal container should be removed from DOM in useEffect return cleanup.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('Portal') && !filename.includes('portal')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.property &&
          node.callee.property.name === 'appendChild' &&
          node.callee.object &&
          node.callee.object.name === 'document'
        ) {
          const scope = context.getSourceCode ? context.getSourceCode().getText() : '';
          if (scope && !scope.includes('removeChild') && !scope.includes('.remove()')) {
            context.report({
              node,
              messageId: 'requirePortalCleanup',
            });
          }
        }
      },
    };
  },
};

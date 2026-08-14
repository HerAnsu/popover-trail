'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure portal container target existence is validated before mounting',
      category: 'Portal & Stacking',
      recommended: true,
    },
    schema: [],
    messages: {
      unvalidatedPortal: 'Validate portal target DOM container existence before creating React portal.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.name === 'createPortal' &&
          node.arguments.length >= 2 &&
          node.arguments[1].type === 'Identifier' &&
          node.arguments[1].name === 'target'
        ) {
          const src = context.getSourceCode ? context.getSourceCode().getText() : '';
          if (!src.includes('if (!target)') && !src.includes('target ?')) {
            context.report({ node, messageId: 'unvalidatedPortal' });
          }
        }
      },
    };
  },
};

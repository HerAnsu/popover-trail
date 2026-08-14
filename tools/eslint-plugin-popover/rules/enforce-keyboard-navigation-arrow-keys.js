/**
 * @fileoverview Require both ArrowUp and ArrowDown key branches in vertical menu navigation controllers.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require bidirectional ArrowUp and ArrowDown handling in menu keyboard navigators.',
      category: 'Accessibility',
      recommended: true,
    },
    schema: [],
    messages: {
      requireBidirectionalArrows: 'Vertical arrow navigation should handle both ArrowUp and ArrowDown keys.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('KeyboardNav')) return {};

    return {
      FunctionDeclaration(node) {
        if (node.id && node.id.name === 'handleVerticalArrowNavigation') {
          const body = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (body && (!body.includes('ArrowDown') || !body.includes('ArrowUp'))) {
            context.report({
              node,
              messageId: 'requireBidirectionalArrows',
            });
          }
        }
      },
    };
  },
};

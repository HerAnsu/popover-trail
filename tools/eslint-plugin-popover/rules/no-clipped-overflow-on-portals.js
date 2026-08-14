'use strict';
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow overflow hidden on root portal container to avoid clipping nested popovers',
      category: 'Visual & Tokens',
      recommended: true,
    },
    schema: [],
    messages: {
      portalOverflowClipped: 'Root portal container should not have `overflow: hidden`, which clips floating card trails.',
    },
  },
  create(context) {
    return {
      JSXElement(node) {
        if (node.openingElement && node.openingElement.name && node.openingElement.name.name === 'PopoverPortal') {
          const hasHidden = node.openingElement.attributes.some(
            (a) => a.name && a.name.name === 'style' && context.getSourceCode().getText(a.value).includes('overflow: "hidden"')
          );
          if (hasHidden) {
            context.report({ node, messageId: 'portalOverflowClipped' });
          }
        }
      },
    };
  },
};

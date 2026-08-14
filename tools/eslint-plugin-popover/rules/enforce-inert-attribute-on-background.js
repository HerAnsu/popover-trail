'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage inert attribute on background elements when modal popovers are active',
      category: 'Focus Trap & A11y',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestInert: 'Consider applying inert to background root elements during modal popover presentation.',
    },
  },
  create(context) {
    return {
      JSXElement(node) {
        if (node.openingElement && node.openingElement.name && node.openingElement.name.name === 'PopoverModal') {
          const hasInert = node.openingElement.attributes.some((attr) => attr.name && attr.name.name === 'inert');
          if (!hasInert && node.openingElement.attributes.length > 5) {
            context.report({ node, messageId: 'suggestInert' });
          }
        }
      },
    };
  },
};

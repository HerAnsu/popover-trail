'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Warn against nested unkeyed PopoverProviders that may shadow parent trail states',
      category: 'Context & Store Scoping',
      recommended: true,
    },
    schema: [],
    messages: {
      nestedProvider: 'Avoid nesting <PopoverProvider> without an explicit isolated store configuration.',
    },
  },
  create(context) {
    let providerDepth = 0;
    return {
      JSXElement(node) {
        if (node.openingElement && node.openingElement.name && node.openingElement.name.name === 'PopoverProvider') {
          providerDepth++;
          if (providerDepth > 1) {
            context.report({ node, messageId: 'nestedProvider' });
          }
        }
      },
      'JSXElement:exit'(node) {
        if (node.openingElement && node.openingElement.name && node.openingElement.name.name === 'PopoverProvider') {
          providerDepth--;
        }
      },
    };
  },
};

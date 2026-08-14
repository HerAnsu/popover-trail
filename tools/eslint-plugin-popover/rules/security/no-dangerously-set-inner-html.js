'use strict';

/**
 * Rule: popover/no-dangerously-set-inner-html
 * Description: Prohibits dangerouslySetInnerHTML in popover library components to prevent XSS.
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow dangerouslySetInnerHTML in popover components',
      category: 'Security',
      recommended: true,
    },
    schema: [],
    messages: {
      noDangerouslySetInnerHTML: '`dangerouslySetInnerHTML` is prohibited in popover components to eliminate XSS risks.',
    },
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name && node.name.name === 'dangerouslySetInnerHTML') {
          context.report({
            node,
            messageId: 'noDangerouslySetInnerHTML',
          });
        }
      },
    };
  },
};

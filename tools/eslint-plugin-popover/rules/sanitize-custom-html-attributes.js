'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure dynamic user attributes passed to wrapper elements are sanitized',
      category: 'Security',
      recommended: true,
    },
    schema: [],
    messages: {
      unfilteredSpread:
        'Spreading unsanitized user props directly on DOM root can lead to invalid DOM properties.',
    },
  },
  create(context) {
    return {
      JSXSpreadAttribute(node) {
        if (node.argument && node.argument.name === 'rawHtmlProps') {
          context.report({ node, messageId: 'unfilteredSpread' });
        }
      },
    };
  },
};

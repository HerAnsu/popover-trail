/**
 * @fileoverview Disallow javascript: pseudo-protocol in href attributes.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow javascript: URLs in anchor href attributes to prevent XSS execution.',
      category: 'Security',
      recommended: true,
    },
    schema: [],
    messages: {
      noJavascriptUrl:
        'Do not use "javascript:" URLs in href attributes; use onClick handler instead.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      JSXAttribute(node) {
        if (
          node.name &&
          node.name.name === 'href' &&
          node.value &&
          node.value.type === 'Literal' &&
          typeof node.value.value === 'string' &&
          node.value.value.trim().toLowerCase().startsWith('javascript:')
        ) {
          context.report({
            node,
            messageId: 'noJavascriptUrl',
          });
        }
      },
    };
  },
};

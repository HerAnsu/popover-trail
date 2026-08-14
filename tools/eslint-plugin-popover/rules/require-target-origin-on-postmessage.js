/**
 * @fileoverview Require explicit target origin instead of wildcard '*' in window.postMessage.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce specific targetOrigin on window.postMessage to prevent data leakage across origins.',
      category: 'Security',
      recommended: true,
    },
    schema: [],
    messages: {
      noWildcardOrigin: 'Do not use wildcard "*" as targetOrigin in window.postMessage; specify a trusted origin or window.location.origin.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.property &&
          node.callee.property.name === 'postMessage' &&
          node.arguments &&
          node.arguments[1] &&
          node.arguments[1].type === 'Literal' &&
          node.arguments[1].value === '*'
        ) {
          context.report({
            node: node.arguments[1],
            messageId: 'noWildcardOrigin',
          });
        }
      },
    };
  },
};

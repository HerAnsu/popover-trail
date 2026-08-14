/**
 * @fileoverview Recommend standard algorithm identifier objects in Web Crypto API calls.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce standard algorithm names in crypto.subtle.digest calls.',
      category: 'Security',
      recommended: true,
    },
    schema: [],
    messages: {
      useStandardAlgorithm: 'Algorithm name "{{ alg }}" in crypto.subtle.digest should be "SHA-256" or "SHA-512".',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.property &&
          node.callee.property.name === 'digest' &&
          node.callee.object &&
          node.callee.object.property &&
          node.callee.object.property.name === 'subtle' &&
          node.arguments[0] &&
          node.arguments[0].type === 'Literal' &&
          typeof node.arguments[0].value === 'string' &&
          node.arguments[0].value !== 'SHA-256' &&
          node.arguments[0].value !== 'SHA-384' &&
          node.arguments[0].value !== 'SHA-512'
        ) {
          context.report({
            node: node.arguments[0],
            messageId: 'useStandardAlgorithm',
            data: { alg: node.arguments[0].value },
          });
        }
      },
    };
  },
};

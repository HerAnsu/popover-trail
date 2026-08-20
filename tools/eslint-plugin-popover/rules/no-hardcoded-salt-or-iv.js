/**
 * @fileoverview Disallow hardcoded constant string literals for crypto salt or initialization vectors.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded strings for cryptographic salt or IV.',
      category: 'Security',
      recommended: true,
    },
    schema: [],
    messages: {
      noHardcodedSalt:
        'Do not use constant literal for {{ name }}; generate random bytes using crypto.getRandomValues().',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (
      filename.includes('eslint-plugin') ||
      filename.includes('rules/') ||
      filename.includes('.test.') ||
      filename.includes('tests/')
    )
      return {};

    return {
      VariableDeclarator(node) {
        if (
          node.id &&
          (node.id.name === 'CRYPTO_SALT' ||
            node.id.name === 'STATIC_IV' ||
            node.id.name === 'DEFAULT_SALT') &&
          node.init &&
          node.init.type === 'Literal' &&
          typeof node.init.value === 'string'
        ) {
          context.report({
            node,
            messageId: 'noHardcodedSalt',
            data: { name: node.id.name },
          });
        }
      },
    };
  },
};

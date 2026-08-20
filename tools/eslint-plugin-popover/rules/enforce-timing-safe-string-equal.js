/**
 * @fileoverview Recommend constant-time string comparison for secret hashes and signatures.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Encourage constant-time string comparison for cryptographic token verification to prevent timing attacks.',
      category: 'Security',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestTimingSafeEqual:
        'Function {{ name }} performs standard === equality check on hash tokens; consider timingSafeEqual.',
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
      FunctionDeclaration(node) {
        if (
          node.id &&
          (node.id.name.toLowerCase().includes('verifysignature') ||
            node.id.name.toLowerCase().includes('verifytoken'))
        ) {
          const body = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (
            body.includes('===') &&
            !body.includes('timingSafeEqual') &&
            !body.includes('timingSafe')
          ) {
            context.report({
              node,
              messageId: 'suggestTimingSafeEqual',
              data: { name: node.id.name },
            });
          }
        }
      },
    };
  },
};

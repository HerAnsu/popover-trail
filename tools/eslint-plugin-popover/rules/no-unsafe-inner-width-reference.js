/**
 * @fileoverview Disallow direct window.innerWidth access without SSR guard check.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct window.innerWidth/innerHeight access at module root without typeof window check.',
      category: 'SSR',
      recommended: true,
    },
    schema: [],
    messages: {
      unsafeWindowAccess: 'Accessing window.{{ prop }} at module scope causes SSR hydration failures. Wrap in typeof window check.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      MemberExpression(node) {
        if (
          node.object &&
          node.object.name === 'window' &&
          (node.property.name === 'innerWidth' || node.property.name === 'innerHeight') &&
          node.parent &&
          node.parent.parent &&
          node.parent.parent.type === 'Program'
        ) {
          context.report({
            node,
            messageId: 'unsafeWindowAccess',
            data: { prop: node.property.name },
          });
        }
      },
    };
  },
};

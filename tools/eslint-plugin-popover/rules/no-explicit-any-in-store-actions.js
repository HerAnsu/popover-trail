/**
 * @fileoverview Disallow explicit any in store action payload declarations.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow explicit any in store action payloads; use unknown or generic type variables.',
      category: 'Type Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      noAnyInAction: 'Do not use explicit "any" in action payload; use generic <TData = unknown> or unknown.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      TSAnyKeyword(node) {
        if (
          node.parent &&
          node.parent.type === 'TSTypeAnnotation' &&
          node.parent.parent &&
          node.parent.parent.type === 'Identifier' &&
          (node.parent.parent.name === 'payload' || node.parent.parent.name === 'data')
        ) {
          context.report({
            node,
            messageId: 'noAnyInAction',
          });
        }
      },
    };
  },
};

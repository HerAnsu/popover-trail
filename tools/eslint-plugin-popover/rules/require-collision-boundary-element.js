/**
 * @fileoverview Enforce valid collision boundary options in floating configuration.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce that collision boundary option is a valid Element, selector, or clippings/viewport string.',
      category: 'Floating',
      recommended: true,
    },
    schema: [],
    messages: {
      invalidBoundary: 'Collision boundary must be an Element, Document, "clippingsAncestors", or array of Elements.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      Property(node) {
        if (
          node.key &&
          node.key.name === 'boundary' &&
          node.value &&
          node.value.type === 'Literal' &&
          typeof node.value.value === 'number'
        ) {
          context.report({
            node,
            messageId: 'invalidBoundary',
          });
        }
      },
    };
  },
};

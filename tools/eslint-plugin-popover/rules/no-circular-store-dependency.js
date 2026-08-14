/**
 * @fileoverview Disallow store slice files from importing concrete store instances.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow store slices from importing concrete store factories to prevent circular module dependencies.',
      category: 'Architecture',
      recommended: true,
    },
    schema: [],
    messages: {
      noCircularStoreImport: 'Store slice files should not import createPopoverStore directly; receive deps via slice builder.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('slices/')) return {};

    return {
      ImportDeclaration(node) {
        if (
          node.source &&
          typeof node.source.value === 'string' &&
          (node.source.value.endsWith('/store') || node.source.value.endsWith('popoverStore'))
        ) {
          context.report({
            node,
            messageId: 'noCircularStoreImport',
          });
        }
      },
    };
  },
};

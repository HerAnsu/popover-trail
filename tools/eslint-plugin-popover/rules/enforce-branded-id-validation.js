/**
 * @fileoverview Enforce non-empty string check before constructing or casting branded popover keys.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce non-empty string validation when creating branded PopoverKey identifiers.',
      category: 'Type Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      validateBrandedKey:
        'Validate that popover key is non-empty before creating branded identifier.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('valueObjects') && !filename.includes('assertions')) return {};

    return {
      FunctionDeclaration(node) {
        if (node.id && node.id.name === 'createPopoverKey') {
          const body = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (body && !body.includes('trim') && !body.includes('length === 0')) {
            context.report({
              node,
              messageId: 'validateBrandedKey',
            });
          }
        }
      },
    };
  },
};

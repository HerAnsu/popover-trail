/**
 * @fileoverview Recommend subpixel antialiasing and text rendering options on popover typography tokens.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend font-smoothing options on card typography tokens.',
      category: 'Design Tokens',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestFontSmoothing:
        'Typography token style {{ prop }} should specify WebkitFontSmoothing: "antialiased".',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (
      filename.includes('eslint-plugin') ||
      filename.includes('rules/') ||
      !filename.includes('themeTokens')
    )
      return {};

    return {
      Property(node) {
        if (
          node.key &&
          node.key.name === 'typography' &&
          node.value &&
          node.value.type === 'ObjectExpression'
        ) {
          const hasSmoothing = node.value.properties.some(
            (p) =>
              p.key && (p.key.name === 'WebkitFontSmoothing' || p.key.name === 'fontSmoothing'),
          );
          if (!hasSmoothing) {
            context.report({
              node,
              messageId: 'suggestFontSmoothing',
              data: { prop: 'typography' },
            });
          }
        }
      },
    };
  },
};

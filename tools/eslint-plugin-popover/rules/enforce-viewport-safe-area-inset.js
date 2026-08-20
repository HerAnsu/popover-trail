/**
 * @fileoverview Recommend env(safe-area-inset-*) in viewport boundary calculations.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend safe-area-inset consideration in viewport edge positioning.',
      category: 'Layout',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestSafeArea:
        'Viewport boundary calculation in {{ name }} should account for safe-area-inset.',
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
          (node.id.name.includes('EdgeInsets') || node.id.name.includes('FloatingBoundary'))
        ) {
          const body = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (
            !body.includes('safeArea') &&
            !body.includes('safe-area') &&
            !body.includes('padding')
          ) {
            context.report({
              node,
              messageId: 'suggestSafeArea',
              data: { name: node.id.name },
            });
          }
        }
      },
    };
  },
};

'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure popover card text containers apply font smoothing for optimal legibility',
      category: 'Visual & Tokens',
      recommended: true,
    },
    schema: [],
    messages: {
      fontSmoothing: 'Card text containers benefit from `-webkit-font-smoothing: antialiased` for crisp rendering.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (!filename.includes('themeTokens.ts')) return {};
    return {
      VariableDeclaration(node) {
        if (node.declarations.some((d) => d.id && d.id.name === 'themeTokens')) {
          const src = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (!src.includes('antialiased')) {
            context.report({ node, messageId: 'fontSmoothing' });
          }
        }
      },
    };
  },
};

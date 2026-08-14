'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure floating card positions are clamped within visible screen boundaries',
      category: 'Viewport & Geometry',
      recommended: true,
    },
    schema: [],
    messages: {
      clampViewport: 'Ensure coordinates are clamped to visible viewport boundaries.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (!filename.includes('geometry') || filename.includes('.test.')) return {};
    return {
      FunctionDeclaration(node) {
        if (node.id && node.id.name.includes('clampPoint')) {
          const src = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (!src.includes('Math.min') && !src.includes('Math.max')) {
            context.report({ node, messageId: 'clampViewport' });
          }
        }
      },
    };
  },
};

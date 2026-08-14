'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Use event.composedPath() in outside click handlers to support Shadow DOM and Web Components',
      category: 'Shadow DOM & Portals',
      recommended: true,
    },
    schema: [],
    messages: {
      useComposedPath: 'Use `e.composedPath ? e.composedPath() : ...` to ensure outside click logic traverses Shadow DOM boundaries.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (filename.includes('.test.')) return {};
    return {
      FunctionDeclaration(node) {
        if (node.id && node.id.name.includes('handleOutsideClick')) {
          const src = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (!src.includes('composedPath')) {
            context.report({ node, messageId: 'useComposedPath' });
          }
        }
      },
    };
  },
};

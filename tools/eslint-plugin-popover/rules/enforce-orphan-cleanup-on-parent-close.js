'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure closing parent popovers cascades to child cards in the DAG lineage',
      category: 'DAG & Lineage',
      recommended: true,
    },
    schema: [],
    messages: {
      orphanCards: 'Closing parent popover should cascade dismiss all downstream child cards.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (!filename.includes('closeReducers.ts')) return {};
    return {
      FunctionDeclaration(node) {
        if (node.id && node.id.name === 'closePopoverReducer') {
          const src = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (!src.includes('getChildren') && !src.includes('dag') && !src.includes('descendants')) {
            context.report({ node, messageId: 'orphanCards' });
          }
        }
      },
    };
  },
};

/**
 * @fileoverview Recommend snapshot pruning when history manager exceeds capacity.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend pruning snapshot buffers to keep memory footprint bounded.',
      category: 'Store Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestPruning: 'Snapshot history manager in class {{ name }} should enforce a maximum size limit.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || !filename.includes('history') && !filename.includes('snapshot')) return {};

    return {
      ClassDeclaration(node) {
        if (node.id && node.id.name.includes('History')) {
          const body = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (!body.includes('maxHistory') && !body.includes('capacity') && !body.includes('MAX_')) {
            context.report({
              node,
              messageId: 'suggestPruning',
              data: { name: node.id.name },
            });
          }
        }
      },
    };
  },
};

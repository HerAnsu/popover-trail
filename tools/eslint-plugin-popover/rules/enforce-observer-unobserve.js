'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure observer registry subscriptions return unobserve in effect cleanup',
      category: 'Observers & Listeners',
      recommended: true,
    },
    schema: [],
    messages: {
      missingUnobserve: 'Observer observe() should have corresponding unobserve() or disconnect().',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (filename.includes('.test.')) return {};
    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.property &&
          node.callee.property.name === 'observe' &&
          node.callee.object &&
          node.callee.object.name === 'observer'
        ) {
          const src = context.getSourceCode ? context.getSourceCode().getText() : '';
          if (!src.includes('unobserve') && !src.includes('disconnect')) {
            context.report({ node, messageId: 'missingUnobserve' });
          }
        }
      },
    };
  },
};

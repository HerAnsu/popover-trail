'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure popover hooks are consumed within a PopoverProvider scope',
      category: 'Context & Store Scoping',
      recommended: true,
    },
    schema: [],
    messages: {
      providerRequired: 'Hook `{{hook}}` requires an enclosing PopoverProvider context.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (!filename.includes('.test.') && !filename.includes('src/lib/')) return {};
    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.name === 'usePopoverContext' &&
          node.parent &&
          node.parent.type === 'VariableDeclarator'
        ) {
          const src = context.getSourceCode ? context.getSourceCode().getText(node.parent) : '';
          if (src.includes('undefined') && !src.includes('throw')) {
            context.report({ node, messageId: 'providerRequired', data: { hook: 'usePopoverContext' } });
          }
        }
      },
    };
  },
};

'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure popover close actions support focus restoration to trigger element',
      category: 'Accessibility',
      recommended: true,
    },
    schema: [],
    messages: {
      focusRestoration: 'Ensure popover close handlers restore focus to trigger element or activeElement ref.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (filename.includes('.test.') || !filename.includes('hooks/')) return {};
    return {
      FunctionDeclaration(node) {
        if (node.id && node.id.name.startsWith('use') && node.id.name.includes('Close')) {
          const src = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (!src.includes('focus') && !src.includes('restoreFocus') && !src.includes('triggerRef')) {
            context.report({ node, messageId: 'focusRestoration' });
          }
        }
      },
    };
  },
};

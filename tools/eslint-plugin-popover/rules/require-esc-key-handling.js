/**
 * @fileoverview Enforce Escape key dismissal handling in popover keyboard navigation.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce that popover keyboard controllers support Escape key closing behavior.',
      category: 'Accessibility',
      recommended: true,
    },
    schema: [],
    messages: {
      requireEscHandling:
        'Keyboard navigation handler should handle "Escape" key to dismiss open popovers.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('KeyboardNav') && !filename.includes('keyboard')) return {};

    return {
      FunctionDeclaration(node) {
        if (node.id && node.id.name && node.id.name.includes('handleCardKeyboard')) {
          const bodyText = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (
            bodyText &&
            !bodyText.includes('Escape') &&
            !bodyText.includes('handleCustomShortcuts') &&
            !bodyText.includes('shortcuts')
          ) {
            context.report({
              node,
              messageId: 'requireEscHandling',
            });
          }
        }
      },
    };
  },
};

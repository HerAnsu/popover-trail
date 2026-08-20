/**
 * @fileoverview Require clearTimeout cancellation before scheduling next debounced call.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce clearTimeout check before scheduling a new debounced timer.',
      category: 'Concurrency',
      recommended: true,
    },
    schema: [],
    messages: {
      requireClearTimeoutBeforeDebounce:
        'Clear previous timeout before scheduling next debounce to prevent race conditions.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('debounce') && !filename.includes('throttle')) return {};

    return {
      FunctionDeclaration(node) {
        if (node.id && node.id.name.includes('debounce')) {
          const body = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (body && !body.includes('clearTimeout')) {
            context.report({
              node,
              messageId: 'requireClearTimeoutBeforeDebounce',
            });
          }
        }
      },
    };
  },
};

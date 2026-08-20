/**
 * @fileoverview Require catch or void on async promises created in store controllers.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unhandled floating promises in async store controllers.',
      category: 'Type Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      noUnhandledPromise:
        'Promise must be awaited, caught, or explicitly voided with "void promise.catch(...)".',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('Controllers') && !filename.includes('controllers')) return {};

    return {
      ExpressionStatement(node) {
        if (
          node.expression &&
          node.expression.type === 'CallExpression' &&
          node.expression.callee &&
          node.expression.callee.name &&
          node.expression.callee.name.startsWith('async')
        ) {
          context.report({
            node,
            messageId: 'noUnhandledPromise',
          });
        }
      },
    };
  },
};

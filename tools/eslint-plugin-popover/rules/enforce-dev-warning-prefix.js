'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce standard [popover-trail] prefix on library warning logs',
      category: 'Diagnostics & Warnings',
      recommended: true,
    },
    schema: [],
    messages: {
      missingWarningPrefix: 'Warning message in devWarnings should start with `[popover-trail]`.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.name === 'devWarning' &&
          node.arguments.length >= 2 &&
          node.arguments[1].type === 'Literal' &&
          typeof node.arguments[1].value === 'string' &&
          !node.arguments[1].value.startsWith('[popover-trail]')
        ) {
          context.report({ node: node.arguments[1], messageId: 'missingWarningPrefix' });
        }
      },
    };
  },
};

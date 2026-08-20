'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer structured PopoverError or devWarning utility over raw console.error',
      category: 'Diagnostics & Warnings',
      recommended: true,
    },
    schema: [],
    messages: {
      rawConsoleError:
        'Use `devWarning` or `Result.err()` instead of direct `console.error` in library core.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (!filename.includes('src/lib/') || filename.includes('.test.')) return {};
    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.type === 'MemberExpression' &&
          node.callee.object &&
          node.callee.object.name === 'console' &&
          node.callee.property &&
          node.callee.property.name === 'error'
        ) {
          context.report({ node, messageId: 'rawConsoleError' });
        }
      },
    };
  },
};

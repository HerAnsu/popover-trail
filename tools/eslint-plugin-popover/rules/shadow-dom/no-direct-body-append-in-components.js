'use strict';
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct document.body.appendChild in React components; use PopoverPortal',
      category: 'Shadow DOM & Portals',
      recommended: true,
    },
    schema: [],
    messages: {
      directBodyAppend: 'Direct `document.body.appendChild()` in components bypasses React reconciler. Use `PopoverPortal`.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (!filename.endsWith('.tsx') || filename.includes('.test.')) return {};
    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.type === 'MemberExpression' &&
          node.callee.property &&
          node.callee.property.name === 'appendChild' &&
          node.callee.object &&
          node.callee.object.property &&
          node.callee.object.property.name === 'body'
        ) {
          context.report({ node, messageId: 'directBodyAppend' });
        }
      },
    };
  },
};

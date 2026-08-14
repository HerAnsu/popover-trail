'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure element?.getBoundingClientRect() results are verified before accessing dimensions',
      category: 'Viewport & Geometry',
      recommended: true,
    },
    schema: [],
    messages: {
      safeRectAccess: 'Verify element existence before invoking getBoundingClientRect().',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.property &&
          node.callee.property.name === 'getBoundingClientRect' &&
          node.callee.object &&
          node.callee.object.name === 'el' &&
          !node.callee.optional
        ) {
          context.report({ node, messageId: 'safeRectAccess' });
        }
      },
    };
  },
};

'use strict';

/**
 * Rule: popover/no-direct-dom-mutation
 * Description: Warns when direct style property assignment (e.g. element.style.left = ...)
 * is used outside dedicated low-level animation/dnd modules.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow direct manual style mutations outside dnd/animation modules',
      category: 'SSR & Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      noDirectStyleMutation: 'Avoid direct `.style.{{prop}}` mutation on DOM elements. Prefer reactive state, classnames, or central style utilities.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (filename.includes('dnd.tsx') || filename.includes('useCardFocusManagement.ts') || filename.includes('.test.') || filename.includes('tests/')) {
      return {};
    }

    return {
      AssignmentExpression(node) {
        if (
          node.left &&
          node.left.type === 'MemberExpression' &&
          node.left.object &&
          node.left.object.type === 'MemberExpression' &&
          node.left.object.property &&
          node.left.object.property.name === 'style'
        ) {
          const propName = node.left.property ? node.left.property.name : 'property';
          context.report({
            node,
            messageId: 'noDirectStyleMutation',
            data: { prop: propName },
          });
        }
      },
    };
  },
};

/**
 * @fileoverview Enforce that useRef for popover cards is passed to ref prop or store registration.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce that useRef for popover cards is properly connected to ref or store registration.',
      category: 'Correctness',
      recommended: true,
    },
    schema: [],
    messages: {
      unconnectedRef: 'Popover card ref should be attached to a DOM node or registered with store.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.name === 'useRef' &&
          node.parent &&
          node.parent.type === 'VariableDeclarator' &&
          node.parent.id &&
          node.parent.id.name &&
          node.parent.id.name.toLowerCase().includes('popoverref') &&
          node.parent.parent &&
          node.parent.parent.parent
        ) {
          const scopeBody = context.getSourceCode ? context.getSourceCode().getText(node.parent.parent.parent) : '';
          if (scopeBody && !scopeBody.includes('.current') && !scopeBody.includes('ref=')) {
            context.report({
              node,
              messageId: 'unconnectedRef',
            });
          }
        }
      },
    };
  },
};

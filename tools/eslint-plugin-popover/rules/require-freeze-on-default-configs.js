/**
 * @fileoverview Enforce Object.freeze() on static default configuration objects.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce Object.freeze() on static default configuration constants to prevent accidental mutations.',
      category: 'Clean Code',
      recommended: true,
    },
    schema: [],
    messages: {
      requireObjectFreeze:
        'Default config object {{ name }} should be frozen with Object.freeze() or defined as const.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('Defaults') && !filename.includes('defaults')) return {};

    return {
      VariableDeclarator(node) {
        if (
          node.id &&
          node.id.name &&
          node.id.name.startsWith('DEFAULT_') &&
          node.init &&
          node.init.type === 'ObjectExpression'
        ) {
          const isFrozen =
            node.parent &&
            node.parent.parent &&
            node.parent.parent.type === 'CallExpression' &&
            node.parent.parent.callee &&
            node.parent.parent.callee.property &&
            node.parent.parent.callee.property.name === 'freeze';
          if (!isFrozen) {
            context.report({
              node,
              messageId: 'requireObjectFreeze',
              data: { name: node.id.name },
            });
          }
        }
      },
    };
  },
};

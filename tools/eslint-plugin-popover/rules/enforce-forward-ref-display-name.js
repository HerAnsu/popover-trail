/**
 * @fileoverview Enforce that forwardRef components define an explicit displayName.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce explicit displayName on forwardRef components for React DevTools inspection.',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
    messages: {
      requireDisplayName: 'React.forwardRef component must have an explicit displayName assigned.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          ((node.callee.object &&
            node.callee.object.name === 'React' &&
            node.callee.property &&
            node.callee.property.name === 'forwardRef') ||
            node.callee.name === 'forwardRef') &&
          node.parent &&
          node.parent.type === 'VariableDeclarator' &&
          node.parent.id &&
          node.parent.id.name
        ) {
          const compName = node.parent.id.name;
          const src = context.getSourceCode ? context.getSourceCode().getText() : '';
          if (src && !src.includes(`${compName}.displayName =`)) {
            context.report({
              node,
              messageId: 'requireDisplayName',
            });
          }
        }
      },
    };
  },
};

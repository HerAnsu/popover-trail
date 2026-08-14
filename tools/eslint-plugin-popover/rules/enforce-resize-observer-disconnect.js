/**
 * @fileoverview Enforce calling disconnect() on local ResizeObserver instances in cleanup logic.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce cleanup of ResizeObserver instances with disconnect() or unobserve() to prevent leaks.',
      category: 'Memory',
      recommended: true,
    },
    schema: [],
    messages: {
      requireDisconnect: 'ResizeObserver instance created in local scope should have a corresponding disconnect() cleanup.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      NewExpression(node) {
        if (node.callee && node.callee.name === 'ResizeObserver' && node.parent && node.parent.type === 'VariableDeclarator') {
          const varName = node.parent.id?.name;
          if (varName) {
            const scope = context.getSourceCode ? context.getSourceCode().getText() : '';
            if (scope && !scope.includes(`${varName}.disconnect()`) && !scope.includes(`${varName}.unobserve`)) {
              context.report({
                node,
                messageId: 'requireDisconnect',
              });
            }
          }
        }
      },
    };
  },
};

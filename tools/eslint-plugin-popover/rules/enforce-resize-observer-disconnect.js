/**
 * @fileoverview Enforce calling disconnect() on local ResizeObserver instances in cleanup logic.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce cleanup of ResizeObserver instances with disconnect() or unobserve() to prevent leaks.',
      category: 'Memory',
      recommended: true,
    },
    schema: [],
    messages: {
      requireDisconnect:
        'ResizeObserver instance created in local scope should have a corresponding disconnect() cleanup.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      NewExpression(node) {
        if (
          ((node.callee?.name || node.callee?.property?.name) || node.callee?.property?.name) === 'ResizeObserver' &&
          node.parent?.type === 'VariableDeclarator'
        ) {
          const varName = node.parent?.id?.name;
          if (varName) {
            const scope = context.getSourceCode?.()?.getText?.() ?? '';
            if (
              scope &&
              !scope.includes(`${varName}.disconnect()`) &&
              !scope.includes(`${varName}.unobserve`)
            ) {
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

/**
 * @fileoverview Enforce calling abort() on local AbortController in useEffect cleanup.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce calling controller.abort() in useEffect cleanup when creating an AbortController.',
      category: 'Concurrency',
      recommended: true,
    },
    schema: [],
    messages: {
      requireAbortCleanup:
        'AbortController created in effect should be aborted in the return cleanup function.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      NewExpression(node) {
        if (
          node.callee &&
          node.callee.name === 'AbortController' &&
          node.parent &&
          node.parent.type === 'VariableDeclarator'
        ) {
          const varName = node.parent.id?.name;
          if (varName) {
            const scope = context.getSourceCode ? context.getSourceCode().getText() : '';
            if (scope && !scope.includes(`${varName}.abort()`)) {
              context.report({
                node,
                messageId: 'requireAbortCleanup',
              });
            }
          }
        }
      },
    };
  },
};

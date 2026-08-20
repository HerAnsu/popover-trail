/**
 * @fileoverview Forbid calling setState or store dispatch inside useMemo calculation callbacks.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Forbid dispatching side-effects or state updates within useMemo computation.',
      category: 'Correctness',
      recommended: true,
    },
    schema: [],
    messages: {
      stateUpdateInMemo: 'Do not mutate state or invoke dispatch actions inside useMemo callback.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.name === 'useMemo' &&
          node.arguments &&
          node.arguments[0] &&
          (node.arguments[0].type === 'ArrowFunctionExpression' ||
            node.arguments[0].type === 'FunctionExpression')
        ) {
          const fnBody = context.getSourceCode
            ? context.getSourceCode().getText(node.arguments[0])
            : '';
          if (
            fnBody.includes('setState') ||
            fnBody.includes('.dispatch(') ||
            fnBody.includes('store.getState().open')
          ) {
            context.report({
              node,
              messageId: 'stateUpdateInMemo',
            });
          }
        }
      },
    };
  },
};

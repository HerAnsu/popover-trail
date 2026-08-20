/**
 * @fileoverview Enforce clearInterval cleanup on local interval timer handles.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce clearInterval call when creating interval timer in local component or hook.',
      category: 'Memory',
      recommended: true,
    },
    schema: [],
    messages: {
      requireClearInterval:
        'Ensure clearInterval({{ name }}) is called during cleanup to prevent memory leaks.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.name === 'setInterval' &&
          node.parent &&
          node.parent.type === 'VariableDeclarator'
        ) {
          const varName = node.parent.id?.name;
          if (varName) {
            const scope = context.getSourceCode ? context.getSourceCode().getText() : '';
            if (scope && !scope.includes(`clearInterval(${varName})`)) {
              context.report({
                node,
                messageId: 'requireClearInterval',
                data: { name: varName },
              });
            }
          }
        }
      },
    };
  },
};

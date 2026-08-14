/**
 * @fileoverview Require attaching onerror or messageerror listener when creating a Web Worker.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require worker.onerror handler to prevent uncaught worker crashes from going unnoticed.',
      category: 'Robustness',
      recommended: true,
    },
    schema: [],
    messages: {
      requireWorkerOnError: 'Web Worker instance should have an onerror event listener configured.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('worker') && !filename.includes('Worker')) return {};

    return {
      NewExpression(node) {
        if (node.callee && node.callee.name === 'Worker' && node.parent && node.parent.type === 'VariableDeclarator') {
          const varName = node.parent.id?.name;
          if (varName) {
            const scope = context.getSourceCode ? context.getSourceCode().getText() : '';
            if (scope && !scope.includes(`${varName}.onerror`) && !scope.includes(`${varName}.addEventListener('error'`)) {
              context.report({
                node,
                messageId: 'requireWorkerOnError',
              });
            }
          }
        }
      },
    };
  },
};

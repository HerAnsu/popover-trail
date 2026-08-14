/**
 * @fileoverview Absolutely disallow eval() or new Function() in data resolvers and utilities.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow eval() and new Function() calls to prevent code injection vulnerabilities.',
      category: 'Security',
      recommended: true,
    },
    schema: [],
    messages: {
      noEvalOrFunction: 'eval() and new Function() are strictly prohibited for security reasons.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      CallExpression(node) {
        if (node.callee && node.callee.name === 'eval') {
          context.report({
            node,
            messageId: 'noEvalOrFunction',
          });
        }
      },
      NewExpression(node) {
        if (node.callee && node.callee.name === 'Function') {
          context.report({
            node,
            messageId: 'noEvalOrFunction',
          });
        }
      },
    };
  },
};

/**
 * @fileoverview Disallow floating unhandled promises inside useEffect hooks without catch or void operator.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow floating unhandled promises in useEffect; handle rejection or prefix with void.',
      category: 'Correctness',
      recommended: true,
    },
    schema: [],
    messages: {
      floatingPromiseInEffect:
        'Unhandled Promise in useEffect. Use "void fn().catch(...)" or an async IIFE.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      ExpressionStatement(node) {
        if (
          node.expression &&
          node.expression.type === 'CallExpression' &&
          node.parent &&
          node.parent.type === 'BlockStatement' &&
          node.parent.parent &&
          node.parent.parent.type === 'ArrowFunctionExpression' &&
          node.parent.parent.parent &&
          node.parent.parent.parent.type === 'CallExpression' &&
          node.parent.parent.parent.callee &&
          node.parent.parent.parent.callee.name === 'useEffect'
        ) {
          const calleeName = node.expression.callee?.name || node.expression.callee?.property?.name;
          if (calleeName && calleeName.startsWith('async') && !calleeName.includes('catch')) {
            context.report({
              node,
              messageId: 'floatingPromiseInEffect',
            });
          }
        }
      },
    };
  },
};

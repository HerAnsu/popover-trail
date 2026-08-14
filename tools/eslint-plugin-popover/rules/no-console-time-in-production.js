'use strict';
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unguarded console.time / console.timeEnd in library runtime',
      category: 'Profiling & Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      noConsoleTime: 'Unguarded `console.time()` is prohibited in library builds.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (filename.includes('.test.')) return {};
    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.type === 'MemberExpression' &&
          node.callee.object &&
          node.callee.object.name === 'console' &&
          node.callee.property &&
          (node.callee.property.name === 'time' || node.callee.property.name === 'timeEnd')
        ) {
          context.report({ node, messageId: 'noConsoleTime' });
        }
      },
    };
  },
};

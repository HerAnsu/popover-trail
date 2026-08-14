/**
 * @fileoverview Disallow caching sensitive keys like token or password in persistent storage slice.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow saving auth tokens, secrets, or passwords in persistent localStorage keys.',
      category: 'Security',
      recommended: true,
    },
    schema: [],
    messages: {
      noSensitiveStorage: 'Do not store sensitive key "{{ key }}" in localStorage; use secure HTTP-only cookies or memory.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.object &&
          node.callee.object.name === 'localStorage' &&
          node.callee.property &&
          node.callee.property.name === 'setItem' &&
          node.arguments &&
          node.arguments[0] &&
          node.arguments[0].type === 'Literal'
        ) {
          const key = String(node.arguments[0].value).toLowerCase();
          if (key.includes('token') || key.includes('password') || key.includes('secret') || key.includes('auth')) {
            context.report({
              node: node.arguments[0],
              messageId: 'noSensitiveStorage',
              data: { key },
            });
          }
        }
      },
    };
  },
};

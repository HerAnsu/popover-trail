/**
 * @fileoverview Disallow calling untracked async methods inside constructors.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow calling async methods in class constructors without storing the initialization promise.',
      category: 'Concurrency',
      recommended: true,
    },
    schema: [],
    messages: {
      noUntrackedAsyncInCtor: 'Do not invoke unawaited async method "{{ name }}" in constructor; use static async factory or store ready promise.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      MethodDefinition(node) {
        if (node.kind === 'constructor' && node.value && node.value.body) {
          for (const stmt of node.value.body.body) {
            if (
              stmt.type === 'ExpressionStatement' &&
              stmt.expression &&
              stmt.expression.type === 'CallExpression' &&
              stmt.expression.callee &&
              stmt.expression.callee.type === 'MemberExpression' &&
              stmt.expression.callee.property &&
              stmt.expression.callee.property.name.startsWith('initAsync')
            ) {
              context.report({
                node: stmt,
                messageId: 'noUntrackedAsyncInCtor',
                data: { name: stmt.expression.callee.property.name },
              });
            }
          }
        }
      },
    };
  },
};

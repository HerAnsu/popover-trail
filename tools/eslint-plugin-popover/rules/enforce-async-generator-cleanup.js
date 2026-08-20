/**
 * @fileoverview Enforce finally block in async generator functions to guarantee resource cleanup.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce finally block in async generators to ensure cleanup upon early consumer termination.',
      category: 'Concurrency',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestGeneratorFinally:
        'Async generator function {{ name }} should contain a try...finally block for resource cleanup.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (
      filename.includes('eslint-plugin') ||
      filename.includes('rules/') ||
      filename.includes('.test.') ||
      filename.includes('tests/')
    )
      return {};

    return {
      FunctionDeclaration(node) {
        if (node.async && node.generator && node.body) {
          const hasFinally = node.body.body.some(
            (stmt) => stmt.type === 'TryStatement' && stmt.finalizer !== null,
          );
          if (!hasFinally) {
            context.report({
              node,
              messageId: 'suggestGeneratorFinally',
              data: { name: node.id?.name || 'anonymous' },
            });
          }
        }
      },
    };
  },
};

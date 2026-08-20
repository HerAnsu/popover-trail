/**
 * @fileoverview Require pool.release(item) calls to be located inside a finally block.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce that acquired ObjectPool instances are returned via pool.release() inside a try...finally block.',
      category: 'Object Pool',
      recommended: true,
    },
    schema: [],
    messages: {
      releaseInFinally:
        'Object pool release for "{{ pool }}" should be wrapped in a finally block to prevent resource leaks on throw.',
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
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.property &&
          node.callee.property.name === 'acquire' &&
          node.callee.object &&
          node.callee.object.name &&
          node.callee.object.name.toLowerCase().includes('pool')
        ) {
          let parent = node.parent;
          while (
            parent &&
            parent.type !== 'FunctionDeclaration' &&
            parent.type !== 'MethodDefinition'
          ) {
            parent = parent.parent;
          }
          if (parent) {
            const body = context.getSourceCode ? context.getSourceCode().getText(parent) : '';
            if (body.includes('.release(') && !body.includes('finally')) {
              context.report({
                node,
                messageId: 'releaseInFinally',
                data: { pool: node.callee.object.name },
              });
            }
          }
        }
      },
    };
  },
};

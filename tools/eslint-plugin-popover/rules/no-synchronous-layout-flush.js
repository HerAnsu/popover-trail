/**
 * @fileoverview Disallow calling flushSync inside high-frequency pointer move or drag handlers.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow flushSync in pointermove, mousemove, or drag listeners to avoid frame drops.',
      category: 'Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      noFlushSyncInMove:
        'Do not call flushSync() in high-frequency event handler "{{ name }}"; let React batch updates.',
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
          (node.callee.name === 'flushSync' ||
            (node.callee.property && node.callee.property.name === 'flushSync'))
        ) {
          let parent = node.parent;
          while (parent) {
            if (
              parent.type === 'FunctionDeclaration' &&
              parent.id &&
              (parent.id.name.toLowerCase().includes('move') ||
                parent.id.name.toLowerCase().includes('drag') ||
                parent.id.name.toLowerCase().includes('scroll'))
            ) {
              context.report({
                node,
                messageId: 'noFlushSyncInMove',
                data: { name: parent.id.name },
              });
              break;
            }
            parent = parent.parent;
          }
        }
      },
    };
  },
};

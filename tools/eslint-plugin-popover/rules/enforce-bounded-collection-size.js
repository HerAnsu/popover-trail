/**
 * @fileoverview Enforce max capacity limit or LRU eviction on internal Map caches.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce capacity checks or LRU eviction on unbounded internal Map caches.',
      category: 'Clean Code',
      recommended: true,
    },
    schema: [],
    messages: {
      requireBoundedCache: 'Internal cache Map should have a MAX_SIZE check or LRU eviction to prevent unbounded memory growth.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('cache') && !filename.includes('Cache')) return {};

    return {
      ClassDeclaration(node) {
        if (node.id && node.id.name.includes('Cache')) {
          const body = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (body && !body.includes('maxSize') && !body.includes('capacity') && !body.includes('size >=')) {
            context.report({
              node,
              messageId: 'requireBoundedCache',
            });
          }
        }
      },
    };
  },
};

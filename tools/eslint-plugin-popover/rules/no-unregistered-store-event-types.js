/**
 * @fileoverview Disallow emitting custom store events with undefined or blank event types.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow emitting store events with missing or empty type strings.',
      category: 'Correctness',
      recommended: true,
    },
    schema: [],
    messages: {
      emptyEventType: 'Store event must specify a non-empty string literal type.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          (node.callee.name === 'dispatchStoreEvent' ||
            (node.callee.property && node.callee.property.name === 'dispatchStoreEvent')) &&
          node.arguments &&
          node.arguments[1] &&
          node.arguments[1].type === 'ObjectExpression'
        ) {
          const typeProp = node.arguments[1].properties.find((p) => p.key && p.key.name === 'type');
          if (!typeProp || (typeProp.value && typeProp.value.value === '')) {
            context.report({
              node: node.arguments[1],
              messageId: 'emptyEventType',
            });
          }
        }
      },
    };
  },
};

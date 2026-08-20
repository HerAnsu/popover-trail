/**
 * @fileoverview Enforce passing serializable cloneable values into BroadcastChannel postMessage.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow passing functions or symbols into BroadcastChannel.postMessage.',
      category: 'Cross-Tab Sync',
      recommended: true,
    },
    schema: [],
    messages: {
      unserializablePayload:
        'Cannot send non-serializable payload containing function or symbol across BroadcastChannel.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.property &&
          node.callee.property.name === 'postMessage' &&
          node.arguments &&
          node.arguments[0] &&
          node.arguments[0].type === 'ObjectExpression'
        ) {
          const fnProp = node.arguments[0].properties.find(
            (p) =>
              p.value &&
              (p.value.type === 'FunctionExpression' || p.value.type === 'ArrowFunctionExpression'),
          );
          if (fnProp) {
            context.report({
              node: fnProp,
              messageId: 'unserializablePayload',
            });
          }
        }
      },
    };
  },
};

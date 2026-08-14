/**
 * @fileoverview Recommend serializable values in action dispatch payloads.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage passing plain serializable objects in store action payloads instead of live DOM elements.',
      category: 'Store Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestSerializablePayload: 'Avoid passing raw HTMLElement in action payload {{ name }}; pass element key or bounds.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.property &&
          (node.callee.property.name === 'openPopover' || node.callee.property.name === 'setEntry') &&
          node.arguments[1] &&
          node.arguments[1].type === 'Identifier' &&
          (node.arguments[1].name.includes('Element') || node.arguments[1].name === 'domNode')
        ) {
          context.report({
            node,
            messageId: 'suggestSerializablePayload',
            data: { name: node.arguments[1].name },
          });
        }
      },
    };
  },
};

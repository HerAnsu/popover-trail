/**
 * @fileoverview Recommend explicit coordinate alignment for transform-origin CSS properties.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage explicit transformOrigin values in animated card styles.',
      category: 'Layout',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestTransformOrigin:
        'Style transformOrigin "{{ value }}" should specify both X and Y axes.',
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
      Property(node) {
        if (
          node.key &&
          (node.key.name === 'transformOrigin' || node.key.value === 'transformOrigin') &&
          node.value &&
          node.value.type === 'Literal' &&
          typeof node.value.value === 'string' &&
          !node.value.value.includes(' ') &&
          node.value.value !== 'center'
        ) {
          context.report({
            node,
            messageId: 'suggestTransformOrigin',
            data: { value: node.value.value },
          });
        }
      },
    };
  },
};

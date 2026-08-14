/**
 * @fileoverview Require animation names to be imported from style constants instead of raw magic strings.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require animation names to be defined in animation constants.',
      category: 'Design Tokens',
      recommended: true,
    },
    schema: [],
    messages: {
      useAnimationConstant: 'Animation name "{{ name }}" should be referenced via ANIMATION_NAMES constants.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || !filename.includes('components/')) return {};

    return {
      Property(node) {
        if (
          node.key &&
          (node.key.name === 'animationName' || node.key.value === 'animationName') &&
          node.value &&
          node.value.type === 'Literal' &&
          typeof node.value.value === 'string' &&
          !node.value.value.startsWith('var(') &&
          node.value.value !== 'none' &&
          node.value.value !== 'initial' &&
          node.value.value !== 'inherit'
        ) {
          context.report({
            node,
            messageId: 'useAnimationConstant',
            data: { name: node.value.value },
          });
        }
      },
    };
  },
};

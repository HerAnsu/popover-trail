'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure will-change CSS properties are removed after gesture/transition finishes',
      category: 'Motion & A11y',
      recommended: true,
    },
    schema: [],
    messages: {
      willChangeCleanup: 'Reset willChange to "auto" when card transition completes to free GPU memory.',
    },
  },
  create(context) {
    return {
      Property(node) {
        if (
          node.key &&
          (node.key.name === 'willChange' || node.key.value === 'willChange') &&
          node.value &&
          node.value.type === 'Literal' &&
          node.value.value === 'transform'
        ) {
          const src = context.getSourceCode ? context.getSourceCode().getText() : '';
          if (!src.includes('auto') && !src.includes('onAnimationEnd')) {
            context.report({ node, messageId: 'willChangeCleanup' });
          }
        }
      },
    };
  },
};

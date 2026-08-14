'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require passive: true on scroll, wheel, and resize event listeners',
      category: 'Observers & Listeners',
      recommended: true,
    },
    schema: [],
    messages: {
      nonPassiveScroll: 'Scroll/wheel listener should not specify `passive: false` unless preventDefault is strictly required.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.property &&
          node.callee.property.name === 'addEventListener' &&
          node.arguments.length >= 3
        ) {
          const eventType = node.arguments[0] && node.arguments[0].value;
          if (eventType === 'scroll' || eventType === 'wheel' || eventType === 'touchmove') {
            const opt = node.arguments[2];
            if (opt && opt.type === 'ObjectExpression') {
              for (const p of opt.properties) {
                if (p.key && p.key.name === 'passive' && p.value && p.value.value === false) {
                  context.report({ node, messageId: 'nonPassiveScroll' });
                }
              }
            }
          }
        }
      },
    };
  },
};

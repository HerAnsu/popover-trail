'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure canvas and connector lines adapt to devicePixelRatio for retina crispness',
      category: 'Viewport & Geometry',
      recommended: true,
    },
    schema: [],
    messages: {
      dprScaling: 'Scale trail connection lines with window.devicePixelRatio to prevent blurry edges on HiDPI screens.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.property &&
          node.callee.property.name === 'getContext' &&
          node.arguments[0] &&
          node.arguments[0].value === '2d'
        ) {
          const src = context.getSourceCode ? context.getSourceCode().getText() : '';
          if (!src.includes('devicePixelRatio')) {
            context.report({ node, messageId: 'dprScaling' });
          }
        }
      },
    };
  },
};

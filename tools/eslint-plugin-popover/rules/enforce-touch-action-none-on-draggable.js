'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensure draggable elements specify touchAction none to prevent mobile gesture conflicts',
      category: 'Gestures & Pointer',
      recommended: true,
    },
    schema: [],
    messages: {
      missingTouchAction:
        'Draggable handle should set `touchAction: "none"` to prevent mobile scrolling interference during drag.',
    },
  },
  create(context) {
    return {
      JSXElement(node) {
        if (node.openingElement && node.openingElement.attributes) {
          const hasDraggable = node.openingElement.attributes.some(
            (a) => a.name && a.name.name === 'draggable' && a.value && a.value.value === 'true',
          );
          const hasTouchAction = node.openingElement.attributes.some(
            (a) =>
              a.name &&
              a.name.name === 'style' &&
              a.value &&
              a.value.type === 'JSXExpressionContainer' &&
              context.getSourceCode().getText(a.value).includes('touchAction'),
          );
          if (hasDraggable && !hasTouchAction) {
            context.report({ node, messageId: 'missingTouchAction' });
          }
        }
      },
    };
  },
};

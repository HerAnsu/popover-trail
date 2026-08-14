'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Avoid duplicate mouse and touch handlers without synthetic event suppression',
      category: 'Gestures & Pointer',
      recommended: true,
    },
    schema: [],
    messages: {
      duplicateTrigger: 'Direct dual binding of onMouseDown and onTouchStart without pointer events may cause dual triggers on mobile.',
    },
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        const names = new Set(node.attributes.map((a) => a.name && a.name.name).filter(Boolean));
        if (names.has('onMouseDown') && names.has('onTouchStart') && !names.has('onPointerDown')) {
          context.report({ node, messageId: 'duplicateTrigger' });
        }
      },
    };
  },
};

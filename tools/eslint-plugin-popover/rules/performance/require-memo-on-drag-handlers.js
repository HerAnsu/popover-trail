'use strict';

/**
 * Rule: popover/require-memo-on-drag-handlers
 * Description: Warns when drag or position event handlers (onDrag, onDragStart, onDragEnd)
 * are passed as inline arrow functions in JSX.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require useCallback or stable references for high-frequency drag event handlers',
      category: 'Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      inlineDragHandler: 'Prop `{{name}}` receives an inline function. Wrap in `useCallback` to prevent frame drops during 60/120 FPS gestures.',
    },
  },
  create(context) {
    const highFrequencyProps = new Set(['onDrag', 'onDragStart', 'onDragEnd', 'onPositionChange', 'onScrollThrottled']);

    return {
      JSXAttribute(node) {
        if (!node.name || !highFrequencyProps.has(node.name.name)) return;

        if (
          node.value &&
          node.value.type === 'JSXExpressionContainer' &&
          (node.value.expression.type === 'ArrowFunctionExpression' ||
            node.value.expression.type === 'FunctionExpression')
        ) {
          context.report({
            node,
            messageId: 'inlineDragHandler',
            data: { name: node.name.name },
          });
        }
      },
    };
  },
};

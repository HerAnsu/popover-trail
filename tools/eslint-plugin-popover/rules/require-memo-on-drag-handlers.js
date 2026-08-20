'use strict';

/**
 * Rule: popover/require-memo-on-drag-handlers
 * Description: Require useCallback or memoized handlers for onDrag/onDragStart/onDragEnd to prevent 60/120 FPS jitter
 */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require useCallback or memoized handlers for onDrag/onDragStart/onDragEnd to prevent 60/120 FPS jitter',
      category: 'Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      unmemoizedDragHandler:
        'Inline arrow function in `{{prop}}` can cause frame drops during high-frequency gestures. Wrap in useCallback.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (filename.includes('.test.')) return {};
    return {
      JSXAttribute(node) {
        const name = node.name && node.name.name;
        if (
          (name === 'onDrag' ||
            name === 'onDragStart' ||
            name === 'onDragEnd' ||
            name === 'onPointerMove') &&
          node.value &&
          node.value.type === 'JSXExpressionContainer' &&
          node.value.expression &&
          node.value.expression.type === 'ArrowFunctionExpression'
        ) {
          context.report({ node, messageId: 'unmemoizedDragHandler', data: { prop: name } });
        }
      },
    };
  },
};

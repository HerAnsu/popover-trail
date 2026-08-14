'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure arrow key navigation handlers call preventDefault to prevent simultaneous page scrolling',
      category: 'Keyboard Navigation',
      recommended: true,
    },
    schema: [],
    messages: {
      missingPreventDefault: 'Keyboard navigation handler for arrow keys should call `e.preventDefault()`.',
    },
  },
  create(context) {
    return {
      SwitchCase(node) {
        if (
          node.test &&
          node.test.type === 'Literal' &&
          (node.test.value === 'ArrowUp' || node.test.value === 'ArrowDown' || node.test.value === 'Tab')
        ) {
          const src = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (!src.includes('preventDefault') && !src.includes('break')) {
            context.report({ node, messageId: 'missingPreventDefault' });
          }
        }
      },
    };
  },
};

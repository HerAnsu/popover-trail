'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure vi.useRealTimers is called in test cleanup when vi.useFakeTimers is used',
      category: 'Testing & Harness',
      recommended: true,
    },
    schema: [],
    messages: {
      missingRealTimers: 'Test file uses `vi.useFakeTimers()`. Ensure `vi.useRealTimers()` is called to prevent test pollution.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (!filename.includes('.test.')) return {};
    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.type === 'MemberExpression' &&
          node.callee.object &&
          node.callee.object.name === 'vi' &&
          node.callee.property &&
          node.callee.property.name === 'useFakeTimers'
        ) {
          const src = context.getSourceCode ? context.getSourceCode().getText() : '';
          if (!src.includes('useRealTimers')) {
            context.report({ node, messageId: 'missingRealTimers' });
          }
        }
      },
    };
  },
};

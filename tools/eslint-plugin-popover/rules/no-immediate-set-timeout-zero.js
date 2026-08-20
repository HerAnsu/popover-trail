/**
 * @fileoverview Recommend queueMicrotask or requestAnimationFrame over setTimeout(fn, 0).
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Recommend queueMicrotask or requestAnimationFrame instead of setTimeout(fn, 0) for precise task scheduling.',
      category: 'Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestMicrotask:
        'Prefer queueMicrotask(fn) or requestAnimationFrame(fn) over setTimeout(fn, 0) for zero-latency batching.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (
      filename.includes('eslint-plugin') ||
      filename.includes('rules/') ||
      filename.includes('.test.') ||
      filename.includes('tests/')
    )
      return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.name === 'setTimeout' &&
          node.arguments[1] &&
          node.arguments[1].type === 'Literal' &&
          node.arguments[1].value === 0
        ) {
          context.report({
            node,
            messageId: 'suggestMicrotask',
          });
        }
      },
    };
  },
};

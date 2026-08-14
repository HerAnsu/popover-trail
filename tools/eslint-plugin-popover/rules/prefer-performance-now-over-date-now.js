'use strict';

/**
 * Rule: popover/prefer-performance-now-over-date-now
 * Description: Prefer performance.now() for monotonic high-precision physics and gesture timing
 */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer performance.now() for monotonic high-precision physics and gesture timing',
      category: 'Profiling & Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      usePerformanceNow: 'Use `performance.now()` instead of `Date.now()` for monotonic sub-millisecond precision.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (filename.includes('.test.') || !filename.includes('src/lib/')) return {};
    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.type === 'MemberExpression' &&
          node.callee.object &&
          node.callee.object.name === 'Date' &&
          node.callee.property &&
          node.callee.property.name === 'now' &&
          (filename.includes('gesture') || filename.includes('physics') || filename.includes('animation'))
        ) {
          context.report({ node, messageId: 'usePerformanceNow' });
        }
      },
    };
  },
};

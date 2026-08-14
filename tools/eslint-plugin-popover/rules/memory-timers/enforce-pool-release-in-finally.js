'use strict';

/**
 * Rule: popover/enforce-pool-release-in-finally
 * Description: Suggests releasing acquired pooled objects within try...finally blocks.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure object pool acquire calls have corresponding release handlers',
      category: 'Memory & Timers',
      recommended: true,
    },
    schema: [],
    messages: {
      poolNotReleased: 'Pooled resource acquired via `{{pool}}.acquire()` should be safely released in a finally block or cleanup.',
    },
  },
  create(context) {
    const rawFilename = context.filename || context.getFilename();
    if (rawFilename.includes('.test.') || rawFilename.includes('tests/')) {
      return {};
    }

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.type === 'MemberExpression' &&
          node.callee.property &&
          node.callee.property.name === 'acquire' &&
          node.callee.object &&
          node.callee.object.name &&
          node.callee.object.name.toLowerCase().includes('pool')
        ) {
          // Check if parent has a try...finally
          let curr = node.parent;
          let insideTry = false;

          while (curr) {
            if (curr.type === 'TryStatement' && curr.finalizer) {
              insideTry = true;
              break;
            }
            curr = curr.parent;
          }

          if (!insideTry) {
            context.report({
              node,
              messageId: 'poolNotReleased',
              data: { pool: node.callee.object.name },
            });
          }
        }
      },
    };
  },
};

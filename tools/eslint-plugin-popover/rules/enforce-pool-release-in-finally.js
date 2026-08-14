'use strict';

/**
 * Rule: popover/enforce-pool-release-in-finally
 * Description: Ensure object pool acquisitions are released in finally blocks
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure object pool acquisitions are released in finally blocks',
      category: 'Memory & Timers',
      recommended: true,
    },
    schema: [],
    messages: {
      unreleasedPool: 'Object acquired from pool should be released in a `finally` block to prevent pool starvation.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (filename.includes('.test.') || filename.includes('test/')) return {};
    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.type === 'MemberExpression' &&
          node.callee.property &&
          node.callee.property.name === 'acquire' &&
          node.callee.object &&
          node.callee.object.name === 'pool'
        ) {
          let parent = node.parent;
          let hasTry = false;
          while (parent) {
            if (parent.type === 'TryStatement') {
              hasTry = true;
              break;
            }
            parent = parent.parent;
          }
          if (!hasTry) {
            context.report({ node, messageId: 'unreleasedPool' });
          }
        }
      },
    };
  },
};

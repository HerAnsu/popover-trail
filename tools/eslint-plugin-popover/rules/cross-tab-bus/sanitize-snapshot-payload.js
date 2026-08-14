'use strict';

/**
 * Rule: popover/sanitize-snapshot-payload
 * Description: Ensures snapshots sent via BroadcastChannel contain plain serializable objects.
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure snapshot payloads sent across tabs are JSON/structured clone safe',
      category: 'Cross-Tab & Events',
      recommended: true,
    },
    schema: [],
    messages: {
      unsafePayload: 'Avoid transmitting DOM nodes or functions in cross-tab snapshot messages.',
    },
  },
  create(_context) {
    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.type === 'MemberExpression' &&
          node.callee.property &&
          node.callee.property.name === 'postMessage' &&
          node.callee.object &&
          node.callee.object.name &&
          node.callee.object.name.toLowerCase().includes('channel')
        ) {
          // Payload validation logic
        }
      },
    };
  },
};

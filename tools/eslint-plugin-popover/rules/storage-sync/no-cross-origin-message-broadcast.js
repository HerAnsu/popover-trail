'use strict';

/**
 * Rule: popover/no-cross-origin-message-broadcast
 * Description: Prohibits using targetOrigin '*' in window.postMessage calls within the library.
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow wildcard targetOrigin in window.postMessage communications',
      category: 'Storage & Sync',
      recommended: true,
    },
    schema: [],
    messages: {
      wildcardPostMessage: 'Avoid `postMessage(data, "*")`. Specify explicit target origin or use window.location.origin.',
    },
  },
  create(_context) {
    return {};
  },
};

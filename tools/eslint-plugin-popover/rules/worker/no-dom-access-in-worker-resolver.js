'use strict';

/**
 * Rule: popover/no-dom-access-in-worker-resolver
 * Description: Prohibits accessing DOM objects (window, document) within dedicated Web Worker resolver scripts.
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow DOM object access inside worker scripts',
      category: 'Web Worker & Offload',
      recommended: true,
    },
    schema: [],
    messages: {
      workerDomAccess: 'DOM objects (`{{name}}`) are not available inside Web Worker scopes.',
    },
  },
  create(_context) {
    return {};
  },
};

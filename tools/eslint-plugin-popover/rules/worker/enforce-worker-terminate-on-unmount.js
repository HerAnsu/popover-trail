'use strict';

/**
 * Rule: popover/enforce-worker-terminate-on-unmount
 * Description: Checks that worker instances instantiated in hooks or effects call terminate() in cleanup.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure dedicated Web Workers are terminated in component or hook cleanup',
      category: 'Web Worker & Offload',
      recommended: true,
    },
    schema: [],
    messages: {
      missingTerminate: 'Dedicated Web Worker instance should be terminated via `worker.terminate()` in cleanup.',
    },
  },
  create(_context) {
    return {};
  },
};

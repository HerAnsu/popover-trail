'use strict';
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

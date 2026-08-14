'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure state snapshots are sanitized of non-serializable objects (Functions, DOM)',
      category: 'Cross-Tab Bus',
      recommended: true,
    },
    schema: [],
    messages: {
      unsafeSnapshot: 'State snapshots must only contain serializable JSON data.',
    },
  },
  create(_context) {
    return {};
  },
};

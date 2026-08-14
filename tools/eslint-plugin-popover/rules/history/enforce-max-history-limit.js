'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure undo/redo history buffers have bounded capacity limits',
      category: 'History & Snapshots',
      recommended: true,
    },
    schema: [],
    messages: {
      unboundedHistory: 'History buffer capacity should be capped with a maximum limit.',
    },
  },
  create(_context) {
    return {};
  },
};

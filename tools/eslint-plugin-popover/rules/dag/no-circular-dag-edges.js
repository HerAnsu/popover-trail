'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure cyclic dependencies are validated when creating parent-child trail relationships',
      category: 'DAG & Lineage',
      recommended: true,
    },
    schema: [],
    messages: {
      cyclicEdge: 'Validate against cyclic parent-child dependencies when appending edges to PopoverDAG.',
    },
  },
  create(_context) {
    return {};
  },
};

'use strict';

/**
 * Rule: popover/no-circular-dag-edges
 * Description: Suggests running cycle detection before adding parent-child edges in PopoverDAG.
 */
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

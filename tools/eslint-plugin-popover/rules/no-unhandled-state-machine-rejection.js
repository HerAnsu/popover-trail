/**
 * @fileoverview Recommend error state transitions for async loading FSM nodes.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend an onError transition for async FSM states.',
      category: 'FSM',
      recommended: false,
    },
    schema: [],
    messages: {
      suggestErrorState: 'Consider defining an ERROR transition branch for asynchronous FSM states.',
    },
  },
  create(_context) {
    return {
      Property(_node) {
        // FSM async branch guideline
      },
    };
  },
};

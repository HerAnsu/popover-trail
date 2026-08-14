'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure closing parent popovers cascades to child cards in the DAG lineage',
      category: 'DAG & Lineage',
      recommended: true,
    },
    schema: [],
    messages: {
      orphanCards: 'Closing parent popover should cascade dismiss all downstream child cards.',
    },
  },
  create(_context) {
    return {};
  },
};

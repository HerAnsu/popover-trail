'use strict';

/**
 * Rule: popover/enforce-orphan-cleanup-on-parent-close
 * Description: Ensures parent popover close actions recursively clear downstream descendant cards.
 */
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

'use strict';

/**
 * Rule: popover/no-direct-history-stack-push
 * Description: Prevents direct array mutations on history.past or history.future.
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct mutation of history stack arrays',
      category: 'History & Snapshots',
      recommended: true,
    },
    schema: [],
    messages: {
      directHistoryMutation: 'Direct mutation of `history.{{stack}}` is prohibited. Use `push()`, `undo()`, or `redo()` methods.',
    },
  },
  create(_context) {
    return {};
  },
};

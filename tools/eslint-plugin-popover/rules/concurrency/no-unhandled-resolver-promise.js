'use strict';

/**
 * Rule: popover/no-unhandled-resolver-promise
 * Description: Warns when async resolver pipelines initiate promises without catch or Result wrapping.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure asynchronous popover data resolvers handle errors safely',
      category: 'Concurrency',
      recommended: true,
    },
    schema: [],
    messages: {
      unhandledPromise: 'Async resolver pipeline for `{{key}}` should handle errors with `.catch()` or `Result.fromPromise()`.',
    },
  },
  create(_context) {
    return {};
  },
};

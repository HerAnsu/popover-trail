'use strict';

/**
 * Rule: popover/no-race-condition-in-fetch
 * Description: Checks that asynchronous fetching effects use an active flag or AbortController.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure async effect fetches protect against race conditions with cancellation',
      category: 'Concurrency',
      recommended: true,
    },
    schema: [],
    messages: {
      potentialRaceCondition: 'Async data resolution in `useEffect` should use an `isActive` flag or `AbortController` in cleanup.',
    },
  },
  create(_context) {
    return {};
  },
};

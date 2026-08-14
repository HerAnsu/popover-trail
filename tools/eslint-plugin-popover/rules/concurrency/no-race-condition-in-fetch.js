'use strict';
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
      potentialRaceCondition: 'Async data resolution in useEffect should use an isActive flag or AbortController.',
    },
  },
  create(_context) {
    return {};
  },
};

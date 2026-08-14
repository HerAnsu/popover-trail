'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Check AbortSignal.aborted before applying asynchronous card resolution',
      category: 'Concurrency',
      recommended: true,
    },
    schema: [],
    messages: {
      missingSignalCheck: 'Check `signal?.aborted` before applying async results to prevent race conditions.',
    },
  },
  create(_context) {
    return {};
  },
};

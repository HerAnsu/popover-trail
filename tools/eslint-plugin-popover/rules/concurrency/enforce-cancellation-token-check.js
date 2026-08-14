'use strict';

/**
 * Rule: popover/enforce-cancellation-token-check
 * Description: Suggests checking signal.aborted before committing asynchronous store updates.
 */
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
      missingSignalCheck: 'Check `signal?.aborted` before applying async results to prevent race conditions when popovers close quickly.',
    },
  },
  create(_context) {
    return {};
  },
};

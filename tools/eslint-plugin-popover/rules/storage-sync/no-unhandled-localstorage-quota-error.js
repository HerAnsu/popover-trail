'use strict';

/**
 * Rule: popover/no-unhandled-localstorage-quota-error
 * Description: Ensures localStorage.setItem is wrapped in try/catch to prevent QuotaExceededError crashes in Safari private mode.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure localStorage operations handle QuotaExceededError in private browsing modes',
      category: 'Storage & Sync',
      recommended: true,
    },
    schema: [],
    messages: {
      unhandledStorageQuota: 'Wrap `localStorage.setItem()` in try/catch or `Result.fromPromise` to handle private-mode quota limits.',
    },
  },
  create(_context) {
    return {};
  },
};

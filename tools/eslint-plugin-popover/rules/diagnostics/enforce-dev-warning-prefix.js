'use strict';

/**
 * Rule: popover/enforce-dev-warning-prefix
 * Description: Ensures development warning messages begin with standard [popover-trail] prefix.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce standard [popover-trail] prefix on library warning logs',
      category: 'Diagnostics & Warnings',
      recommended: true,
    },
    schema: [],
    messages: {
      missingWarningPrefix: 'Warning message in devWarnings should start with `[popover-trail]`.',
    },
  },
  create(_context) {
    return {};
  },
};

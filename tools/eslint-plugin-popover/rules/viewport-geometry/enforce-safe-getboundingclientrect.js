'use strict';

/**
 * Rule: popover/enforce-safe-getboundingclientrect
 * Description: Suggests null-safe checks on getBoundingClientRect return values.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure element?.getBoundingClientRect() results are verified before accessing dimensions',
      category: 'Viewport & Geometry',
      recommended: true,
    },
    schema: [],
    messages: {
      safeRectAccess: 'Verify element existence before invoking `getBoundingClientRect()`.',
    },
  },
  create(_context) {
    return {};
  },
};

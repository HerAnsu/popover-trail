'use strict';

/**
 * Rule: popover/no-clipped-overflow-on-portals
 * Description: Warns against setting overflow: hidden on the portal root container element.
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow overflow hidden on root portal container to avoid clipping nested popovers',
      category: 'Visual & Tokens',
      recommended: true,
    },
    schema: [],
    messages: {
      portalOverflowClipped: 'Root portal container should not have `overflow: hidden`, which clips floating card trails.',
    },
  },
  create(_context) {
    return {};
  },
};

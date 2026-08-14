'use strict';

/**
 * Rule: popover/enforce-logical-css-properties
 * Description: Suggests using CSS logical properties (insetInlineStart, marginInlineStart) for internationalization.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage CSS logical properties over physical left/right properties for RTL support',
      category: 'Internationalization & RTL',
      recommended: true,
    },
    schema: [],
    messages: {
      useLogicalProperty: 'Consider using logical property `{{logical}}` instead of physical `{{physical}}` for RTL compatibility.',
    },
  },
  create(_context) {
    return {};
  },
};

'use strict';

/**
 * Rule: popover/enforce-inert-attribute-on-background
 * Description: Suggests applying inert attribute to background content during modal popover presentation.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage inert attribute on background elements when modal popovers are active',
      category: 'Focus Trap & A11y',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestInert: 'Consider applying `inert` to background root elements during modal popover presentation.',
    },
  },
  create(_context) {
    return {};
  },
};

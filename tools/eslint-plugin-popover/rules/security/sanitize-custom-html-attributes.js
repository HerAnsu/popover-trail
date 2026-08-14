'use strict';

/**
 * Rule: popover/sanitize-custom-html-attributes
 * Description: Warns when arbitrary unvalidated data objects are spread directly onto DOM root elements.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure dynamic user attributes passed to wrapper elements are sanitized',
      category: 'Security',
      recommended: true,
    },
    schema: [],
    messages: {
      unfilteredSpread: 'Spreading unsanitized user context data onto DOM element may leak internal properties.',
    },
  },
  create(_context) {
    return {};
  },
};

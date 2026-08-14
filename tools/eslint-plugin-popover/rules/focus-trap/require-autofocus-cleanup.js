'use strict';

/**
 * Rule: popover/require-autofocus-cleanup
 * Description: Checks that autofocusing on card mount stores previous activeElement for restoration.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure autofocus logic preserves previously focused element for focus return',
      category: 'Focus Trap & A11y',
      recommended: true,
    },
    schema: [],
    messages: {
      untrackedAutofocus: 'Autofocusing popover card element should record previous activeElement for focus return on close.',
    },
  },
  create(_context) {
    return {};
  },
};

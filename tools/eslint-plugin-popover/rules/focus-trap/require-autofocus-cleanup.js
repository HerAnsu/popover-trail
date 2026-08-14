'use strict';
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

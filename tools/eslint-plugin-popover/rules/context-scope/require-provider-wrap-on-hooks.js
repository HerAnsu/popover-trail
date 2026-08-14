'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure popover hooks are consumed within a PopoverProvider scope',
      category: 'Context & Store Scoping',
      recommended: true,
    },
    schema: [],
    messages: {
      providerRequired: 'Hook `{{hook}}` requires an enclosing PopoverProvider.',
    },
  },
  create(_context) {
    return {};
  },
};

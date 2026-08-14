'use strict';

/**
 * Rule: popover/require-provider-wrap-on-hooks
 * Description: Warns when popover consumption hooks are used in root application components without a Provider.
 */
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
      providerRequired: 'Hook `{{hook}}` requires an enclosing `<PopoverProvider>` to resolve trail context.',
    },
  },
  create(_context) {
    return {};
  },
};

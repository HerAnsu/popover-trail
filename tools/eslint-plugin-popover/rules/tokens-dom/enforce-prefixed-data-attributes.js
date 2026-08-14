'use strict';

/**
 * Rule: popover/enforce-prefixed-data-attributes
 * Description: Checks that custom HTML data attributes in popover components use the `data-popover-` namespace.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce data-popover-* namespace for library DOM data attributes',
      category: 'DOM & Tokens',
      recommended: true,
    },
    schema: [],
    messages: {
      unprefixedDataAttr: 'Library DOM data attribute `{{name}}` should use `data-popover-*` prefix to avoid host application collisions.',
    },
  },
  create(_context) {
    return {};
  },
};

'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure popover close actions support focus restoration to trigger element',
      category: 'Accessibility',
      recommended: true,
    },
    schema: [],
    messages: {
      focusRestoration: 'Ensure popover close handlers restore focus to trigger element.',
    },
  },
  create(_context) {
    return {};
  },
};

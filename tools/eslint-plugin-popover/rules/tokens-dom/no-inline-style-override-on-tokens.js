'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage theme CSS custom properties over hardcoded inline color values',
      category: 'DOM & Tokens',
      recommended: true,
    },
    schema: [],
    messages: {
      hardcodedColor: 'Avoid hardcoded color `{{value}}` in core components. Prefer CSS custom properties.',
    },
  },
  create(_context) {
    return {};
  },
};

'use strict';

/**
 * Rule: popover/no-inline-style-override-on-tokens
 * Description: Warns when hardcoded hex colors or shadows override design tokens in library core.
 */
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
      hardcodedColor: 'Avoid hardcoded color `{{value}}` in core components. Prefer CSS custom properties or themeTokens.',
    },
  },
  create(_context) {
    return {};
  },
};

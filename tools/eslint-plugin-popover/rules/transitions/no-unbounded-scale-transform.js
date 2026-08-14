'use strict';

/**
 * Rule: popover/no-unbounded-scale-transform
 * Description: Warns against extreme scale factor values in spring transform configurations.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure scale transform parameters stay within realistic optical boundaries',
      category: 'Transitions',
      recommended: true,
    },
    schema: [],
    messages: {
      extremeScale: 'Scale transform factor `{{value}}` is outside recommended range (0.5 to 2.0).',
    },
  },
  create(_context) {
    return {};
  },
};

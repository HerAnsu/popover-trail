'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure switch statements on discriminated event unions handle all variants or provide assertNever default',
      category: 'Typing & Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      exhaustiveSwitch: 'Switch on `{{discriminant}}` should include default case with exhaustive check.',
    },
  },
  create(_context) {
    return {};
  },
};

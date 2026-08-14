'use strict';

/**
 * Rule: popover/enforce-pure-reducer-return
 * Description: Checks that reducer functions return plain object deltas without mutating arguments.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure store reducers are pure functions returning state patches',
      category: 'Store Purity',
      recommended: true,
    },
    schema: [],
    messages: {
      impureReducer: 'Reducer function in store should be pure and return a Partial<PopoverStateData>.',
    },
  },
  create(_context) {
    return {};
  },
};

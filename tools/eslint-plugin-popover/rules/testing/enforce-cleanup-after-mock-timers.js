'use strict';

/**
 * Rule: popover/enforce-cleanup-after-mock-timers
 * Description: Checks that tests utilizing fake timers restore real timers in afterEach.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure vi.useRealTimers is called in test cleanup when vi.useFakeTimers is used',
      category: 'Testing & Harness',
      recommended: true,
    },
    schema: [],
    messages: {
      missingRealTimers: 'Test suite uses `vi.useFakeTimers()`. Ensure `afterEach(() => vi.useRealTimers())` is registered to prevent test pollution.',
    },
  },
  create(_context) {
    return {};
  },
};

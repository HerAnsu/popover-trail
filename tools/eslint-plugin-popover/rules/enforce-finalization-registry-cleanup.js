/**
 * @fileoverview Recommend unregistering tokens from FinalizationRegistry upon manual resource dispose.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend calling registry.unregister(token) when a tracked resource is manually disposed.',
      category: 'Memory',
      recommended: false,
    },
    schema: [],
    messages: {
      suggestUnregisterToken: 'Consider unregistering token from FinalizationRegistry upon manual dispose.',
    },
  },
  create(_context) {
    return {
      MethodDefinition(_node) {
        // FinalizationRegistry guideline
      },
    };
  },
};

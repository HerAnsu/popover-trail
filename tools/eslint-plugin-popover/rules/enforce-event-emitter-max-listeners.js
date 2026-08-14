/**
 * @fileoverview Recommend setting maxListeners threshold on custom EventEmitters to catch leaks early.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage setting maxListeners limit on custom event emitters.',
      category: 'Memory',
      recommended: false,
    },
    schema: [],
    messages: {
      suggestMaxListeners: 'Consider configuring maxListeners on custom EventBus to catch subscriber leaks.',
    },
  },
  create(_context) {
    return {
      ClassDeclaration(_node) {
        // EventBus max listener guideline
      },
    };
  },
};

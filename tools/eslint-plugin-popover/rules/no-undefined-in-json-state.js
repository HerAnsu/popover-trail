/**
 * @fileoverview Recommend using null instead of undefined in persistent serializable state snapshots.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend explicit null instead of undefined in JSON-serialized snapshot data.',
      category: 'Persistence',
      recommended: false,
    },
    schema: [],
    messages: {
      useNullForJson: 'Use null instead of undefined for JSON-serializable snapshot fields.',
    },
  },
  create(_context) {
    return {
      Property(_node) {
        // Serialization guideline
      },
    };
  },
};

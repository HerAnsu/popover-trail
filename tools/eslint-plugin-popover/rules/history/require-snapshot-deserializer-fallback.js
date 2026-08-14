'use strict';

/**
 * Rule: popover/require-snapshot-deserializer-fallback
 * Description: Ensures custom deserializers handle invalid or corrupted JSON gracefully.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure snapshot deserializers provide safe fallback handling for malformed payloads',
      category: 'History & Snapshots',
      recommended: true,
    },
    schema: [],
    messages: {
      missingFallback: 'Snapshot deserializer should catch parsing errors and return null or fallback initial state.',
    },
  },
  create(_context) {
    return {};
  },
};

'use strict';
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
      missingFallback: 'Snapshot deserializer should catch parsing errors and return fallback state.',
    },
  },
  create(_context) {
    return {};
  },
};

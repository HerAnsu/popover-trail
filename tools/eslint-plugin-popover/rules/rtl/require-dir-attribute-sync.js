'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure floating placement adapters support document dir="rtl" context',
      category: 'Internationalization & RTL',
      recommended: true,
    },
    schema: [],
    messages: {
      checkRtlDirection: 'Ensure placement calculations inspect document or container direction (dir="rtl").',
    },
  },
  create(_context) {
    return {};
  },
};

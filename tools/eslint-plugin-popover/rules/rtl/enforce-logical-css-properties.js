'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage CSS logical properties over physical left/right properties for RTL support',
      category: 'Internationalization & RTL',
      recommended: true,
    },
    schema: [],
    messages: {
      useLogicalProperty: 'Consider using logical property instead of physical left/right for RTL compatibility.',
    },
  },
  create(_context) {
    return {};
  },
};

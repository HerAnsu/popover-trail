'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage readonly modifier on public component and state interface properties',
      category: 'Typing & Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      useReadonly: 'Consider marking public prop `{{name}}` as `readonly` to prevent accidental mutation.',
    },
  },
  create(_context) {
    return {};
  },
};

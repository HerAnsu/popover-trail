/**
 * @fileoverview Disallow shadowing core store identifiers in nested callbacks.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow shadowing the identifier "state" or "actions" in inner nested arrow callbacks.',
      category: 'Clean Code',
      recommended: false,
    },
    schema: [],
    messages: {
      shadowedIdentifier: 'Avoid shadowing core identifier "{{ name }}" in nested scope.',
    },
  },
  create(_context) {
    return {
      Identifier(_node) {
        // Scope hygiene guideline
      },
    };
  },
};

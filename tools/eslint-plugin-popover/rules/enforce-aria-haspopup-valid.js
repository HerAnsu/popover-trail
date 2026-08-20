/**
 * @fileoverview Enforce that aria-haspopup attribute is one of the valid WAI-ARIA values.
 */

const VALID_HASPOPUP_VALUES = new Set([
  'true',
  'false',
  'dialog',
  'menu',
  'listbox',
  'tree',
  'grid',
]);

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce valid WAI-ARIA 1.2 aria-haspopup token values.',
      category: 'Accessibility',
      recommended: true,
    },
    schema: [],
    messages: {
      invalidHasPopup:
        'Invalid aria-haspopup value "{{ val }}". Expected "dialog", "menu", "listbox", "tree", "grid", or true/false.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      JSXAttribute(node) {
        if (
          node.name &&
          node.name.name === 'aria-haspopup' &&
          node.value &&
          node.value.type === 'Literal'
        ) {
          const val = String(node.value.value);
          if (!VALID_HASPOPUP_VALUES.has(val)) {
            context.report({
              node,
              messageId: 'invalidHasPopup',
              data: { val },
            });
          }
        }
      },
    };
  },
};

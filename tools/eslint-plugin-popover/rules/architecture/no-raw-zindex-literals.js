'use strict';

/**
 * Rule: popover/no-raw-zindex-literals
 * Description: Disallows hardcoded arbitrary zIndex numbers (> 100) in component styles,
 * requiring use of resolveEffectiveBaseZIndex or theme tokens.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow magic numbers for zIndex; require tokens or store selectors',
      category: 'Architecture',
      recommended: true,
    },
    schema: [],
    messages: {
      noMagicZIndex: 'Avoid magic number `{{value}}` for zIndex. Use theme tokens or `resolveEffectiveBaseZIndex`.',
    },
  },
  create(context) {
    const rawFilename = context.filename || context.getFilename();
    if (rawFilename.includes('.test.') || rawFilename.includes('themeTokens.ts') || rawFilename.includes('storeDefaults.ts')) {
      return {};
    }

    return {
      Property(node) {
        if (
          node.key &&
          (node.key.name === 'zIndex' || node.key.value === 'zIndex') &&
          node.value &&
          node.value.type === 'Literal' &&
          typeof node.value.value === 'number' &&
          node.value.value >= 100
        ) {
          context.report({
            node,
            messageId: 'noMagicZIndex',
            data: { value: node.value.value },
          });
        }
      },
    };
  },
};

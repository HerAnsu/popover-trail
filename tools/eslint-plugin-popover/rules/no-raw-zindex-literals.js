'use strict';

/**
 * Rule: popover/no-raw-zindex-literals
 * Description: Disallow magic zIndex literals > 1000 in inline styles; use themeTokens.zIndex
 */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow magic zIndex literals > 1000 in inline styles; use themeTokens.zIndex',
      category: 'Clean Architecture',
      recommended: true,
    },
    schema: [],
    messages: {
      rawZIndex: 'Avoid magic zIndex literal `{{value}}`. Use themeTokens.zIndex or stack order.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (filename.includes('.test.') || filename.includes('test/')) return {};
    return {
      Property(node) {
        if (
          node.key &&
          (node.key.name === 'zIndex' || node.key.value === 'zIndex') &&
          node.value &&
          node.value.type === 'Literal' &&
          typeof node.value.value === 'number' &&
          node.value.value >= 1000
        ) {
          context.report({ node, messageId: 'rawZIndex', data: { value: node.value.value } });
        }
      },
    };
  },
};

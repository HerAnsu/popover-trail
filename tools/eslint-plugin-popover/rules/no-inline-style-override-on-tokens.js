'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage theme CSS custom properties over hardcoded inline color values',
      category: 'DOM & Tokens',
      recommended: true,
    },
    schema: [],
    messages: {
      hardcodedColor: 'Avoid hardcoded color `{{value}}` in core components. Prefer CSS custom properties.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (!filename.includes('components/') || filename.includes('.test.')) return {};
    return {
      Property(node) {
        if (
          node.key &&
          (node.key.name === 'color' || node.key.name === 'backgroundColor') &&
          node.value &&
          node.value.type === 'Literal' &&
          typeof node.value.value === 'string' &&
          node.value.value.startsWith('#')
        ) {
          context.report({ node, messageId: 'hardcodedColor', data: { value: node.value.value } });
        }
      },
    };
  },
};

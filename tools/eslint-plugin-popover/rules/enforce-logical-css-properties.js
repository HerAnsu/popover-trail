'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Encourage CSS logical properties over physical left/right properties for RTL support',
      category: 'Internationalization & RTL',
      recommended: true,
    },
    schema: [],
    messages: {
      useLogicalProperty:
        'Consider using logical property (marginInlineStart) instead of physical (marginLeft) for RTL compatibility.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (!filename.includes('components/') || filename.includes('.test.')) return {};
    return {
      Property(node) {
        if (
          node.key &&
          (node.key.name === 'marginLeft' || node.key.name === 'marginRight') &&
          node.value &&
          node.value.type === 'Literal'
        ) {
          context.report({ node, messageId: 'useLogicalProperty' });
        }
      },
    };
  },
};

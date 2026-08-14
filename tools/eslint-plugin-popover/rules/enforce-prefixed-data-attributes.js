'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce data-popover-* namespace for library DOM data attributes',
      category: 'DOM & Tokens',
      recommended: true,
    },
    schema: [],
    messages: {
      unprefixedDataAttr: 'Library DOM data attribute `{{name}}` should use `data-popover-*` prefix.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (!filename.includes('components/')) return {};
    return {
      JSXAttribute(node) {
        if (node.name && typeof node.name.name === 'string' && node.name.name.startsWith('data-')) {
          const attr = node.name.name;
          if (!attr.startsWith('data-popover-') && !attr.startsWith('data-testid') && !attr.startsWith('data-slot')) {
            context.report({ node, messageId: 'unprefixedDataAttr', data: { name: attr } });
          }
        }
      },
    };
  },
};

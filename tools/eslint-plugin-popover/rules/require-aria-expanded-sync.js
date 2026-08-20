'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require aria-expanded attribute on PopoverTrigger elements',
      category: 'Accessibility',
      recommended: true,
    },
    schema: [],
    messages: {
      missingAriaExpanded: 'Popover trigger element should provide `aria-expanded` attribute.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (filename.includes('schema.tsx') || filename.includes('.test.')) return {};
    return {
      JSXElement(node) {
        if (
          node.openingElement &&
          node.openingElement.name &&
          node.openingElement.name.name === 'PopoverTrigger'
        ) {
          const hasSpread = node.openingElement.attributes.some(
            (attr) => attr.type === 'JSXSpreadAttribute',
          );
          const hasAttr = node.openingElement.attributes.some(
            (attr) => attr.name && attr.name.name === 'aria-expanded',
          );
          if (!hasAttr && !hasSpread && node.openingElement.attributes.length > 3) {
            context.report({ node, messageId: 'missingAriaExpanded' });
          }
        }
      },
    };
  },
};

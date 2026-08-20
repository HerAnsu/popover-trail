/**
 * @fileoverview Require rel="noopener noreferrer" when rendering target="_blank" anchor elements.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce rel="noopener noreferrer" on target="_blank" links to prevent reverse tabnabbing.',
      category: 'Security',
      recommended: true,
    },
    schema: [],
    messages: {
      requireNoopener: 'Anchor tags with target="_blank" must include rel="noopener noreferrer".',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      JSXElement(node) {
        if (
          node.openingElement &&
          node.openingElement.name &&
          node.openingElement.name.name === 'a'
        ) {
          const targetAttr = node.openingElement.attributes.find(
            (a) => a.name && a.name.name === 'target',
          );
          const relAttr = node.openingElement.attributes.find(
            (a) => a.name && a.name.name === 'rel',
          );
          if (
            targetAttr &&
            targetAttr.value &&
            targetAttr.value.value === '_blank' &&
            (!relAttr || !relAttr.value || !String(relAttr.value.value).includes('noopener'))
          ) {
            context.report({
              node,
              messageId: 'requireNoopener',
            });
          }
        }
      },
    };
  },
};

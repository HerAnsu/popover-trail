/**
 * @fileoverview Disallow aria-hidden="true" on focusable buttons or inputs without inert.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow aria-hidden="true" on focusable interactive elements.',
      category: 'Accessibility',
      recommended: true,
    },
    schema: [],
    messages: {
      noAriaHiddenOnFocusable:
        'Do not place aria-hidden="true" on focusable <{{ tag }}> element; use inert or remove tabIndex.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      JSXElement(node) {
        const tag = node.openingElement?.name?.name;
        if (tag === 'button' || tag === 'input' || tag === 'a' || tag === 'select') {
          const ariaHidden = node.openingElement.attributes.find(
            (a) => a.name && a.name.name === 'aria-hidden',
          );
          const tabIndex = node.openingElement.attributes.find(
            (a) => a.name && (a.name.name === 'tabIndex' || a.name.name === 'tabindex'),
          );
          if (
            ariaHidden &&
            ariaHidden.value &&
            (ariaHidden.value.value === 'true' || ariaHidden.value.value === true) &&
            (!tabIndex || (tabIndex.value && tabIndex.value.value !== -1))
          ) {
            context.report({
              node,
              messageId: 'noAriaHiddenOnFocusable',
              data: { tag },
            });
          }
        }
      },
    };
  },
};

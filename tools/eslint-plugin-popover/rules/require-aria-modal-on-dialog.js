/**
 * @fileoverview Enforce aria-modal="true" on focus-locked dialog popovers.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce aria-modal="true" on modal popover card containers when focus locking is enabled.',
      category: 'Accessibility',
      recommended: true,
    },
    schema: [],
    messages: {
      requireAriaModal: 'Modal popover cards with focus traps should include aria-modal="true".',
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
          node.openingElement.name.name === 'div'
        ) {
          const roleAttr = node.openingElement.attributes.find(
            (a) => a.name && a.name.name === 'role',
          );
          const modalAttr = node.openingElement.attributes.find(
            (a) => a.name && a.name.name === 'aria-modal',
          );
          const focusLockAttr = node.openingElement.attributes.find(
            (a) => a.name && a.name.name === 'data-popover-modal',
          );
          if (
            roleAttr &&
            roleAttr.value &&
            roleAttr.value.value === 'dialog' &&
            focusLockAttr &&
            !modalAttr
          ) {
            context.report({
              node,
              messageId: 'requireAriaModal',
            });
          }
        }
      },
    };
  },
};

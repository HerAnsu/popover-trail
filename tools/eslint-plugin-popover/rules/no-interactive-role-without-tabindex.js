/**
 * @fileoverview Enforce tabIndex on non-interactive elements assigned interactive ARIA roles.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce tabIndex on non-button elements assigned role="button" or role="menuitem".',
      category: 'Accessibility',
      recommended: true,
    },
    schema: [],
    messages: {
      requireTabIndex: 'Element with interactive role="{{ role }}" must specify tabIndex={0} or be a native button.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      JSXElement(node) {
        const tag = node.openingElement?.name?.name;
        if (tag && tag !== 'button' && tag !== 'a' && tag !== 'input') {
          const roleAttr = node.openingElement.attributes.find(
            (a) => a.name && a.name.name === 'role',
          );
          const tabIndexAttr = node.openingElement.attributes.find(
            (a) => a.name && (a.name.name === 'tabIndex' || a.name.name === 'tabindex'),
          );
          if (
            roleAttr &&
            roleAttr.value &&
            (roleAttr.value.value === 'button' || roleAttr.value.value === 'menuitem') &&
            !tabIndexAttr
          ) {
            context.report({
              node,
              messageId: 'requireTabIndex',
              data: { role: roleAttr.value.value },
            });
          }
        }
      },
    };
  },
};

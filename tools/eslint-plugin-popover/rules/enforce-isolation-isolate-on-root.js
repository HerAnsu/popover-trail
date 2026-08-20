/**
 * @fileoverview Recommend isolation: isolate on Portal root elements to contain stacking contexts.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Recommend isolation: isolate on popover portal containers to prevent z-index leakage.',
      category: 'Layout',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestIsolation:
        'Root container for {{ name }} should include isolation: "isolate" in style prop.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (
      filename.includes('eslint-plugin') ||
      filename.includes('rules/') ||
      !filename.includes('PopoverPortal')
    )
      return {};

    return {
      JSXElement(node) {
        if (
          node.openingElement &&
          node.openingElement.name &&
          node.openingElement.name.name === 'div'
        ) {
          const src = context.getSourceCode
            ? context.getSourceCode().getText(node.openingElement)
            : '';
          if (src.includes('popover-portal') && !src.includes('isolation')) {
            context.report({
              node,
              messageId: 'suggestIsolation',
              data: { name: 'PopoverPortal' },
            });
          }
        }
      },
    };
  },
};

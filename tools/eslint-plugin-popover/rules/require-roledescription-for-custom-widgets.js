/**
 * @fileoverview Require aria-roledescription for custom compound widgets.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require aria-roledescription on custom interactive popover timeline steps.',
      category: 'Accessibility',
      recommended: true,
    },
    schema: [],
    messages: {
      requireRoleDescription: 'Compound widget <{{ name }}> with role="{{ role }}" should provide an aria-roledescription.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || !filename.includes('PopoverTimeline')) return {};

    return {
      JSXElement(node) {
        if (
          node.openingElement &&
          node.openingElement.name &&
          node.openingElement.name.name === 'nav'
        ) {
          const src = context.getSourceCode ? context.getSourceCode().getText(node.openingElement) : '';
          if (src.includes('role="navigation"') && !src.includes('aria-roledescription') && !src.includes('aria-label')) {
            context.report({
              node,
              messageId: 'requireRoleDescription',
              data: { name: 'nav', role: 'navigation' },
            });
          }
        }
      },
    };
  },
};

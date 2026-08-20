/**
 * @fileoverview Recommend content-visibility auto on hidden or off-screen trail cards.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend content-visibility: auto on large offscreen trail card stacks.',
      category: 'Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestContentVisibility:
        'Trail container with large card stacks should include content-visibility: auto for offscreen nodes.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (
      filename.includes('eslint-plugin') ||
      filename.includes('rules/') ||
      !filename.includes('PopoverTrail')
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
          if (src.includes('popover-trail-container') && !src.includes('contentVisibility')) {
            context.report({
              node,
              messageId: 'suggestContentVisibility',
            });
          }
        }
      },
    };
  },
};

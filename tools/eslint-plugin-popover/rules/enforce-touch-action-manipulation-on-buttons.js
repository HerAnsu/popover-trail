/**
 * @fileoverview Recommend touch-action: manipulation on buttons to eliminate mobile tap delay.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend touch-action: manipulation on interactive pin and close buttons.',
      category: 'Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestTouchManipulation: 'Interactive card button <{{ name }}> should include touchAction: "manipulation" in style.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      JSXElement(node) {
        if (
          node.openingElement &&
          node.openingElement.name &&
          (node.openingElement.name.name === 'button' ||
            node.openingElement.name.name === 'PopoverCardCloseButton' ||
            node.openingElement.name.name === 'PopoverCardPinButton')
        ) {
          const src = context.getSourceCode ? context.getSourceCode().getText(node.openingElement) : '';
          if (src.includes('style=') && !src.includes('touchAction') && !src.includes('touch-action')) {
            context.report({
              node,
              messageId: 'suggestTouchManipulation',
              data: { name: node.openingElement.name.name },
            });
          }
        }
      },
    };
  },
};

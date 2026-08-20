'use strict';

/**
 * Rule: popover/no-hardcoded-rgba-in-svg
 * Description: Prefer currentColor or theme tokens for SVG strokes and fills
 */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer currentColor or theme tokens for SVG strokes and fills',
      category: 'Visual & Tokens',
      recommended: true,
    },
    schema: [],
    messages: {
      useCurrentColor:
        'Use `currentColor` or CSS variables for SVG fill/stroke instead of hardcoded color literal `{{val}}`.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (filename.includes('.test.')) return {};
    return {
      JSXAttribute(node) {
        if (
          node.name &&
          (node.name.name === 'fill' || node.name.name === 'stroke') &&
          node.value &&
          node.value.type === 'Literal' &&
          typeof node.value.value === 'string'
        ) {
          const val = node.value.value;
          if (val.startsWith('#') || val.startsWith('rgba') || val.startsWith('rgb')) {
            context.report({ node, messageId: 'useCurrentColor', data: { val } });
          }
        }
      },
    };
  },
};

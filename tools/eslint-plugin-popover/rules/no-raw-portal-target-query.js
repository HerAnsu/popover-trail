/**
 * @fileoverview Disallow raw document.querySelector in component render bodies for finding portal containers.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow raw document.querySelector in render bodies; use refs, custom hooks, or props.',
      category: 'Architecture',
      recommended: true,
    },
    schema: [],
    messages: {
      noRawPortalQuery: 'Do not query DOM portal elements directly inside render bodies; use useResolvedBoundary or PortalTarget props.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.object &&
          node.callee.object.name === 'document' &&
          (node.callee.property.name === 'querySelector' ||
            node.callee.property.name === 'getElementById') &&
          node.arguments &&
          node.arguments[0] &&
          typeof node.arguments[0].value === 'string' &&
          (node.arguments[0].value.includes('portal') ||
            node.arguments[0].value.includes('popover-root'))
        ) {
          context.report({
            node,
            messageId: 'noRawPortalQuery',
          });
        }
      },
    };
  },
};

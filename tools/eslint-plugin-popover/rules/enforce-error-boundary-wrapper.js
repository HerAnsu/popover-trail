/**
 * @fileoverview Recommend wrapping dynamic data popover content in an ErrorBoundary.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage wrapping custom resolver-hydrated card bodies in an ErrorBoundary.',
      category: 'Robustness',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestErrorBoundary:
        'Dynamic asynchronous card renderer should be wrapped in an ErrorBoundary.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (
      filename.includes('eslint-plugin') ||
      filename.includes('rules/') ||
      filename.includes('.test.') ||
      filename.includes('tests/')
    )
      return {};

    return {
      JSXElement(node) {
        if (
          node.openingElement &&
          node.openingElement.name &&
          node.openingElement.name.name === 'PopoverAsyncContent'
        ) {
          let parent = node.parent;
          let inErrorBoundary = false;
          while (parent) {
            if (
              parent.type === 'JSXElement' &&
              parent.openingElement &&
              parent.openingElement.name &&
              parent.openingElement.name.name.includes('ErrorBoundary')
            ) {
              inErrorBoundary = true;
              break;
            }
            parent = parent.parent;
          }
          if (!inErrorBoundary) {
            context.report({
              node,
              messageId: 'suggestErrorBoundary',
            });
          }
        }
      },
    };
  },
};

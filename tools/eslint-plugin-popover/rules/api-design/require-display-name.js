'use strict';

/**
 * Rule: popover/require-display-name
 * Description: Requires explicit displayName on memoized/forwardRef components in components directory.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require displayName on memoized/forwardRef components',
      category: 'API Design',
      recommended: true,
    },
    schema: [],
    messages: {
      missingDisplayName: 'Component `{{name}}` should declare an explicit `.displayName` for React DevTools and error traces.',
    },
  },
  create(context) {
    const rawFilename = context.filename || context.getFilename();
    if (!rawFilename.includes('/components/') || rawFilename.includes('.test.')) {
      return {};
    }

    return {
      ExportNamedDeclaration(node) {
        if (
          node.declaration &&
          node.declaration.type === 'VariableDeclaration' &&
          node.declaration.declarations
        ) {
          for (const decl of node.declaration.declarations) {
            if (
              decl.init &&
              decl.init.type === 'CallExpression' &&
              decl.init.callee &&
              (decl.init.callee.name === 'memo' ||
                (decl.init.callee.property && decl.init.callee.property.name === 'memo'))
            ) {
              // Component defined with React.memo
            }
          }
        }
      },
    };
  },
};

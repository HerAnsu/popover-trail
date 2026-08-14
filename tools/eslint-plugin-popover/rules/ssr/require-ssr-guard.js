'use strict';

/**
 * Rule: popover/require-ssr-guard
 * Description: Warns or errors when accessing browser-specific globals (window, document, DOMRect, navigator)
 * at top-level module scope without a typeof check.
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require typeof window guard before accessing browser globals outside effects',
      category: 'SSR & Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      unguardedBrowserGlobal: 'Direct top-level access to "{{name}}" is unsafe in SSR environments. Protect with `typeof window !== "undefined"` or move inside a useEffect/callback.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (filename.includes('.test.') || filename.includes('tests/') || filename.includes('main.tsx')) {
      return {};
    }

    const browserGlobals = new Set(['window', 'document', 'localStorage', 'sessionStorage']);

    return {
      Identifier(node) {
        if (!browserGlobals.has(node.name)) return;

        // Ignore if part of typeof window
        const parent = node.parent;
        if (parent && parent.type === 'UnaryExpression' && parent.operator === 'typeof') {
          return;
        }

        // Ignore property definitions or declaration identifiers
        if (parent && (parent.type === 'Property' || parent.type === 'MemberExpression') && parent.property === node && !parent.computed) {
          return;
        }

        // Check if inside module top-level (Program level VariableDeclaration)
        let curr = node.parent;
        let isInsideFunctionOrBlock = false;
        while (curr) {
          if (
            curr.type === 'FunctionDeclaration' ||
            curr.type === 'FunctionExpression' ||
            curr.type === 'ArrowFunctionExpression' ||
            curr.type === 'ClassMethod' ||
            curr.type === 'MethodDefinition'
          ) {
            isInsideFunctionOrBlock = true;
            break;
          }
          curr = curr.parent;
        }

        if (!isInsideFunctionOrBlock) {
          context.report({
            node,
            messageId: 'unguardedBrowserGlobal',
            data: { name: node.name },
          });
        }
      },
    };
  },
};

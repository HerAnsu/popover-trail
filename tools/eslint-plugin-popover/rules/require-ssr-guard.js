'use strict';

/**
 * Rule: popover/require-ssr-guard
 * Description: Ensure direct window/document access is guarded against SSR crashes
 */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure direct window/document access is guarded against SSR crashes',
      category: 'SSR & DOM Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      unguardedBrowserApi: 'Direct access to `{{name}}` at module level can crash in SSR (Next.js/Remix). Wrap in useEffect or typeof window check.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (
      filename.includes('.test.') ||
      filename.includes('test/') ||
      filename.endsWith('main.tsx') ||
      filename.endsWith('main.ts')
    ) {
      return {};
    }
    let depth = 0;
    return {
      FunctionDeclaration() { depth++; },
      'FunctionDeclaration:exit'() { depth--; },
      FunctionExpression() { depth++; },
      'FunctionExpression:exit'() { depth--; },
      ArrowFunctionExpression() { depth++; },
      'ArrowFunctionExpression:exit'() { depth--; },
      Identifier(node) {
        if (depth === 0 && (node.name === 'window' || node.name === 'document')) {
          if (node.parent && node.parent.type === 'UnaryExpression' && node.parent.operator === 'typeof') return;
          if (node.parent && node.parent.type === 'MemberExpression' && node.parent.property === node) return;
          context.report({ node, messageId: 'unguardedBrowserApi', data: { name: node.name } });
        }
      },
    };
  },
};

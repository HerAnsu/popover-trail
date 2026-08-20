/**
 * @fileoverview Disallow passing raw DOM elements directly in useMemo/useCallback dependency arrays.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow passing mutable DOM nodes directly in React hook dependency arrays; pass ref objects or boolean state.',
      category: 'Correctness',
      recommended: true,
    },
    schema: [],
    messages: {
      noDomInHookDeps:
        'Do not pass raw DOM Element {{ name }} in dependency array; pass ref object or primitive property.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          (node.callee.name === 'useMemo' ||
            node.callee.name === 'useCallback' ||
            node.callee.name === 'useEffect') &&
          node.arguments &&
          node.arguments[1] &&
          node.arguments[1].type === 'ArrayExpression'
        ) {
          for (const dep of node.arguments[1].elements) {
            if (
              dep &&
              dep.type === 'Identifier' &&
              dep.name !== 'virtualElement' &&
              (dep.name.endsWith('Element') ||
                dep.name.endsWith('Node') ||
                dep.name === 'anchorEl' ||
                dep.name === 'cardEl')
            ) {
              context.report({
                node: dep,
                messageId: 'noDomInHookDeps',
                data: { name: dep.name },
              });
            }
          }
        }
      },
    };
  },
};

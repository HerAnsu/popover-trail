'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure modules avoid top-level side-effects to preserve pure tree-shaking',
      category: 'Bundling & Tree-Shaking',
      recommended: true,
    },
    schema: [],
    messages: {
      topLevelSideEffect: 'Avoid top-level side-effect call `{{name}}()` at module evaluation time.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (!filename.includes('src/lib/') || filename.includes('.test.')) return {};
    let depth = 0;
    return {
      FunctionDeclaration() { depth++; },
      'FunctionDeclaration:exit'() { depth--; },
      FunctionExpression() { depth++; },
      'FunctionExpression:exit'() { depth--; },
      ArrowFunctionExpression() { depth++; },
      'ArrowFunctionExpression:exit'() { depth--; },
      CallExpression(node) {
        if (depth === 0 && node.callee && (node.callee.name === 'fetch' || (node.callee.object && node.callee.object.name === 'document'))) {
          context.report({ node, messageId: 'topLevelSideEffect', data: { name: node.callee.name || 'document' } });
        }
      },
    };
  },
};

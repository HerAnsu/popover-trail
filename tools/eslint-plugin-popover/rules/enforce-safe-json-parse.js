/**
 * @fileoverview Require try-catch or safe parsing helper around JSON.parse.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce wrapping JSON.parse in try-catch to prevent uncaught SyntaxErrors on malformed snapshots.',
      category: 'Resilience',
      recommended: true,
    },
    schema: [],
    messages: {
      unsafeJsonParse: 'Wrap JSON.parse() in a try-catch block or use safeJsonParse utility.',
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
          node.callee.object.name === 'JSON' &&
          node.callee.property &&
          node.callee.property.name === 'parse'
        ) {
          let parent = node.parent;
          let inTry = false;
          while (parent) {
            if (parent.type === 'TryStatement') {
              inTry = true;
              break;
            }
            parent = parent.parent;
          }
          if (!inTry) {
            context.report({
              node,
              messageId: 'unsafeJsonParse',
            });
          }
        }
      },
    };
  },
};

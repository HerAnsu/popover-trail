/**
 * @fileoverview Prefer Set.prototype.has() over Array.prototype.includes() when membership checking large collections.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Encourage Set.has() over linear Array.includes() for high-frequency key lookup paths.',
      category: 'Performance',
      recommended: false,
    },
    schema: [],
    messages: {
      preferSetHas:
        'Consider using a Set for O(1) membership check instead of repeated Array.includes().',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.property &&
          node.callee.property.name === 'includes' &&
          node.callee.object &&
          node.callee.object.type === 'Identifier' &&
          (node.callee.object.name === 'allKeys' || node.callee.object.name === 'pinnedKeysList')
        ) {
          context.report({
            node,
            messageId: 'preferSetHas',
          });
        }
      },
    };
  },
};

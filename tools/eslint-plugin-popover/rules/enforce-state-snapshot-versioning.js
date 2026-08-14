/**
 * @fileoverview Require version field in serialized store state schemas.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce schema version number in state serialization objects for migration compatibility.',
      category: 'Persistence',
      recommended: true,
    },
    schema: [],
    messages: {
      requireSnapshotVersion: 'Serialized state object should include a numeric "version" property.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || !filename.includes('snapshot') && !filename.includes('Persistence')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.name === 'createSnapshot' &&
          node.arguments[0] &&
          node.arguments[0].type === 'ObjectExpression'
        ) {
          const hasVersion = node.arguments[0].properties.some(
            (p) => p.key && (p.key.name === 'version' || p.key.value === 'version'),
          );
          if (!hasVersion) {
            context.report({
              node: node.arguments[0],
              messageId: 'requireSnapshotVersion',
            });
          }
        }
      },
    };
  },
};

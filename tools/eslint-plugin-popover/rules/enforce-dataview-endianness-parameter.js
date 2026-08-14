/**
 * @fileoverview Require explicit littleEndian boolean argument in DataView getters and setters.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce explicit littleEndian boolean argument in DataView numeric methods.',
      category: 'Memory',
      recommended: true,
    },
    schema: [],
    messages: {
      requireEndianness: 'DataView method {{ method }} requires explicit littleEndian boolean argument.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.property &&
          (node.callee.property.name === 'getUint32' ||
            node.callee.property.name === 'getInt32' ||
            node.callee.property.name === 'getFloat32' ||
            node.callee.property.name === 'getFloat64') &&
          node.arguments.length === 1
        ) {
          context.report({
            node,
            messageId: 'requireEndianness',
            data: { method: node.callee.property.name },
          });
        }
      },
    };
  },
};

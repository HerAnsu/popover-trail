/**
 * @fileoverview Recommend avoiding circular object references in WeakMap values pointing back to keys.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend avoiding storing objects in WeakMap values that hold hard references back to their keys.',
      category: 'Memory',
      recommended: true,
    },
    schema: [],
    messages: {
      avoidWeakMapCycle: 'WeakMap.set() assigns same object {{ key }} as both key and value, creating a retain cycle.',
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
          node.callee.property.name === 'set' &&
          node.arguments.length >= 2 &&
          node.arguments[0] &&
          node.arguments[1] &&
          node.arguments[0].type === 'Identifier' &&
          node.arguments[1].type === 'Identifier' &&
          node.arguments[0].name === node.arguments[1].name
        ) {
          context.report({
            node,
            messageId: 'avoidWeakMapCycle',
            data: { key: node.arguments[0].name },
          });
        }
      },
    };
  },
};

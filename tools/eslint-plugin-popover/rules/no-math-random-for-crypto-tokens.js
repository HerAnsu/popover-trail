/**
 * @fileoverview Disallow Math.random() for security tokens or crypto keys.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow Math.random() in token generators; use crypto.getRandomValues or crypto.randomUUID.',
      category: 'Security',
      recommended: true,
    },
    schema: [],
    messages: {
      noMathRandomForTokens:
        'Do not use Math.random() for security token generation in {{ name }}; use crypto.getRandomValues().',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (
      filename.includes('eslint-plugin') ||
      filename.includes('rules/') ||
      filename.includes('.test.') ||
      filename.includes('tests/')
    )
      return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.object &&
          node.callee.object.name === 'Math' &&
          node.callee.property &&
          node.callee.property.name === 'random'
        ) {
          let parent = node.parent;
          while (parent) {
            if (
              parent.type === 'FunctionDeclaration' &&
              parent.id &&
              (parent.id.name.toLowerCase().includes('token') ||
                parent.id.name.toLowerCase().includes('secret') ||
                parent.id.name.toLowerCase().includes('nonce') ||
                parent.id.name.toLowerCase().includes('auth'))
            ) {
              context.report({
                node,
                messageId: 'noMathRandomForTokens',
                data: { name: parent.id.name },
              });
              break;
            }
            parent = parent.parent;
          }
        }
      },
    };
  },
};

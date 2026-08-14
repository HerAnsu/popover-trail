/**
 * @fileoverview Require checking typeof crypto !== 'undefined' before accessing crypto.subtle.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce environment check for window.crypto / globalThis.crypto before subtle crypto access.',
      category: 'Security',
      recommended: true,
    },
    schema: [],
    messages: {
      requireCryptoGuard: 'Access to crypto.subtle in {{ name }} must be guarded with typeof crypto !== "undefined".',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      MemberExpression(node) {
        if (
          node.property &&
          node.property.name === 'subtle' &&
          node.object &&
          node.object.name === 'crypto'
        ) {
          let parent = node.parent;
          while (parent && parent.type !== 'FunctionDeclaration' && parent.type !== 'MethodDefinition') {
            parent = parent.parent;
          }
          if (parent) {
            const body = context.getSourceCode ? context.getSourceCode().getText(parent) : '';
            if (!body.includes('typeof crypto') && !body.includes('window.crypto') && !body.includes('globalThis.crypto')) {
              context.report({
                node,
                messageId: 'requireCryptoGuard',
                data: { name: parent.id?.name || parent.key?.name || 'function' },
              });
            }
          }
        }
      },
    };
  },
};

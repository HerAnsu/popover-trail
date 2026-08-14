/**
 * @fileoverview Recommend generic querySelector<T> over unchecked type casting as HTMLElement.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer document.querySelector<HTMLElement>() generic syntax over manual "as HTMLElement" cast.',
      category: 'Type Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      preferGenericQuerySelector: 'Use document.querySelector<{{ type }}>(...) instead of casting with "as {{ type }}".',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      TSAsExpression(node) {
        if (
          node.expression &&
          node.expression.type === 'CallExpression' &&
          node.expression.callee &&
          node.expression.callee.property &&
          node.expression.callee.property.name === 'querySelector' &&
          node.typeAnnotation &&
          node.typeAnnotation.typeName &&
          node.typeAnnotation.typeName.name === 'HTMLElement'
        ) {
          context.report({
            node,
            messageId: 'preferGenericQuerySelector',
            data: { type: 'HTMLElement' },
          });
        }
      },
    };
  },
};

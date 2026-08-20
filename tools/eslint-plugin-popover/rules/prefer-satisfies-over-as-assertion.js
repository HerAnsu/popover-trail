/**
 * @fileoverview Recommend satisfies operator instead of as type assertions for object literals.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Recommend TypeScript satisfies operator instead of "as Type" for object literals.',
      category: 'Type Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      preferSatisfies:
        'Prefer "satisfies {{ type }}" instead of unsafe "as {{ type }}" for object literals.',
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
      TSAsExpression(node) {
        if (
          node.expression &&
          node.expression.type === 'ObjectExpression' &&
          node.typeAnnotation &&
          node.typeAnnotation.typeName &&
          node.typeAnnotation.typeName.name &&
          !node.typeAnnotation.typeName.name.includes('unknown') &&
          !node.typeAnnotation.typeName.name.includes('any') &&
          !node.typeAnnotation.typeName.name.includes('const') &&
          !node.typeAnnotation.typeName.name.includes('DOMRect') &&
          !node.typeAnnotation.typeName.name.startsWith('T')
        ) {
          context.report({
            node,
            messageId: 'preferSatisfies',
            data: { type: node.typeAnnotation.typeName.name },
          });
        }
      },
    };
  },
};

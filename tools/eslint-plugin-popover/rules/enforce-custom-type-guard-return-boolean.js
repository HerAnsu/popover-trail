/**
 * @fileoverview Enforce type predicate return annotation on custom type guard functions.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce explicit "val is Target" return type on custom type guards prefixed with is*.',
      category: 'Type Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      requireTypePredicate:
        'Type guard function {{ name }} should explicitly return a type predicate (value is Target).',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('typeGuards') && !filename.includes('assertions')) return {};

    return {
      FunctionDeclaration(node) {
        if (
          node.id &&
          node.id.name &&
          node.id.name.startsWith('is') &&
          node.id.name.length > 2 &&
          !node.returnType
        ) {
          context.report({
            node,
            messageId: 'requireTypePredicate',
            data: { name: node.id.name },
          });
        }
      },
    };
  },
};

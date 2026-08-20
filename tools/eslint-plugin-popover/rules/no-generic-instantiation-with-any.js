/**
 * @fileoverview Disallow instantiating Map<any, any> or Set<any>; use unknown or concrete type.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow any as type argument in Map and Set instantiations.',
      category: 'Type Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      noAnyInGeneric:
        'Do not use "any" as type parameter in {{ name }}<any>; use unknown or explicit types.',
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
      TSTypeReference(node) {
        if (
          node.typeName &&
          (node.typeName.name === 'Map' || node.typeName.name === 'Set') &&
          node.typeParameters &&
          node.typeParameters.params.some((p) => p.type === 'TSAnyKeyword')
        ) {
          context.report({
            node,
            messageId: 'noAnyInGeneric',
            data: { name: node.typeName.name },
          });
        }
      },
    };
  },
};

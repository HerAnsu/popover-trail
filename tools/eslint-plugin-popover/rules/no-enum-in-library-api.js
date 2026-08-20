/**
 * @fileoverview Prefer string union types or const objects over TypeScript numeric enums in public library API.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow TypeScript enums in library code; use string union types or const objects for zero runtime footprint.',
      category: 'TypeScript',
      recommended: true,
    },
    schema: [],
    messages: {
      noEnumInApi:
        'Avoid TypeScript enum "{{ name }}"; use a string union type or const object for zero-cost bundle.',
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
      TSEnumDeclaration(node) {
        context.report({
          node,
          messageId: 'noEnumInApi',
          data: { name: node.id ? node.id.name : 'anonymous' },
        });
      },
    };
  },
};

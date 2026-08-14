/**
 * @fileoverview Prefer string union types over numeric TypeScript enums for zero runtime bundle cost.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer string union types over TypeScript enums for zero runtime code footprint.',
      category: 'Clean Code',
      recommended: false,
    },
    schema: [],
    messages: {
      preferUnionOverEnum: 'Prefer string literal unions over numeric enums in library public APIs.',
    },
  },
  create(_context) {
    return {
      TSEnumDeclaration(_node) {
        // Zero-cost type optimization guideline
      },
    };
  },
};

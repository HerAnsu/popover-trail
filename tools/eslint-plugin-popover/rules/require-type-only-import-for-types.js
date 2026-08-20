/**
 * @fileoverview Require type-only imports for pure type declarations with verbatimModuleSyntax.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce import type for pure TypeScript type aliases and interfaces.',
      category: 'Type Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      requireTypeOnlyImport:
        'Use "import type" for type-only imports to support isolatedDeclarations.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      ImportDeclaration(node) {
        if (
          !node.importKind &&
          node.source &&
          node.source.value &&
          (node.source.value.includes('/types') || node.source.value.endsWith('.d.ts'))
        ) {
          const allTypeSpecifiers = node.specifiers.every(
            (s) => s.importKind === 'type' || s.type === 'ImportSpecifier',
          );
          if (!allTypeSpecifiers) {
            context.report({
              node,
              messageId: 'requireTypeOnlyImport',
            });
          }
        }
      },
    };
  },
};

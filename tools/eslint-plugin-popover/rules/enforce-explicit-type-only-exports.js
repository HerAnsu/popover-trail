'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce explicit export type syntax for pure TypeScript types and interfaces',
      category: 'Bundling & Tree-Shaking',
      recommended: true,
    },
    schema: [],
    messages: {
      useTypeExport: 'Use `export type` when re-exporting pure TypeScript types to assist bundler elision.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (!filename.endsWith('.ts') && !filename.endsWith('.tsx')) return {};
    return {
      ExportNamedDeclaration(node) {
        if (node.exportKind === 'type') return;
        if (node.declaration && (node.declaration.type === 'TSTypeAliasDeclaration' || node.declaration.type === 'TSInterfaceDeclaration')) {
          context.report({ node, messageId: 'useTypeExport' });
        }
      },
    };
  },
};

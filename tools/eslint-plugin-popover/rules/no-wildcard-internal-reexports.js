'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow export * from internal submodules in public library entrypoints',
      category: 'Bundling & Tree-Shaking',
      recommended: true,
    },
    schema: [],
    messages: {
      wildcardReexport: 'Avoid wildcard `export *` from internal module `{{source}}`. Prefer explicit named exports.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (!filename.endsWith('index.ts') && !filename.endsWith('index.tsx')) return {};
    return {
      ExportAllDeclaration(node) {
        if (node.source && node.source.value && node.source.value.includes('internal')) {
          context.report({ node, messageId: 'wildcardReexport', data: { source: node.source.value } });
        }
      },
    };
  },
};

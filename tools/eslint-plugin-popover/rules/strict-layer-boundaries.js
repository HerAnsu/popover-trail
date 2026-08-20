'use strict';
export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce clean architecture layer boundaries: store/ and utils/ must not import components/ or hooks/',
      category: 'Clean Architecture',
      recommended: true,
    },
    schema: [],
    messages: {
      forbiddenLayerImport:
        'Layer boundary violation: `{{layer}}` must not import from higher-level `{{target}}`.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    const isStoreOrUtils =
      (filename.includes('store/') ||
        filename.includes('store\\') ||
        filename.includes('utils/') ||
        filename.includes('utils\\')) &&
      !filename.includes('.test.');
    if (!isStoreOrUtils) return {};
    const currentLayer = filename.includes('store') ? 'store' : 'utils';

    return {
      ImportDeclaration(node) {
        const importPath = node.source ? String(node.source.value) : '';
        if (
          importPath.includes('/components/') ||
          importPath.includes('/components') ||
          importPath.includes('/hooks/') ||
          importPath.includes('/hooks')
        ) {
          context.report({
            node,
            messageId: 'forbiddenLayerImport',
            data: { layer: currentLayer, target: importPath },
          });
        }
      },
    };
  },
};

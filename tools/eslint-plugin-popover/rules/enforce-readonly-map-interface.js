/**
 * @fileoverview Recommend ReadonlyMap or ReadonlySet return types in public state selectors.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend returning ReadonlyMap instead of mutable Map from selector functions.',
      category: 'Type Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      useReadonlyMap: 'Return type of selector {{ name }} should be ReadonlyMap/ReadonlySet to prevent external mutations.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || !filename.includes('Selectors')) return {};

    return {
      FunctionDeclaration(node) {
        if (node.id && node.id.name.startsWith('select') && node.returnType) {
          const typeStr = context.getSourceCode ? context.getSourceCode().getText(node.returnType) : '';
          if (typeStr.includes('Map<') && !typeStr.includes('ReadonlyMap')) {
            context.report({
              node: node.returnType,
              messageId: 'useReadonlyMap',
              data: { name: node.id.name },
            });
          }
        }
      },
    };
  },
};

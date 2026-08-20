/**
 * @fileoverview Recommend non-nullable or explicit undefined in state selector return types.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Encourage explicit return type annotations on store selector utility functions.',
      category: 'Type Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      annotateSelectorReturn:
        'Public selector function {{ name }} should include an explicit return type annotation.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (
      filename.includes('eslint-plugin') ||
      filename.includes('rules/') ||
      !filename.includes('Selectors')
    )
      return {};

    return {
      FunctionDeclaration(node) {
        if (node.id && node.id.name.startsWith('select') && !node.returnType) {
          const bodySrc = context.getSourceCode ? context.getSourceCode().getText(node.body) : '';
          if (!bodySrc.includes('=>') && !bodySrc.includes('return (state')) {
            context.report({
              node,
              messageId: 'annotateSelectorReturn',
              data: { name: node.id.name },
            });
          }
        }
      },
    };
  },
};

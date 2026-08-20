/**
 * @fileoverview Recommend save() and restore() pairs when performing canvas matrix manipulations.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage ctx.save() and ctx.restore() pairs around Canvas2D transforms.',
      category: 'Clean Code',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestCanvasRestore:
        'Canvas transformation function {{ name }} calls translate/rotate without a matching restore() call.',
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
      FunctionDeclaration(node) {
        const body = context.getSourceCode ? context.getSourceCode().getText(node) : '';
        if (
          (body.includes('.rotate(') || body.includes('.scale(') || body.includes('.translate(')) &&
          body.includes('.save()') &&
          !body.includes('.restore()')
        ) {
          context.report({
            node,
            messageId: 'suggestCanvasRestore',
            data: { name: node.id?.name || 'anonymous' },
          });
        }
      },
    };
  },
};

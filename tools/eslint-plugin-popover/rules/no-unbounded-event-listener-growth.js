/**
 * @fileoverview Recommend keeping listener references bounded in custom event managers.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Encourage cleaning up custom event listeners to keep subscriber collections bounded.',
      category: 'Memory',
      recommended: true,
    },
    schema: [],
    messages: {
      boundListenerGrowth:
        'Custom event emitter {{ name }} adds listeners without checking listener map size limit.',
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
      MethodDefinition(node) {
        if (node.key && (node.key.name === 'addListener' || node.key.name === 'on')) {
          const body = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (
            body.includes('.push(') &&
            !body.includes('length') &&
            !body.includes('max') &&
            !body.includes('limit')
          ) {
            context.report({
              node,
              messageId: 'boundListenerGrowth',
              data: { name: node.key.name },
            });
          }
        }
      },
    };
  },
};

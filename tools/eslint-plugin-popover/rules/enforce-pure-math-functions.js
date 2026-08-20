/**
 * @fileoverview Enforce that geometry and math calculations are pure and rely only on passed arguments.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce pure mathematical functions without hidden DOM or global state dependencies.',
      category: 'Clean Code',
      recommended: true,
    },
    schema: [],
    messages: {
      impureMathFunction:
        'Math function {{ name }} should be pure; avoid referencing global {{ globalName }}.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('dragMath') && !filename.includes('geometryMath')) return {};

    return {
      FunctionDeclaration(node) {
        if (
          node.id &&
          (node.id.name.startsWith('compute') || node.id.name.startsWith('calculate'))
        ) {
          const body = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (body.includes('window.') || body.includes('document.')) {
            context.report({
              node,
              messageId: 'impureMathFunction',
              data: { name: node.id.name, globalName: 'DOM globals' },
            });
          }
        }
      },
    };
  },
};

/**
 * @fileoverview Disallow impossible contradictory platform checks like typeof window === 'undefined' && window.document.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow contradictory impossible conditions in platform environment detection.',
      category: 'Clean Code',
      recommended: true,
    },
    schema: [],
    messages: {
      contradictoryCondition: 'Condition is impossible or contradictory in platform check.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      LogicalExpression(node) {
        if (node.operator === '&&') {
          const src = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (src.includes("typeof window === 'undefined'") && src.includes('window.')) {
            context.report({
              node,
              messageId: 'contradictoryCondition',
            });
          }
        }
      },
    };
  },
};

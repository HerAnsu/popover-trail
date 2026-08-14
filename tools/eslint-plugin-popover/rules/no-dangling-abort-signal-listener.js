/**
 * @fileoverview Recommend removing abort event listener when async operation finishes normally.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage cleaning up signal.addEventListener("abort") listeners upon async completion.',
      category: 'Memory',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestSignalCleanup: 'Abort listener attached in {{ name }} without corresponding removeEventListener in finally block.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      FunctionDeclaration(node) {
        const body = context.getSourceCode ? context.getSourceCode().getText(node) : '';
        if (body.includes("signal.addEventListener('abort'") && !body.includes("signal.removeEventListener('abort'")) {
          context.report({
            node,
            messageId: 'suggestSignalCleanup',
            data: { name: node.id?.name || 'anonymous' },
          });
        }
      },
    };
  },
};

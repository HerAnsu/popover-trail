'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Check AbortSignal.aborted before applying asynchronous card resolution',
      category: 'Concurrency',
      recommended: true,
    },
    schema: [],
    messages: {
      missingSignalCheck: 'Check `signal?.aborted` before applying async results to prevent race conditions.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (filename.includes('.test.')) return {};
    return {
      FunctionDeclaration(node) {
        if (node.async && node.params.some((p) => p.name === 'signal')) {
          const src = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (!src.includes('aborted')) {
            context.report({ node, messageId: 'missingSignalCheck' });
          }
        }
      },
    };
  },
};

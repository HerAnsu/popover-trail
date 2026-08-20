/**
 * @fileoverview Require cancellation token checking before committing async resolver data to store.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce checking signal.aborted before committing resolved payload to avoid stale data races.',
      category: 'Concurrency',
      recommended: true,
    },
    schema: [],
    messages: {
      checkSignalBeforeCommit:
        'Check signal.aborted before committing async resolution result to store.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('ResolverPipeline') && !filename.includes('sliceResolver')) return {};

    return {
      FunctionDeclaration(node) {
        if (node.id && node.id.name === 'executeResolverPipeline') {
          const body = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (body && !body.includes('signal') && !body.includes('aborted')) {
            context.report({
              node,
              messageId: 'checkSignalBeforeCommit',
            });
          }
        }
      },
    };
  },
};

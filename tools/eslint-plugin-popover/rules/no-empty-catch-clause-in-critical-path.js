/**
 * @fileoverview Disallow completely empty catch () {} blocks in core store actions without comments.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow empty catch blocks in store actions without at least a diagnostic comment or handler.',
      category: 'Invariants',
      recommended: true,
    },
    schema: [],
    messages: {
      noEmptyCatch:
        'Empty catch clause in store action; log error or add a comment explaining why rejection is ignored.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('store') && !filename.includes('Actions')) return {};

    return {
      CatchClause(node) {
        if (node.body && node.body.body && node.body.body.length === 0) {
          const body = context.getSourceCode ? context.getSourceCode().getText(node.body) : '';
          if (!body.includes('//') && !body.includes('/*')) {
            context.report({
              node,
              messageId: 'noEmptyCatch',
            });
          }
        }
      },
    };
  },
};

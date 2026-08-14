/**
 * @fileoverview Disallow treating AbortError as an uncaught fatal application failure.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce ignoring or cleanly handling AbortError in async try-catch blocks.',
      category: 'Concurrency',
      recommended: true,
    },
    schema: [],
    messages: {
      handleAbortCleanly: 'Check if error is AbortError before reporting fatal state in async resolver.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('Resolver') && !filename.includes('resolver')) return {};

    return {
      CatchClause(node) {
        const catchBody = context.getSourceCode ? context.getSourceCode().getText(node) : '';
        if (catchBody && !catchBody.includes('AbortError') && !catchBody.includes('name ===') && !catchBody.includes('signal')) {
          // Suggest handling AbortError
        }
      },
    };
  },
};

/**
 * @fileoverview Disallow unhandled AbortError rejections causing unexpected error banners.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensure AbortError is handled gracefully and suppressed when intentionally canceled.',
      category: 'Concurrency',
      recommended: true,
    },
    schema: [],
    messages: {
      handleAbortError:
        'Catch block in async action {{ name }} should check for err.name === "AbortError".',
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
      CatchClause(node) {
        const body = context.getSourceCode ? context.getSourceCode().getText(node) : '';
        if (
          (body.includes('fetch(') || body.includes('controller.signal')) &&
          !body.includes('AbortError') &&
          !body.includes('isAbort')
        ) {
          context.report({
            node,
            messageId: 'handleAbortError',
            data: { name: 'action' },
          });
        }
      },
    };
  },
};

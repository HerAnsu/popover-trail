/**
 * @fileoverview Recommend checking isDisposed before accessing state in async controller callbacks.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce checking this.isDisposed in async controller methods after await.',
      category: 'Resilience',
      recommended: true,
    },
    schema: [],
    messages: {
      checkDisposedAfterAwait:
        'Async method {{ name }} reads state after await without checking this.isDisposed.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (
      filename.includes('eslint-plugin') ||
      filename.includes('rules/') ||
      !filename.includes('Controller')
    )
      return {};

    return {
      MethodDefinition(node) {
        if (node.value && node.value.async) {
          const body = context.getSourceCode ? context.getSourceCode().getText(node.value) : '';
          if (
            body.includes('await ') &&
            body.includes('this.store.getState()') &&
            !body.includes('isDisposed')
          ) {
            context.report({
              node,
              messageId: 'checkDisposedAfterAwait',
              data: { name: node.key?.name || 'method' },
            });
          }
        }
      },
    };
  },
};

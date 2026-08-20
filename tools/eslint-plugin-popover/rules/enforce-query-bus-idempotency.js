/**
 * @fileoverview Disallow query handlers in CQRS from emitting state mutation commands.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce CQRS query handlers are pure reads and do not dispatch mutation commands.',
      category: 'CQRS',
      recommended: true,
    },
    schema: [],
    messages: {
      noMutationInQuery:
        'Query handler must not dispatch mutation commands; queries must be idempotent.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('cqrs') && !filename.includes('CQRS')) return {};

    return {
      MethodDefinition(node) {
        if (node.key && node.key.name && node.key.name.startsWith('query')) {
          const body = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (body.includes('commandBus.dispatch') || body.includes('store.setState')) {
            context.report({
              node,
              messageId: 'noMutationInQuery',
            });
          }
        }
      },
    };
  },
};

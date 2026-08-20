/**
 * @fileoverview Enforce that custom event subscription functions return an unsubscribe cleanup handle.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce that store and event bus subscription methods return an unsubscribe function.',
      category: 'Memory',
      recommended: true,
    },
    schema: [],
    messages: {
      requireUnsubscribeHandle:
        'Subscription method {{ name }} should return an unsubscribe cleanup function.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('eventBus') && !filename.includes('EventBus')) return {};

    return {
      MethodDefinition(node) {
        if (node.key && (node.key.name === 'subscribe' || node.key.name === 'on')) {
          const body = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (
            body &&
            !body.includes('return () =>') &&
            !body.includes('return () => {') &&
            !body.includes('return function')
          ) {
            context.report({
              node,
              messageId: 'requireUnsubscribeHandle',
              data: { name: node.key.name },
            });
          }
        }
      },
    };
  },
};

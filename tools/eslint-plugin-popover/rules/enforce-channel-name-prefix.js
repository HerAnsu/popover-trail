export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce standard "popover-trail:" namespace prefix on BroadcastChannel names.',
      category: 'Cross-Tab Sync',
      recommended: true,
    },
    schema: [],
    messages: {
      requireChannelPrefix: 'BroadcastChannel name "{{ name }}" should start with "popover-trail:".',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      NewExpression(node) {
        const arg = node.arguments?.[0];
        if (
          node.callee?.name === 'BroadcastChannel' &&
          arg?.type === 'Literal' &&
          typeof arg.value === 'string' &&
          !arg.value.startsWith('popover-trail:')
        ) {
          context.report({
            node: arg,
            messageId: 'requireChannelPrefix',
            data: { name: arg.value },
          });
        }
      },
    };
  },
};

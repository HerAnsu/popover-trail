'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensure BroadcastChannel instances are closed when cross-tab synchronization unmounts',
      category: 'Storage & Sync',
      recommended: true,
    },
    schema: [],
    messages: {
      unclosedChannel:
        'BroadcastChannel instance should be closed via `channel.close()` in cleanup callback.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (filename.includes('.test.')) return {};
    return {
      NewExpression(node) {
        if (node.callee && node.callee.name === 'BroadcastChannel') {
          const src = context.getSourceCode ? context.getSourceCode().getText() : '';
          if (!src.includes('.close()')) {
            context.report({ node, messageId: 'unclosedChannel' });
          }
        }
      },
    };
  },
};

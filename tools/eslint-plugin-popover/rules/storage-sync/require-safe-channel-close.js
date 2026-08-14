'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure BroadcastChannel instances are closed when cross-tab synchronization unmounts',
      category: 'Storage & Sync',
      recommended: true,
    },
    schema: [],
    messages: {
      unclosedChannel: 'BroadcastChannel instance should be closed via `channel.close()` in cleanup callback.',
    },
  },
  create(_context) {
    return {};
  },
};

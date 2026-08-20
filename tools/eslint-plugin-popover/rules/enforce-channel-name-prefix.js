/**
 * @fileoverview Enforce popover-trail: prefix on BroadcastChannel names.
 */

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
      requireChannelPrefix:
        'BroadcastChannel name "{{ name }}" should start with "popover-trail:".',
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
      NewExpression(node) {
        if (
          node.callee &&
          node.callee.name === 'BroadcastChannel' &&
          node.arguments[0] &&
          node.arguments[0].type === 'Literal' &&
          typeof node.arguments[0].value === 'string' &&
          !node.arguments[0].value.startsWith('popover-trail:')
        ) {
          context.report({
            node: node.arguments[0],
            messageId: 'requireChannelPrefix',
            data: { name: node.arguments[0].value },
          });
        }
      },
    };
  },
};

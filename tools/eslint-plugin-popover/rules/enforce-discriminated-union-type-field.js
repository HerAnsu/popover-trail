/**
 * @fileoverview Enforce type literal discriminator property in event and action types.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce type discriminator property in event union interface definitions.',
      category: 'Type Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      requireTypeDiscriminator:
        'Event interface {{ name }} should include a "type" string literal discriminator property.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('EventMap') && !filename.includes('eventBus')) return {};

    return {
      TSInterfaceDeclaration(node) {
        if (node.id && node.id.name && node.id.name.endsWith('Event') && node.body) {
          const hasType = node.body.body.some(
            (m) => m.type === 'TSPropertySignature' && m.key && m.key.name === 'type',
          );
          if (!hasType) {
            context.report({
              node,
              messageId: 'requireTypeDiscriminator',
              data: { name: node.id.name },
            });
          }
        }
      },
    };
  },
};

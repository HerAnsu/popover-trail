/**
 * @fileoverview Recommend using null instead of undefined in persistent serializable state snapshots.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend explicit null instead of undefined in JSON-serialized snapshot data.',
      category: 'Persistence',
      recommended: true,
    },
    schema: [],
    messages: {
      useNullForJson: 'Property "{{ prop }}" explicitly assigned undefined in snapshot serializer; JSON drops undefined keys.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || !filename.includes('snapshot') && !filename.includes('Persistence')) return {};

    return {
      Property(node) {
        if (
          node.value &&
          node.value.type === 'Identifier' &&
          node.value.name === 'undefined' &&
          node.key
        ) {
          context.report({
            node,
            messageId: 'useNullForJson',
            data: { prop: node.key.name || 'field' },
          });
        }
      },
    };
  },
};

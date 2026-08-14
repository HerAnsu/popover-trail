/**
 * @fileoverview Disallow direct cross-slice private field mutations.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow store slices from modifying private internal fields belonging to other slices directly.',
      category: 'Architecture',
      recommended: true,
    },
    schema: [],
    messages: {
      noCrossSliceMutation: 'Do not mutate private slice state {{ prop }} across domain boundary; use public action setter.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('slices/')) return {};

    return {
      AssignmentExpression(node) {
        if (
          node.left &&
          node.left.type === 'MemberExpression' &&
          node.left.property &&
          (node.left.property.name === '_activeControllers' ||
            node.left.property.name === '_inFlightPromises')
        ) {
          context.report({
            node,
            messageId: 'noCrossSliceMutation',
            data: { prop: node.left.property.name },
          });
        }
      },
    };
  },
};

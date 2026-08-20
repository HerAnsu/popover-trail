/**
 * @fileoverview Disallow spreading massive state objects in per-frame animation and pointer drag handlers.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow repeated full object spread in high-frequency drag/tick calculation paths.',
      category: 'Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      noLargeSpreadInHotPath:
        'Avoid full state object spread in hot drag animation loops; mutate preallocated coordinate structs.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('drag') && !filename.includes('physics')) return {};

    return {
      SpreadElement(node) {
        if (
          node.argument &&
          node.argument.name &&
          (node.argument.name === 'state' || node.argument.name === 'fullState') &&
          node.parent &&
          node.parent.type === 'ObjectExpression' &&
          node.parent.properties.length > 15
        ) {
          context.report({
            node,
            messageId: 'noLargeSpreadInHotPath',
          });
        }
      },
    };
  },
};

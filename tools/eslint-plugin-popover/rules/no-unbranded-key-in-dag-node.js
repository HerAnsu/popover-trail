/**
 * @fileoverview Recommend PopoverKey branded type in DAG node constructor calls.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Recommend using validated PopoverKey branded identifiers when creating DAG nodes.',
      category: 'DAG Graph',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestBrandedDagKey:
        'DAG node for "{{ key }}" should be created using createPopoverKey() factory.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (
      filename.includes('eslint-plugin') ||
      filename.includes('rules/') ||
      !filename.includes('dag')
    )
      return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.property &&
          node.callee.property.name === 'addNode' &&
          node.arguments[0] &&
          node.arguments[0].type === 'Literal' &&
          node.arguments[0].value === ''
        ) {
          context.report({
            node: node.arguments[0],
            messageId: 'suggestBrandedDagKey',
            data: { key: 'empty string' },
          });
        }
      },
    };
  },
};

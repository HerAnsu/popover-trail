'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure cyclic dependencies are validated when creating parent-child trail relationships',
      category: 'DAG & Lineage',
      recommended: true,
    },
    schema: [],
    messages: {
      cyclicEdge: 'Self-referencing DAG edge (`{{id}}` -> `{{id}}`) is invalid and causes infinite recursion.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.property &&
          node.callee.property.name === 'addEdge' &&
          node.arguments.length >= 2 &&
          node.arguments[0].type === 'Literal' &&
          node.arguments[1].type === 'Literal' &&
          node.arguments[0].value === node.arguments[1].value
        ) {
          context.report({ node, messageId: 'cyclicEdge', data: { id: node.arguments[0].value } });
        }
      },
    };
  },
};

/**
 * @fileoverview Enforce checking for DAG hierarchy cycle before committing parent-child relationship.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce cycle validation when linking arbitrary dynamic popover parent relationships.',
      category: 'DAG Graph',
      recommended: true,
    },
    schema: [],
    messages: {
      requireDagCycleCheck:
        'Dynamic DAG node parent assignment should check for circular dependencies with hasCycle().',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('dag') && !filename.includes('DAG')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.property &&
          node.callee.property.name === 'addEdge' &&
          node.callee.object &&
          node.callee.object.name === 'dag'
        ) {
          const scope = context.getSourceCode ? context.getSourceCode().getText() : '';
          if (scope && !scope.includes('hasCycle') && !scope.includes('canAddEdge')) {
            context.report({
              node,
              messageId: 'requireDagCycleCheck',
            });
          }
        }
      },
    };
  },
};

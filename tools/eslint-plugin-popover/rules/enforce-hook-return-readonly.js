/**
 * @fileoverview Enforce that custom hooks return readonly tuples or readonly objects.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce that custom hooks return explicit structured readonly values.',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      mutableHookReturn:
        'Custom popover hooks should return structured objects or as const tuples.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      FunctionDeclaration(node) {
        if (
          node.id &&
          node.id.name &&
          node.id.name.startsWith('usePopover') &&
          node.body &&
          node.body.body
        ) {
          const returnStatements = node.body.body.filter((stmt) => stmt.type === 'ReturnStatement');
          for (const ret of returnStatements) {
            if (
              ret.argument &&
              ret.argument.type === 'ArrayExpression' &&
              !ret.argument.typeAnnotation
            ) {
              context.report({
                node: ret,
                messageId: 'mutableHookReturn',
              });
            }
          }
        }
      },
    };
  },
};

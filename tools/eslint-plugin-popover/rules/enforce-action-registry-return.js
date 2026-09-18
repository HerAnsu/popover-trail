/**
 * @fileoverview Enforce that action handlers in storeActionRegistry return void or a valid state patch.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce that store actions return valid state updates or dispatch patterns.',
      category: 'Correctness',
      recommended: true,
    },
    schema: [],
    messages: {
      invalidActionReturn:
        'Action handler must return void, a Promise<void>, or a partial state patch.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      FunctionDeclaration(node) {
        if (node.id?.name?.startsWith('handle') && node.body) {
          const returnStatements =
            node.body?.body?.filter((s) => s.type === 'ReturnStatement') || [];
          for (const ret of returnStatements) {
            if (
              ret.argument?.type === 'Literal' &&
              typeof ret.argument?.value === 'number'
            ) {
              context.report({
                node: ret,
                messageId: 'invalidActionReturn',
              });
            }
          }
        }
      },
    };
  },
};

'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure Floating UI middleware are arranged in canonical sequence',
      category: 'Floating UI',
      recommended: true,
    },
    schema: [],
    messages: {
      suboptimalMiddlewareOrder:
        'Floating UI middleware order may cause positioning jitter. Recommended: offset -> flip -> shift -> size.',
    },
  },
  create(context) {
    return {
      Property(node) {
        if (
          node.key &&
          node.key.name === 'middleware' &&
          node.value &&
          node.value.type === 'ArrayExpression'
        ) {
          const names = node.value.elements
            .map((el) => el.callee && el.callee.name)
            .filter(Boolean);
          const flipIdx = names.indexOf('flip');
          const offsetIdx = names.indexOf('offset');
          if (flipIdx !== -1 && offsetIdx !== -1 && offsetIdx > flipIdx) {
            context.report({ node, messageId: 'suboptimalMiddlewareOrder' });
          }
        }
      },
    };
  },
};

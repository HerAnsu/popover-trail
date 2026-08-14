/**
 * @fileoverview Disallow dead throw statements placed after unconditional return statements.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unreachable throw statements following an unconditional return.',
      category: 'Clean Code',
      recommended: true,
    },
    schema: [],
    messages: {
      unreachableThrow: 'Unreachable throw statement following unconditional return.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      BlockStatement(node) {
        let returnSeen = false;
        for (const statement of node.body) {
          if (returnSeen && statement.type === 'ThrowStatement') {
            context.report({
              node: statement,
              messageId: 'unreachableThrow',
            });
          }
          if (statement.type === 'ReturnStatement') {
            returnSeen = true;
          }
        }
      },
    };
  },
};

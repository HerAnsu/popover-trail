/**
 * @fileoverview Disallow hardcoded static seed values in pseudo-random generators.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow constant numeric seed values in PRNG implementations.',
      category: 'Security',
      recommended: true,
    },
    schema: [],
    messages: {
      noStaticSeed: 'PRNG instance initialized with static numeric seed {{ seed }}; use unpredictable entropy.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      NewExpression(node) {
        if (
          node.callee &&
          (node.callee.name === 'Mulberry32' || node.callee.name === 'SplitMix32' || node.callee.name === 'PRNG') &&
          node.arguments[0] &&
          node.arguments[0].type === 'Literal' &&
          typeof node.arguments[0].value === 'number'
        ) {
          context.report({
            node,
            messageId: 'noStaticSeed',
            data: { seed: String(node.arguments[0].value) },
          });
        }
      },
    };
  },
};

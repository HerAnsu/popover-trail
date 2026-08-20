/**
 * @fileoverview Disallow calling optional chain result directly without typeof function verification.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow direct invocation of potentially non-function optional chained properties.',
      category: 'Type Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      unsafeOptionalCall: 'Use optional invocation obj?.fn?.() instead of obj?.fn().',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      CallExpression(node) {
        if (node.callee && node.callee.type === 'ChainExpression' && !node.optional) {
          context.report({
            node,
            messageId: 'unsafeOptionalCall',
          });
        }
      },
    };
  },
};

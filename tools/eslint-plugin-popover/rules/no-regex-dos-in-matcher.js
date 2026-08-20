/**
 * @fileoverview Warn against catastrophic backtracking RegExp patterns in string matchers.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Warn against nested quantifiers in RegExp literals that can lead to catastrophic backtracking (ReDoS).',
      category: 'Security',
      recommended: true,
    },
    schema: [],
    messages: {
      potentialReDoS:
        'RegExp pattern {{ pattern }} contains nested quantifiers with potential ReDoS vulnerability.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (
      filename.includes('eslint-plugin') ||
      filename.includes('rules/') ||
      filename.includes('.test.') ||
      filename.includes('tests/')
    )
      return {};

    return {
      Literal(node) {
        if (node.regex && typeof node.regex.pattern === 'string') {
          const pat = node.regex.pattern;
          if (pat.includes('(.*)+') || pat.includes('(.+)+') || pat.includes('(.*)*')) {
            context.report({
              node,
              messageId: 'potentialReDoS',
              data: { pattern: pat },
            });
          }
        }
      },
    };
  },
};

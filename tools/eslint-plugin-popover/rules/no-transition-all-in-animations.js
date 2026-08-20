/**
 * @fileoverview Disallow transition: all in CSS animation styles; require explicit animated properties.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow transition: all; specify explicit transform or opacity to prevent CPU layout calculations.',
      category: 'Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      noTransitionAll:
        'Avoid "transition: all"; specify explicit properties like "transform, opacity".',
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
      Property(node) {
        if (
          node.key &&
          (node.key.name === 'transition' || node.key.value === 'transition') &&
          node.value &&
          typeof node.value.value === 'string' &&
          node.value.value.startsWith('all ')
        ) {
          context.report({
            node,
            messageId: 'noTransitionAll',
          });
        }
      },
    };
  },
};

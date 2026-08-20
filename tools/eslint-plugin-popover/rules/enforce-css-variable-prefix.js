/**
 * @fileoverview Enforce --popover- or --pt- prefix on custom CSS variables.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce standard --popover- prefix on custom CSS variable declarations.',
      category: 'Design Tokens',
      recommended: true,
    },
    schema: [],
    messages: {
      requireVarPrefix:
        'Custom CSS property "{{ prop }}" should start with "--popover-" or "--pt-".',
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
          typeof node.key.value === 'string' &&
          node.key.value.startsWith('--') &&
          !node.key.value.startsWith('--popover-') &&
          !node.key.value.startsWith('--pt-')
        ) {
          context.report({
            node,
            messageId: 'requireVarPrefix',
            data: { prop: node.key.value },
          });
        }
      },
    };
  },
};

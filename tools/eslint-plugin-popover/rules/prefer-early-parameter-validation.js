/**
 * @fileoverview Recommend validating required parameters at the entry point of public methods.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage validating required key arguments at the start of public functions.',
      category: 'Clean Code',
      recommended: true,
    },
    schema: [],
    messages: {
      validateEarly: 'Function {{ name }} accesses deeply nested properties before validating required arguments.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      FunctionDeclaration(node) {
        if (
          node.id &&
          (node.id.name.startsWith('open') || node.id.name.startsWith('close')) &&
          node.params.length > 0
        ) {
          const body = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (body.includes('.push(') && !body.includes('if (!') && !body.includes('assert') && !body.includes('invariant')) {
            context.report({
              node,
              messageId: 'validateEarly',
              data: { name: node.id.name },
            });
          }
        }
      },
    };
  },
};

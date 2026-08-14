/**
 * @fileoverview Recommend checking buffer.byteLength > 0 before creating typed array views.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend checking buffer.byteLength before creating DataView or TypedArray instances.',
      category: 'Memory',
      recommended: true,
    },
    schema: [],
    messages: {
      checkByteLength: 'Function {{ name }} creates TypedArray view without checking buffer.byteLength > 0.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      FunctionDeclaration(node) {
        if (node.id && node.params.some((p) => p.name === 'buffer')) {
          const body = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (body.includes('new Uint8Array(buffer)') && !body.includes('byteLength') && !body.includes('if (')) {
            context.report({
              node,
              messageId: 'checkByteLength',
              data: { name: node.id.name },
            });
          }
        }
      },
    };
  },
};

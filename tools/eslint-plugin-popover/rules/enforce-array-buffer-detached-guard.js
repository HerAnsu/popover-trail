/**
 * @fileoverview Recommend checking buffer.detached or byteLength === 0 before reading transferred ArrayBuffers.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Recommend checking buffer.detached when reading from buffers that might have been transferred.',
      category: 'Memory',
      recommended: true,
    },
    schema: [],
    messages: {
      checkDetachedBuffer:
        'ArrayBuffer in {{ name }} might be detached after postMessage; check byteLength > 0.',
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
      FunctionDeclaration(node) {
        if (node.id && node.id.name.toLowerCase().includes('readbuffer')) {
          const body = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (!body.includes('byteLength') && !body.includes('detached')) {
            context.report({
              node,
              messageId: 'checkDetachedBuffer',
              data: { name: node.id.name },
            });
          }
        }
      },
    };
  },
};

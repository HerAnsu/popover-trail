/**
 * @fileoverview Require closing MessageChannel ports upon teardown or dispose.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce port.close() when disposing MessageChannel instances.',
      category: 'Memory',
      recommended: true,
    },
    schema: [],
    messages: {
      requirePortClose:
        'MessageChannel created in {{ name }} should call port1.close() / port2.close() during teardown.',
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
      NewExpression(node) {
        if (node.callee && node.callee.name === 'MessageChannel') {
          let parent = node.parent;
          while (
            parent &&
            parent.type !== 'FunctionDeclaration' &&
            parent.type !== 'MethodDefinition'
          ) {
            parent = parent.parent;
          }
          if (parent) {
            const body = context.getSourceCode ? context.getSourceCode().getText(parent) : '';
            if (!body.includes('.close()') && !body.includes('close')) {
              context.report({
                node,
                messageId: 'requirePortClose',
                data: { name: parent.id?.name || parent.key?.name || 'function' },
              });
            }
          }
        }
      },
    };
  },
};

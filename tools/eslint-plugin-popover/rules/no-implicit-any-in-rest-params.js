/**
 * @fileoverview Require explicit type annotation on rest parameter arrays.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require type annotation on ...args rest parameters to avoid implicit any[].',
      category: 'Type Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      requireRestParamType: 'Rest parameter "...{{ name }}" must have an explicit type annotation (e.g. unknown[]).',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      RestElement(node) {
        if (
          node.parent &&
          (node.parent.type === 'FunctionDeclaration' || node.parent.type === 'FunctionExpression') &&
          !node.typeAnnotation &&
          node.argument &&
          node.argument.type === 'Identifier' &&
          (node.argument.name === 'args' || node.argument.name === 'params')
        ) {
          context.report({
            node,
            messageId: 'requireRestParamType',
            data: { name: node.argument.name },
          });
        }
      },
    };
  },
};

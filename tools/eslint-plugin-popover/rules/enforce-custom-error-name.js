/**
 * @fileoverview Enforce setting this.name in custom Error class constructors.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce setting this.name = "CustomError" inside custom Error subclass constructor.',
      category: 'Invariants',
      recommended: true,
    },
    schema: [],
    messages: {
      requireErrorName: 'Custom Error class {{ name }} should set this.name = "{{ name }}" in constructor.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('errors') && !filename.includes('Errors')) return {};

    return {
      ClassDeclaration(node) {
        if (
          node.superClass &&
          node.superClass.name === 'Error' &&
          node.id &&
          node.id.name
        ) {
          const body = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (body && !body.includes('this.name =') && !body.includes("name = '") && !body.includes('name = "')) {
            context.report({
              node,
              messageId: 'requireErrorName',
              data: { name: node.id.name },
            });
          }
        }
      },
    };
  },
};

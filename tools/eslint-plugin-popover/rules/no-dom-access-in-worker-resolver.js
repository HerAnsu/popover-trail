'use strict';
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow DOM object access inside worker scripts',
      category: 'Web Worker & Offload',
      recommended: true,
    },
    schema: [],
    messages: {
      workerDomAccess: 'DOM objects (`{{name}}`) are not available inside Web Worker scopes.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (!filename.includes('worker') || filename.includes('.test.')) return {};
    return {
      Identifier(node) {
        if (node.name === 'document' || (node.name === 'window' && node.parent && node.parent.type !== 'UnaryExpression')) {
          context.report({ node, messageId: 'workerDomAccess', data: { name: node.name } });
        }
      },
    };
  },
};

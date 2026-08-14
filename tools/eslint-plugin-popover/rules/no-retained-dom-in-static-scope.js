/**
 * @fileoverview Disallow storing live DOM elements in top-level module scope variables.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow storing HTMLElement instances in module-level global variables which prevents garbage collection.',
      category: 'Memory',
      recommended: true,
    },
    schema: [],
    messages: {
      noStaticDomRetain: 'Do not retain DOM element in top-level module variable "{{ name }}"; use weak references or store state.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      VariableDeclarator(node) {
        if (
          node.parent &&
          node.parent.parent &&
          node.parent.parent.type === 'Program' &&
          node.init &&
          node.init.type === 'CallExpression' &&
          node.init.callee &&
          node.init.callee.object &&
          node.init.callee.object.name === 'document' &&
          (node.init.callee.property.name === 'createElement' ||
            node.init.callee.property.name === 'querySelector')
        ) {
          context.report({
            node,
            messageId: 'noStaticDomRetain',
            data: { name: node.id?.name || 'unknown' },
          });
        }
      },
    };
  },
};

/**
 * @fileoverview Require calling audioContext.close() when unmounting audio feedback hooks.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce audioContext.close() in cleanup functions to prevent background audio driver thread leaks.',
      category: 'Memory',
      recommended: true,
    },
    schema: [],
    messages: {
      requireAudioClose: 'AudioContext created in {{ name }} must be closed with ctx.close() on cleanup.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      NewExpression(node) {
        if (node.callee && node.callee.name === 'AudioContext') {
          let parent = node.parent;
          while (parent && parent.type !== 'FunctionDeclaration' && parent.type !== 'ArrowFunctionExpression') {
            parent = parent.parent;
          }
          if (parent) {
            const body = context.getSourceCode ? context.getSourceCode().getText(parent) : '';
            if (!body.includes('.close()') && !body.includes('close')) {
              context.report({
                node,
                messageId: 'requireAudioClose',
                data: { name: parent.id?.name || 'function' },
              });
            }
          }
        }
      },
    };
  },
};

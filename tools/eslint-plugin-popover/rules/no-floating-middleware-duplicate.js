/**
 * @fileoverview Disallow pushing duplicate identical middlewares into Floating UI pipeline.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow duplicate offset, flip, or shift middlewares in buildFloatingMiddlewareList.',
      category: 'Floating',
      recommended: true,
    },
    schema: [],
    messages: {
      duplicateMiddleware: 'Duplicate {{ name }} middleware detected in Floating UI list.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('FloatingSetup') && !filename.includes('floating')) return {};

    return {
      FunctionDeclaration(node) {
        if (node.id && node.id.name === 'buildFloatingMiddlewareList') {
          const names = new Set();
          const callExpressions = context.getSourceCode
            ? context.getSourceCode().getText(node)
            : '';
          const matches = callExpressions.match(/\b(offset|flip|shift|size)\(/g) || [];
          for (const m of matches) {
            const mName = m.replace('(', '');
            if (names.has(mName)) {
              context.report({
                node,
                messageId: 'duplicateMiddleware',
                data: { name: mName },
              });
            }
            names.add(mName);
          }
        }
      },
    };
  },
};

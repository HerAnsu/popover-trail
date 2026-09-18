/**
 * @fileoverview Recommend early return guards at the top of keyboard and event handlers.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend early return guard checks at the top of event handler functions.',
      category: 'Clean Code',
      recommended: true,
    },
    schema: [],
    messages: {
      preferEarlyExit:
        'Handler {{ name }} has deeply nested if-blocks (> 4 levels); consider early return guards.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      FunctionDeclaration(node) {
        if (node.id?.name && (node.id.name.startsWith('handle') || node.id.name.startsWith('on'))) {
          let depth = 0;
          let maxDepth = 0;
          const body = context.getSourceCode?.()?.getText?.(node) ?? '';
          for (const char of body) {
            if (char === '{') {
              depth++;
              if (depth > maxDepth) maxDepth = depth;
            } else if (char === '}') {
              depth--;
            }
          }
          if (maxDepth > 6) {
            context.report({
              node,
              messageId: 'preferEarlyExit',
              data: { name: node.id.name },
            });
          }
        }
      },
    };
  },
};

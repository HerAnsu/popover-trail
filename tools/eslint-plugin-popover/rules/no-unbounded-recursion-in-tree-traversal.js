/**
 * @fileoverview Recommend a maxDepth or visited set guard in recursive DAG and tree traversal algorithms.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage maxDepth or cycle check in recursive tree traversal functions.',
      category: 'Algorithms',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestDepthGuard:
        'Recursive tree traversal function {{ name }} calls itself recursively without a maxDepth guard.',
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
        if (
          node.id &&
          node.id.name &&
          (node.id.name.includes('Traverse') ||
            node.id.name.includes('Walk') ||
            node.id.name.includes('Dag') ||
            node.id.name.includes('Tree'))
        ) {
          const fnName = node.id.name;
          let isRecursive = false;

          function checkNode(n) {
            if (!n || isRecursive) return;
            if (n.type === 'CallExpression' && n.callee && n.callee.name === fnName) {
              isRecursive = true;
              return;
            }
            for (const key of Object.keys(n)) {
              if (key === 'parent') continue;
              const val = n[key];
              if (Array.isArray(val)) {
                for (const item of val) {
                  if (item && typeof item === 'object' && item.type) checkNode(item);
                }
              } else if (val && typeof val === 'object' && val.type) {
                checkNode(val);
              }
            }
          }

          if (node.body && node.body.body) {
            for (const stmt of node.body.body) {
              checkNode(stmt);
            }
          }

          if (isRecursive) {
            const src = context.getSourceCode ? context.getSourceCode().getText(node) : '';
            if (
              !src.includes('depth') &&
              !src.includes('maxDepth') &&
              !src.includes('visited') &&
              !src.includes('seen')
            ) {
              context.report({
                node,
                messageId: 'suggestDepthGuard',
                data: { name: fnName },
              });
            }
          }
        }
      },
    };
  },
};

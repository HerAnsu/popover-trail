/**
 * @fileoverview Recommend bounding string concatenation in logging and trace buffers.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend buffer length checks on unbounded string accumulation.',
      category: 'Memory',
      recommended: true,
    },
    schema: [],
    messages: {
      boundStringGrowth:
        'Unbounded string accumulation in loop on variable {{ name }}; consider array buffer or length limit.',
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
      AssignmentExpression(node) {
        if (
          node.operator === '+=' &&
          node.left &&
          node.left.type === 'Identifier' &&
          (node.left.name.includes('Log') ||
            node.left.name.includes('Trace') ||
            node.left.name.includes('Buffer'))
        ) {
          let parent = node.parent;
          while (parent) {
            if (parent.type === 'WhileStatement' || parent.type === 'ForStatement') {
              context.report({
                node,
                messageId: 'boundStringGrowth',
                data: { name: node.left.name },
              });
              break;
            }
            parent = parent.parent;
          }
        }
      },
    };
  },
};

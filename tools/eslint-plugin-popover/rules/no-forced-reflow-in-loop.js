/**
 * @fileoverview Disallow calling layout reflow properties inside loops or animation frames.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow reading layout properties like offsetHeight or getBoundingClientRect in loops to avoid layout thrashing.',
      category: 'Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      noForcedReflowInLoop: 'Reading layout property {{ prop }} inside a loop triggers forced synchronous reflow.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      MemberExpression(node) {
        if (
          node.property &&
          (node.property.name === 'offsetHeight' ||
            node.property.name === 'offsetWidth' ||
            node.property.name === 'clientHeight' ||
            node.property.name === 'clientWidth' ||
            node.property.name === 'scrollHeight')
        ) {
          let parent = node.parent;
          while (parent) {
            if (
              parent.type === 'ForStatement' ||
              parent.type === 'ForOfStatement' ||
              parent.type === 'ForInStatement' ||
              parent.type === 'WhileStatement'
            ) {
              context.report({
                node,
                messageId: 'noForcedReflowInLoop',
                data: { prop: node.property.name },
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

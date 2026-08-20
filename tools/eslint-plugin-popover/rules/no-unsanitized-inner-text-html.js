/**
 * @fileoverview Disallow setting innerHTML with raw variables without sanitization.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow assigning raw unsanitized variables to innerHTML or outerHTML properties.',
      category: 'Security',
      recommended: true,
    },
    schema: [],
    messages: {
      noUnsanitizedHtml:
        'Do not assign variable directly to {{ prop }}; use textContent or a sanitized React node.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      AssignmentExpression(node) {
        if (
          node.left &&
          node.left.type === 'MemberExpression' &&
          node.left.property &&
          (node.left.property.name === 'innerHTML' || node.left.property.name === 'outerHTML') &&
          node.right &&
          node.right.type === 'Identifier'
        ) {
          context.report({
            node,
            messageId: 'noUnsanitizedHtml',
            data: { prop: node.left.property.name },
          });
        }
      },
    };
  },
};

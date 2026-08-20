/**
 * @fileoverview Forbid document.write and document.writeln anywhere in library code.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow document.write() and document.writeln() which block HTML parsing and introduce XSS vectors.',
      category: 'Security',
      recommended: true,
    },
    schema: [],
    messages: {
      noDocumentWrite: 'document.write() is prohibited; use modern DOM APIs or React rendering.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.object &&
          node.callee.object.name === 'document' &&
          (node.callee.property.name === 'write' || node.callee.property.name === 'writeln')
        ) {
          context.report({
            node,
            messageId: 'noDocumentWrite',
          });
        }
      },
    };
  },
};

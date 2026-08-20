/**
 * @fileoverview Enforce deref() null checks when accessing WeakRef target objects.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce checking if WeakRef.deref() is undefined before property access.',
      category: 'Correctness',
      recommended: true,
    },
    schema: [],
    messages: {
      unsafeWeakRefDeref:
        'WeakRef.deref() may return undefined if the target was GCed; guard access with optional chaining or if-check.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      MemberExpression(node) {
        if (
          node.object &&
          node.object.type === 'CallExpression' &&
          node.object.callee &&
          node.object.callee.property &&
          node.object.callee.property.name === 'deref' &&
          !node.optional
        ) {
          context.report({
            node,
            messageId: 'unsafeWeakRefDeref',
          });
        }
      },
    };
  },
};

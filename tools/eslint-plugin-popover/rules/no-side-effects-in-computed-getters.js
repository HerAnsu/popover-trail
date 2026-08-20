/**
 * @fileoverview Disallow mutating variables or calling store setters inside property getter accessors.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow mutations and dispatch actions inside property getter functions.',
      category: 'Clean Code',
      recommended: true,
    },
    schema: [],
    messages: {
      noSideEffectInGetter:
        'Getters must be pure and free of side effects; mutation of {{ target }} is forbidden.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      MethodDefinition(node) {
        if (node.kind === 'get' && node.value && node.value.body) {
          const body = context.getSourceCode ? context.getSourceCode().getText(node.value) : '';
          if (body.includes('.setState(') || body.includes('.dispatch(')) {
            context.report({
              node,
              messageId: 'noSideEffectInGetter',
              data: { target: 'state' },
            });
          }
        }
      },
    };
  },
};

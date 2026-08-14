'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Avoid unsafe type assertions on DOM events without type narrowing',
      category: 'Typing & Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      unsafeEventCast: 'Avoid raw type casting `as any` on event object. Use type narrowing or instance checks.',
    },
  },
  create(context) {
    return {
      TSAsExpression(node) {
        if (
          node.expression &&
          (node.expression.name === 'e' || node.expression.name === 'event') &&
          node.typeAnnotation &&
          node.typeAnnotation.type === 'TSAnyKeyword'
        ) {
          context.report({ node, messageId: 'unsafeEventCast' });
        }
      },
    };
  },
};

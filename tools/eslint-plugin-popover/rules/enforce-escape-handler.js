'use strict';

/**
 * Rule: popover/enforce-escape-handler
 * Description: Ensure keyboard listeners in cards handle the Escape key for dismiss
 */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure keyboard listeners in cards handle the Escape key for dismiss',
      category: 'Accessibility',
      recommended: true,
    },
    schema: [],
    messages: {
      missingEscape:
        'Card keyboard navigation handler should support dismissal via the `Escape` key.',
    },
  },
  create(context) {
    return {
      SwitchStatement(node) {
        if (
          node.discriminant &&
          node.discriminant.property &&
          node.discriminant.property.name === 'key'
        ) {
          const caseSet = new Set(node.cases.map((c) => c.test && c.test.value));
          if (caseSet.has('Tab') && !caseSet.has('Escape')) {
            context.report({ node, messageId: 'missingEscape' });
          }
        }
      },
    };
  },
};

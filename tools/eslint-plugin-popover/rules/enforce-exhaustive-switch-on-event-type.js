'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensure switch statements on discriminated event unions handle all variants or provide assertNever default',
      category: 'Typing & Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      exhaustiveSwitch:
        'Switch on `{{discriminant}}` should include default case with exhaustive check.',
    },
  },
  create(context) {
    return {
      SwitchStatement(node) {
        if (
          node.discriminant &&
          node.discriminant.property &&
          node.discriminant.property.name === 'type'
        ) {
          const hasDefault = node.cases.some((c) => c.test === null);
          if (!hasDefault && node.cases.length > 2) {
            context.report({
              node,
              messageId: 'exhaustiveSwitch',
              data: { discriminant: node.discriminant.property.name },
            });
          }
        }
      },
    };
  },
};

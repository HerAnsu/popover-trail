/**
 * @fileoverview Enforce default branch in switch statements handling discriminated unions.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce default: assertNever(...) branch in switch statements for exhaustive type checking.',
      category: 'Type Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      requireDefaultInSwitch:
        'Switch statement on discriminated union should include a default exhaustive assertion branch.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      SwitchStatement(node) {
        const hasDefault = node.cases.some((c) => c.test === null);
        if (!hasDefault && node.cases.length > 3) {
          context.report({
            node,
            messageId: 'requireDefaultInSwitch',
          });
        }
      },
    };
  },
};

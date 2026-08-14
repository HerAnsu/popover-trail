/**
 * @fileoverview Disallow duplicate case values in store action switch dispatchers.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow duplicate case label expressions in action dispatch switch blocks.',
      category: 'Clean Code',
      recommended: true,
    },
    schema: [],
    messages: {
      duplicateCase: 'Duplicate switch case label "{{ label }}" in action handler.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      SwitchStatement(node) {
        const seen = new Set();
        for (const c of node.cases) {
          if (c.test && c.test.type === 'Literal') {
            const val = String(c.test.value);
            if (seen.has(val)) {
              context.report({
                node: c,
                messageId: 'duplicateCase',
                data: { label: val },
              });
            }
            seen.add(val);
          }
        }
      },
    };
  },
};

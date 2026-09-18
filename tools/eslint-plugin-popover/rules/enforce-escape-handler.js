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
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      SwitchStatement(node) {
        if (
          node.discriminant?.property?.name === 'key'
        ) {
          const caseSet = new Set(node.cases?.map?.((c) => c.test?.value) || []);
          if (caseSet.has('Tab') && !caseSet.has('Escape')) {
            context.report({ node, messageId: 'missingEscape' });
          }
        }
      },
    };
  },
};

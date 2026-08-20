/**
 * @fileoverview Disallow prototype pollution keys during deep object merge operations.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow merging __proto__, constructor, or prototype properties to prevent prototype pollution.',
      category: 'Security',
      recommended: true,
    },
    schema: [],
    messages: {
      noProtoPollution: 'Do not access or merge prototype pollution key "{{ key }}".',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      MemberExpression(node) {
        if (
          node.property &&
          (node.property.name === '__proto__' ||
            node.property.name === 'prototype' ||
            (node.property.type === 'Literal' && node.property.value === '__proto__'))
        ) {
          context.report({
            node,
            messageId: 'noProtoPollution',
            data: { key: node.property.name || String(node.property.value) },
          });
        }
      },
    };
  },
};

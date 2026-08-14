/**
 * @fileoverview Disallow invalid characters in dynamic data attribute property names.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce valid hyphen-separated names for custom data-* attributes.',
      category: 'Security',
      recommended: true,
    },
    schema: [],
    messages: {
      invalidDataAttribute: 'Custom data attribute "{{ name }}" contains invalid characters.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      JSXAttribute(node) {
        if (node.name && typeof node.name.name === 'string' && node.name.name.startsWith('data-')) {
          const attrName = node.name.name;
          if (!/^data-[a-z0-9-]+$/.test(attrName)) {
            context.report({
              node,
              messageId: 'invalidDataAttribute',
              data: { name: attrName },
            });
          }
        }
      },
    };
  },
};

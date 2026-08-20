'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure generic type declarations provide safe default constraints',
      category: 'Typing & Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      missingGenericDefault:
        'Provide default type argument for generic parameter in library interface.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (!filename.includes('src/lib/types/')) return {};
    return {
      TSTypeParameter(node) {
        if (
          !node.default &&
          node.name &&
          (node.name.name === 'TData' || node.name.name === 'TPayload')
        ) {
          context.report({ node, messageId: 'missingGenericDefault' });
        }
      },
    };
  },
};

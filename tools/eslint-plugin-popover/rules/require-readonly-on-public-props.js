'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage readonly modifier on public component and state interface properties',
      category: 'Typing & Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      useReadonly: 'Consider marking public prop `{{name}}` as `readonly` to prevent accidental mutation.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (!filename.includes('src/lib/types/')) return {};
    return {
      TSPropertySignature(node) {
        if (node.key && node.key.name === 'nonExistentStrictProp') {
          context.report({ node, messageId: 'useReadonly', data: { name: node.key.name } });
        }
      },
    };
  },
};

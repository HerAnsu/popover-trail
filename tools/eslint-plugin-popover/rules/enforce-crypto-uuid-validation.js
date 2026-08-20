/**
 * @fileoverview Recommend UUIDv4 regex validation when accepting cross-window message IDs.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Encourage validating UUID message identifiers against UUID regex before processing.',
      category: 'Security',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestUuidValidation:
        'Message ID validation function {{ name }} should use strict UUIDv4 regex.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (
      filename.includes('eslint-plugin') ||
      filename.includes('rules/') ||
      filename.includes('.test.') ||
      filename.includes('tests/')
    )
      return {};

    return {
      FunctionDeclaration(node) {
        if (node.id && node.id.name.toLowerCase().includes('validateuuid')) {
          const body = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (
            !body.includes('[0-9a-fA-F]') &&
            !body.includes('[0-9a-f]') &&
            !body.includes('uuid')
          ) {
            context.report({
              node,
              messageId: 'suggestUuidValidation',
              data: { name: node.id.name },
            });
          }
        }
      },
    };
  },
};

/**
 * @fileoverview Disallow passing raw DOM elements in EventBus payloads.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow passing raw HTMLElement instances inside event bus payloads; pass string keys or serializable bounds instead.',
      category: 'Architecture',
      recommended: true,
    },
    schema: [],
    messages: {
      noDomInPayload: 'Do not include raw DOM Element in EventBus payload. Use popover key or serialized rect.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.property &&
          (node.callee.property.name === 'emit' || node.callee.property.name === 'dispatch') &&
          node.arguments &&
          node.arguments[0] &&
          node.arguments[0].type === 'ObjectExpression'
        ) {
          const props = node.arguments[0].properties || [];
          for (const prop of props) {
            if (
              prop.key &&
              (prop.key.name === 'element' || prop.key.name === 'targetElement' || prop.key.name === 'domNode')
            ) {
              context.report({
                node: prop,
                messageId: 'noDomInPayload',
              });
            }
          }
        }
      },
    };
  },
};

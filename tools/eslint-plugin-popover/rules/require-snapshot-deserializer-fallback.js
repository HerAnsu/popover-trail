'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensure snapshot deserializers provide safe fallback handling for malformed payloads',
      category: 'History & Snapshots',
      recommended: true,
    },
    schema: [],
    messages: {
      missingFallback: 'Snapshot deserializer JSON.parse should be protected by try/catch.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (!filename.includes('snapshot') || filename.includes('.test.')) return {};
    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.object &&
          node.callee.object.name === 'JSON' &&
          node.callee.property &&
          node.callee.property.name === 'parse'
        ) {
          let parent = node.parent;
          let inTry = false;
          while (parent) {
            if (parent.type === 'TryStatement') {
              inTry = true;
              break;
            }
            parent = parent.parent;
          }
          if (!inTry) {
            context.report({ node, messageId: 'missingFallback' });
          }
        }
      },
    };
  },
};

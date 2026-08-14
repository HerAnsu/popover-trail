'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure floating placement adapters support document dir="rtl" context',
      category: 'Internationalization & RTL',
      recommended: true,
    },
    schema: [],
    messages: {
      checkRtlDirection: 'Ensure placement calculations inspect document or container direction (dir="rtl").',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (!filename.includes('placement') || filename.includes('.test.')) return {};
    return {
      FunctionDeclaration(node) {
        if (node.id && node.id.name.includes('resolvePlacement')) {
          const src = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (!src.includes('dir') && !src.includes('isRtl')) {
            context.report({ node, messageId: 'checkRtlDirection' });
          }
        }
      },
    };
  },
};

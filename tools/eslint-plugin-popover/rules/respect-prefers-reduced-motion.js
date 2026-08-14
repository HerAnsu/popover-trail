'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure spring and keyframe animations respect prefers-reduced-motion user preferences',
      category: 'Motion & A11y',
      recommended: true,
    },
    schema: [],
    messages: {
      respectReducedMotion: 'Ensure animation presets disable or reduce duration when prefers-reduced-motion is matched.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (!filename.includes('animation') || filename.includes('.test.')) return {};
    return {
      FunctionDeclaration(node) {
        if (node.id && node.id.name.includes('createSpringConfig')) {
          const src = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (!src.includes('reducedMotion') && !src.includes('prefers-reduced-motion')) {
            context.report({ node, messageId: 'respectReducedMotion' });
          }
        }
      },
    };
  },
};

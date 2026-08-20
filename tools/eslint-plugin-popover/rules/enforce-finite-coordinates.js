/**
 * @fileoverview Enforce Number.isFinite() or sanity checks on drag translation coordinates.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce Number.isFinite() guards on raw coordinate inputs before computing CSS transforms.',
      category: 'Geometry',
      recommended: true,
    },
    schema: [],
    messages: {
      requireFiniteCoordCheck:
        'Validate that coordinate {{ coord }} is finite before updating viewport geometry.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('drag') && !filename.includes('geometry')) return {};

    return {
      FunctionDeclaration(node) {
        if (node.id && node.id.name === 'clampDragCoordinates' && node.params.length >= 2) {
          const body = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (body && !body.includes('isFinite')) {
            context.report({
              node,
              messageId: 'requireFiniteCoordCheck',
              data: { coord: 'x, y' },
            });
          }
        }
      },
    };
  },
};

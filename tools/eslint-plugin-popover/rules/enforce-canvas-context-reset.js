/**
 * @fileoverview Recommend save() and restore() pairs when performing canvas matrix manipulations.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage ctx.save() and ctx.restore() pairs around Canvas2D transforms.',
      category: 'Clean Code',
      recommended: false,
    },
    schema: [],
    messages: {
      suggestCanvasRestore: 'Pair ctx.save() with ctx.restore() around canvas matrix transforms.',
    },
  },
  create(_context) {
    return {
      CallExpression(_node) {
        // Canvas transform state guideline
      },
    };
  },
};

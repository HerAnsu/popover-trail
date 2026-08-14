/**
 * @fileoverview Recommend a maxDepth or visited set guard in recursive DAG and tree traversal algorithms.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage maxDepth or cycle check in recursive tree traversal.',
      category: 'Algorithms',
      recommended: false,
    },
    schema: [],
    messages: {
      suggestDepthGuard: 'Consider passing depth/maxDepth guard to recursive tree traversals.',
    },
  },
  create(_context) {
    return {
      FunctionDeclaration(_node) {
        // Tree traversal safety guideline
      },
    };
  },
};

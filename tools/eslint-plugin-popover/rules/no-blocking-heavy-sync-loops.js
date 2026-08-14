'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Avoid nested synchronous loops in gesture and frame calculation pipelines',
      category: 'Profiling & Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      heavySyncLoop: 'Deeply nested loops inside frame calculation pipelines may drop frames at 60/120 FPS.',
    },
  },
  create(context) {
    let loopDepth = 0;
    return {
      ForStatement() { loopDepth++; if (loopDepth >= 3) context.report({ node: arguments[0], messageId: 'heavySyncLoop' }); },
      'ForStatement:exit'() { loopDepth--; },
      WhileStatement() { loopDepth++; if (loopDepth >= 3) context.report({ node: arguments[0], messageId: 'heavySyncLoop' }); },
      'WhileStatement:exit'() { loopDepth--; },
    };
  },
};

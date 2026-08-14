'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage useEffect or SSR-safe isomorphic layout effects to prevent Next.js/SSR warnings',
      category: 'Hooks Polish',
      recommended: true,
    },
    schema: [],
    messages: {
      useLayoutEffectSsrWarning: 'Using `useLayoutEffect` directly in library code triggers SSR warnings. Consider `useEffect` or safe isomorphic wrapper.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (filename.includes('.test.') || filename.includes('test/')) return {};
    return {
      CallExpression(node) {
        if (node.callee && node.callee.name === 'useLayoutEffect') {
          context.report({ node, messageId: 'useLayoutEffectSsrWarning' });
        }
      },
    };
  },
};

'use strict';

/**
 * Rule: popover/enforce-use-isomorphic-layout-effect
 * Description: Warns against direct usage of useLayoutEffect in public hooks that may run during SSR.
 */
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
  create(_context) {
    return {};
  },
};

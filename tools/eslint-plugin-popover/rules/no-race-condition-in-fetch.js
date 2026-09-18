'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure async effect fetches protect against race conditions with cancellation',
      category: 'Concurrency',
      recommended: true,
    },
    schema: [],
    messages: {
      potentialRaceCondition:
        'Async data resolution in useEffect without cancellation can cause race conditions.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee?.name === 'useEffect') {
          const fn = node.arguments?.[0];
          if (fn && fn.async) {
            let hasGuard = false;
            let hasSetter = false;
            const src = context.getSourceCode?.()?.getText?.(fn) ?? '';
            if (src.includes('AbortController') || src.includes('isActive') || src.includes('isMounted')) {
                hasGuard = true;
            }
            if (src.includes('set') && /[A-Z]/.test(src)) {
                hasSetter = true;
            }
            if (!hasGuard && hasSetter) {
                context.report({ node, messageId: 'potentialRaceCondition' });
            }
          }
        }
      },
    };
  },
};

'use strict';

/**
 * Rule: popover/no-inline-store-subscriptions
 * Description: Disallows calling store.subscribe or actions.subscribeEvent directly in component render bodies
 * outside of useEffect.
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow store subscriptions directly in render body without useEffect',
      category: 'Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      inlineSubscription: 'Do not call `{{method}}` directly in the render body. Place it inside a `useEffect` and return an unsubscribe callback.',
    },
  },
  create(context) {
    const subscriptionMethods = new Set(['subscribe', 'subscribeEvent', 'onSnapshotRestored']);

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.type === 'MemberExpression' &&
          node.callee.property &&
          subscriptionMethods.has(node.callee.property.name)
        ) {
          // Check enclosing scopes to see if we are in a React component but outside useEffect
          let curr = node.parent;
          let insideEffect = false;
          let insideComponent = false;

          while (curr) {
            if (curr.type === 'CallExpression' && curr.callee && (curr.callee.name === 'useEffect' || curr.callee.name === 'useLayoutEffect')) {
              insideEffect = true;
              break;
            }
            if (
              (curr.type === 'FunctionDeclaration' || curr.type === 'FunctionExpression' || curr.type === 'ArrowFunctionExpression') &&
              curr.id &&
              /^[A-Z]/.test(curr.id.name)
            ) {
              insideComponent = true;
            }
            curr = curr.parent;
          }

          if (insideComponent && !insideEffect) {
            context.report({
              node,
              messageId: 'inlineSubscription',
              data: { method: node.callee.property.name },
            });
          }
        }
      },
    };
  },
};

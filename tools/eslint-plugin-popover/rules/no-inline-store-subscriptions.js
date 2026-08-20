'use strict';

/**
 * Rule: popover/no-inline-store-subscriptions
 * Description: Disallow calling store.subscribe() directly in component render body without useEffect
 */
export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow calling store.subscribe() directly in component render body without useEffect',
      category: 'Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      inlineStoreSub:
        'Calling `store.subscribe()` inside component render body creates duplicate subscriptions on every render. Use useEffect or usePopoverStore selector.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (filename.includes('.test.') || filename.includes('test/')) return {};
    let inEffect = false;
    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.type === 'Identifier' &&
          (node.callee.name === 'useEffect' || node.callee.name === 'useLayoutEffect')
        ) {
          inEffect = true;
        } else if (
          !inEffect &&
          node.callee &&
          node.callee.type === 'MemberExpression' &&
          node.callee.property &&
          node.callee.property.name === 'subscribe' &&
          node.callee.object &&
          (node.callee.object.name === 'store' || node.callee.object.name === 'eventBus')
        ) {
          context.report({ node, messageId: 'inlineStoreSub' });
        }
      },
      'CallExpression:exit'(node) {
        if (
          node.callee &&
          node.callee.type === 'Identifier' &&
          (node.callee.name === 'useEffect' || node.callee.name === 'useLayoutEffect')
        ) {
          inEffect = false;
        }
      },
    };
  },
};

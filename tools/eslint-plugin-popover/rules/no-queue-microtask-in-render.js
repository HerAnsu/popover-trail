/**
 * @fileoverview Disallow calling queueMicrotask directly inside JSX component render bodies.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow queueMicrotask in render body; schedule inside useEffect instead to prevent state update loops during render.',
      category: 'React 19 Hooks',
      recommended: true,
    },
    schema: [],
    messages: {
      noMicrotaskInRender:
        'Do not call queueMicrotask() directly in component render body; place inside useEffect/useLayoutEffect.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (
      filename.includes('eslint-plugin') ||
      filename.includes('rules/') ||
      filename.includes('.test.') ||
      filename.includes('tests/')
    )
      return {};

    return {
      CallExpression(node) {
        if (node.callee && node.callee.name === 'queueMicrotask') {
          let parent = node.parent;
          let insideEffect = false;
          while (parent) {
            if (
              parent.type === 'CallExpression' &&
              parent.callee &&
              (parent.callee.name === 'useEffect' || parent.callee.name === 'useLayoutEffect')
            ) {
              insideEffect = true;
              break;
            }
            parent = parent.parent;
          }
          if (!insideEffect && filename.endsWith('.tsx')) {
            context.report({
              node,
              messageId: 'noMicrotaskInRender',
            });
          }
        }
      },
    };
  },
};

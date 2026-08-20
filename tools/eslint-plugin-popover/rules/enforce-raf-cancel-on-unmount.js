/**
 * @fileoverview Require cancelAnimationFrame cleanup inside effects scheduling animation frames.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce cancelAnimationFrame(frameId) in useEffect cleanup return function.',
      category: 'Memory',
      recommended: true,
    },
    schema: [],
    messages: {
      requireRafCancel:
        'Effect schedules requestAnimationFrame but does not call cancelAnimationFrame in cleanup function.',
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
        if (
          node.callee &&
          (node.callee.name === 'useEffect' || node.callee.name === 'useLayoutEffect') &&
          node.arguments[0] &&
          (node.arguments[0].type === 'ArrowFunctionExpression' ||
            node.arguments[0].type === 'FunctionExpression')
        ) {
          const body = context.getSourceCode
            ? context.getSourceCode().getText(node.arguments[0])
            : '';
          if (body.includes('requestAnimationFrame(') && !body.includes('cancelAnimationFrame(')) {
            context.report({
              node,
              messageId: 'requireRafCancel',
            });
          }
        }
      },
    };
  },
};

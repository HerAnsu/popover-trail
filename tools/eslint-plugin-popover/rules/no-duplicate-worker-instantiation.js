/**
 * @fileoverview Disallow new Worker() instantiation directly inside component render bodies.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow instantiating new Web Workers on every component render; use singleton or worker pool.',
      category: 'Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      noWorkerInRender:
        'Do not instantiate new Worker() directly inside component body. Move to module scope or useWorkerResolver hook.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      NewExpression(node) {
        if (
          node.callee &&
          node.callee.name === 'Worker' &&
          node.parent &&
          node.parent.parent &&
          (node.parent.parent.type === 'FunctionDeclaration' ||
            node.parent.parent.type === 'ArrowFunctionExpression')
        ) {
          const fnName = node.parent.parent.id?.name;
          if (fnName && (fnName.startsWith('use') || /^[A-Z]/.test(fnName))) {
            context.report({
              node,
              messageId: 'noWorkerInRender',
            });
          }
        }
      },
    };
  },
};

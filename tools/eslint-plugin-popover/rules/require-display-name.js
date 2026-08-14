'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure forwardRef and memo components define an explicit displayName for React DevTools',
      category: 'Component API Design',
      recommended: true,
    },
    schema: [],
    messages: {
      missingDisplayName: 'Component wrapped in `{{wrapper}}` should declare an explicit `displayName`.',
    },
  },
  create(context) {
    return {
      VariableDeclarator(node) {
        if (
          node.init &&
          node.init.type === 'CallExpression' &&
          node.init.callee &&
          (node.init.callee.name === 'forwardRef' || node.init.callee.name === 'memo')
        ) {
          const compName = node.id ? node.id.name : 'Component';
          const src = context.getSourceCode ? context.getSourceCode().getText() : '';
          if (!src.includes(`${compName}.displayName`) && compName !== 'Component') {
            context.report({ node, messageId: 'missingDisplayName', data: { wrapper: node.init.callee.name } });
          }
        }
      },
    };
  },
};

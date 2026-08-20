/**
 * @fileoverview Recommend explicit leading and trailing options when wrapping functions with debounce.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Encourage explicit configuration of leading/trailing behavior in debounce utility calls.',
      category: 'Concurrency',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestDebounceConfig:
        'Debounce wrapper call should specify explicit { leading, trailing } options.',
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
          (node.callee.name === 'debounce' ||
            (node.callee.property && node.callee.property.name === 'debounce')) &&
          node.arguments.length === 2 &&
          node.arguments[1] &&
          node.arguments[1].type === 'Literal' &&
          typeof node.arguments[1].value === 'number'
        ) {
          context.report({
            node,
            messageId: 'suggestDebounceConfig',
          });
        }
      },
    };
  },
};

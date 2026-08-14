/**
 * @fileoverview Require unknown instead of any in catch clause parameter annotations.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce error: unknown in catch clauses; disallow catch (e: any).',
      category: 'Type Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      catchUnknownOnly: 'Catch clause variable "{{ name }}" should be typed as unknown instead of any.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      CatchClause(node) {
        if (
          node.param &&
          node.param.typeAnnotation &&
          node.param.typeAnnotation.typeAnnotation &&
          node.param.typeAnnotation.typeAnnotation.type === 'TSAnyKeyword'
        ) {
          context.report({
            node: node.param,
            messageId: 'catchUnknownOnly',
            data: { name: node.param.name || 'error' },
          });
        }
      },
    };
  },
};

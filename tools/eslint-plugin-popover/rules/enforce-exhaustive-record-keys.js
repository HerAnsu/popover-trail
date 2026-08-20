/**
 * @fileoverview Recommend Record<KeyUnion, V> over generic index signature when keys are known.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Encourage Record<UnionKey, Type> instead of unconstrained string index signature.',
      category: 'Type Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      useRecordUnion:
        'Type definition {{ name }} uses generic [key: string] index; use Record<{{ keyType }}, ...> for exhaustiveness.',
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
      TSInterfaceDeclaration(node) {
        if (node.id && node.id.name.endsWith('Map') && node.body && node.body.body) {
          const hasLooseIndex = node.body.body.some(
            (m) =>
              m.type === 'TSIndexSignature' &&
              m.parameters &&
              m.parameters[0] &&
              m.parameters[0].typeAnnotation &&
              m.parameters[0].typeAnnotation.typeAnnotation &&
              m.parameters[0].typeAnnotation.typeAnnotation.type === 'TSStringKeyword',
          );
          if (hasLooseIndex && node.id.name !== 'RegisteredDataMap') {
            context.report({
              node,
              messageId: 'useRecordUnion',
              data: { name: node.id.name, keyType: 'PopoverKey' },
            });
          }
        }
      },
    };
  },
};

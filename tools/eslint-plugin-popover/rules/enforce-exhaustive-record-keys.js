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
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      TSInterfaceDeclaration(node) {
        if (node.id?.name?.endsWith('Map') && node.body?.body) {
          const hasLooseIndex = node.body?.body?.some?.(
            (m) =>
              m.type === 'TSIndexSignature' &&
              m.parameters?.[0]?.typeAnnotation?.typeAnnotation?.type === 'TSStringKeyword'
          );
          if (hasLooseIndex && node.id?.name !== 'RegisteredDataMap') {
            context.report({
              node,
              messageId: 'useRecordUnion',
              data: { name: node.id?.name, keyType: 'PopoverKey' },
            });
          }
        }
      },
    };
  },
};

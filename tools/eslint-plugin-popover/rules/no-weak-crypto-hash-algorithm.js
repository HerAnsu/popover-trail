/**
 * @fileoverview Disallow legacy weak hash algorithms like MD5 or SHA-1.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow weak MD5 or SHA-1 algorithms in hashing functions.',
      category: 'Security',
      recommended: true,
    },
    schema: [],
    messages: {
      noWeakHash: 'Algorithm "{{ alg }}" is cryptographically broken; use "SHA-256" or "SHA-512".',
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
      Literal(node) {
        if (
          typeof node.value === 'string' &&
          (node.value === 'MD5' ||
            node.value === 'md5' ||
            node.value === 'SHA-1' ||
            node.value === 'sha1')
        ) {
          const parent = node.parent;
          if (parent && (parent.type === 'CallExpression' || parent.type === 'Property')) {
            context.report({
              node,
              messageId: 'noWeakHash',
              data: { alg: node.value },
            });
          }
        }
      },
    };
  },
};

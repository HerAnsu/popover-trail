/**
 * @fileoverview Recommend top-level @fileoverview documentation comment in library core modules.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage @fileoverview docstrings on core store and component modules.',
      category: 'Documentation',
      recommended: true,
    },
    schema: [],
    messages: {
      requireFileBanner: 'Module {{ file }} is missing a top-level @fileoverview description header comment.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      Program(node) {
        if (filename.includes('src/lib/popover/store') || filename.includes('src/lib/popover/components')) {
          const comments = context.getSourceCode ? context.getSourceCode().getAllComments() : [];
          const hasFileOverview = comments.some((c) => c.value.includes('@fileoverview') || c.value.includes('popover'));
          if (!hasFileOverview) {
            context.report({
              node,
              messageId: 'requireFileBanner',
              data: { file: filename.split(/[/\\]/).pop() || 'module' },
            });
          }
        }
      },
    };
  },
};

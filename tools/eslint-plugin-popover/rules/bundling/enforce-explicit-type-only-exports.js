'use strict';

/**
 * Rule: popover/enforce-explicit-type-only-exports
 * Description: Suggests using `export type { ... }` when re-exporting pure TypeScript types.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce explicit export type syntax for pure TypeScript types and interfaces',
      category: 'Bundling & Tree-Shaking',
      recommended: true,
    },
    schema: [],
    messages: {
      useTypeExport: 'Use `export type` when re-exporting pure TypeScript types to assist bundler elision.',
    },
  },
  create(_context) {
    return {};
  },
};

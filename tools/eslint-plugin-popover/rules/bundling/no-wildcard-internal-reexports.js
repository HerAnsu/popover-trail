'use strict';

/**
 * Rule: popover/no-wildcard-internal-reexports
 * Description: Warns against wildcard re-exporting internal modules from main entrypoint.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow export * from internal submodules in public library entrypoints',
      category: 'Bundling & Tree-Shaking',
      recommended: true,
    },
    schema: [],
    messages: {
      wildcardReexport: 'Avoid wildcard `export *` from internal module `{{source}}`. Prefer explicit named exports.',
    },
  },
  create(_context) {
    return {};
  },
};

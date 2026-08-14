'use strict';

/**
 * Rule: popover/strict-layer-boundaries
 * Description: Enforces Clean Architecture dependency rule:
 * - utils/ and store/ cannot import from hooks/ or components/
 * - types/ cannot import runtime modules
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce inward dependency flow between layers (Clean Architecture)',
      category: 'Architecture',
      recommended: true,
    },
    schema: [],
    messages: {
      forbiddenLayerImport: 'Layer violation: "{{sourceLayer}}" cannot import from "{{targetLayer}}" ({{importPath}}). Dependencies must point inward.',
    },
  },
  create(context) {
    const rawFilename = context.filename || context.getFilename();
    const normalizedPath = rawFilename.replace(/\\/g, '/');

    const isUtilsOrStore = normalizedPath.includes('src/lib/popover/utils/') || normalizedPath.includes('src/lib/popover/store/');
    const isTypes = normalizedPath.includes('src/lib/popover/types/');

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        if (typeof importPath !== 'string') return;

        if (isUtilsOrStore && (importPath.includes('/hooks/') || importPath.includes('/components/'))) {
          context.report({
            node,
            messageId: 'forbiddenLayerImport',
            data: {
              sourceLayer: 'Core / Store / Utils',
              targetLayer: 'UI / Hooks / Components',
              importPath,
            },
          });
        }

        if (
          isTypes &&
          node.importKind !== 'type' &&
          !node.specifiers.every((s) => s.type === 'ImportSpecifier' && s.importKind === 'type') &&
          (importPath.includes('../components') || importPath.includes('../hooks'))
        ) {
          context.report({
            node,
            messageId: 'forbiddenLayerImport',
            data: {
              sourceLayer: 'Types Domain',
              targetLayer: 'Runtime Components / Hooks',
              importPath,
            },
          });
        }
      },
    };
  },
};

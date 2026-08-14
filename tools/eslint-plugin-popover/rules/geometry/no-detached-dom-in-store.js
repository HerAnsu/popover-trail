'use strict';

/**
 * Rule: popover/no-detached-dom-in-store
 * Description: Prevents storing raw DOM nodes or elements in Zustand store state interfaces.
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow storing raw HTMLElement or DOM references in Zustand Store',
      category: 'Geometry',
      recommended: true,
    },
    schema: [],
    messages: {
      domInStore: 'Do not store raw `{{type}}` in store state interface `{{name}}`. Store only serializable descriptors or use useRef/registries.',
    },
  },
  create(context) {
    const rawFilename = context.filename || context.getFilename();
    if (!rawFilename.includes('types') && !rawFilename.includes('store')) {
      return {};
    }

    const forbiddenTypes = new Set(['HTMLElement', 'Element', 'Node', 'DOMRect']);

    return {
      TSTypeReference(node) {
        if (!node.typeName || !forbiddenTypes.has(node.typeName.name)) return;

        let propParent = node.parent;
        while (propParent && propParent.type !== 'TSInterfaceDeclaration' && propParent.type !== 'TSTypeAliasDeclaration') {
          if (
            propParent.type === 'TSPropertySignature' &&
            propParent.key &&
            (propParent.key.name === 'anchorElement' || propParent.key.name === 'anchorRect')
          ) {
            return;
          }
          propParent = propParent.parent;
        }

        let curr = node.parent;
        let inStoreInterface = false;
        let interfaceName = '';

        while (curr) {
          if (
            (curr.type === 'TSInterfaceDeclaration' || curr.type === 'TSTypeAliasDeclaration') &&
            curr.id &&
            curr.id.name.toLowerCase().includes('state')
          ) {
            inStoreInterface = true;
            interfaceName = curr.id.name;
            break;
          }
          curr = curr.parent;
        }

        if (inStoreInterface) {
          context.report({
            node,
            messageId: 'domInStore',
            data: { type: node.typeName.name, name: interfaceName },
          });
        }
      },
    };
  },
};

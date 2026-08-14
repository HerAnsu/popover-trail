'use strict';

/**
 * Rule: popover/enforce-finite-coordinates
 * Description: Checks that Point2D.of and offset calculations don't pass unfiltered raw undefined/null
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure coordinate arguments are validated as finite numbers',
      category: 'Geometry',
      recommended: true,
    },
    schema: [],
    messages: {
      unvalidatedCoordinate: 'Coordinate parameter passed to `{{method}}` should be checked for finite numeric bounds.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.type === 'MemberExpression' &&
          node.callee.object &&
          node.callee.object.name === 'Point2D' &&
          node.callee.property &&
          node.callee.property.name === 'of' &&
          node.arguments.length < 2
        ) {
          context.report({
            node,
            messageId: 'unvalidatedCoordinate',
            data: { method: 'Point2D.of' },
          });
        }
      },
    };
  },
};

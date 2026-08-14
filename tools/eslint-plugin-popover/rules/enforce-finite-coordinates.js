'use strict';

/**
 * Rule: popover/enforce-finite-coordinates
 * Description: Enforce Number.isFinite checks on raw coordinate inputs in Point2D.of
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce Number.isFinite checks on raw coordinate inputs in Point2D.of',
      category: 'Geometry & Coordinates',
      recommended: true,
    },
    schema: [],
    messages: {
      nonFiniteCoordinate: 'Coordinate values must be validated for finiteness (Number.isFinite).',
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
          context.report({ node, messageId: 'nonFiniteCoordinate' });
        }
      },
    };
  },
};

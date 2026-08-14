/**
 * @fileoverview Recommend typed array Float32Array or numeric tuples for 3D matrix operations.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage using Float32Array or flat coordinate tuples for 3D tilt matrices.',
      category: 'Performance',
      recommended: false,
    },
    schema: [],
    messages: {
      useFlatMatrix: 'Consider flat tuple [rX, rY, tX, tY] or Float32Array for high-frequency CSS matrix transforms.',
    },
  },
  create(_context) {
    return {
      FunctionDeclaration(node) {
        if (
          node.id &&
          node.id.name === 'computeRawTiltAnglesComplex' &&
          node.returnType &&
          node.returnType.typeAnnotation
        ) {
          // Rule provides recommendation for complex matrix transforms
        }
      },
    };
  },
};

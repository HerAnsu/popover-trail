/**
 * @fileoverview Disallow hardcoded keyframe animation names that conflict with library presets.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage using standard popover-trail-* prefixed keyframes or design token classes.',
      category: 'Visual Tokens',
      recommended: false,
    },
    schema: [],
    messages: {
      useStandardKeyframes: 'Consider using standard "popover-trail-*" animation class names instead of raw keyframes.',
    },
  },
  create(_context) {
    return {
      Property(_node) {
        // Visual tokens design guideline
      },
    };
  },
};

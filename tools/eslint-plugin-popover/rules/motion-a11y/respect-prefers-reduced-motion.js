'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure spring and keyframe animations respect prefers-reduced-motion user preferences',
      category: 'Motion & A11y',
      recommended: true,
    },
    schema: [],
    messages: {
      respectReducedMotion: 'Ensure animation presets disable or reduce duration when prefers-reduced-motion is matched.',
    },
  },
  create(_context) {
    return {};
  },
};

/**
 * @fileoverview Recommend aria-roledescription on custom non-standard popover tree elements.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage aria-roledescription="popover trail" for composite multi-card stacks.',
      category: 'Accessibility',
      recommended: false,
    },
    schema: [],
    messages: {
      suggestRoleDescription: 'Consider adding aria-roledescription for custom non-standard cascading widgets.',
    },
  },
  create(_context) {
    return {
      JSXElement(_node) {
        // Accessibility suggestion rule for composite popover containers
      },
    };
  },
};

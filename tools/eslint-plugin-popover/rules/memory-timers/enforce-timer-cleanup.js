'use strict';

/**
 * Rule: popover/enforce-timer-cleanup
 * Description: Checks that useEffect creating timer handlers returns a cleanup function.
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce cleanup function return in useEffect when timers or animation frames are registered',
      category: 'Memory & Timers',
      recommended: true,
    },
    schema: [],
    messages: {
      missingTimerCleanup: 'useEffect registers `{{timer}}` without returning a cleanup function to prevent memory leaks and orphaned callbacks.',
    },
  },
  create(context) {
    const timerMethods = new Set(['setTimeout', 'setInterval', 'requestAnimationFrame', 'scheduleClose', 'scheduleHover']);

    return {
      CallExpression(node) {
        if (
          node.callee &&
          (node.callee.name === 'useEffect' || node.callee.name === 'useLayoutEffect') &&
          node.arguments.length > 0
        ) {
          const effectFn = node.arguments[0];
          if (!effectFn || !effectFn.body) return;

          let hasTimer = false;
          let foundTimerName = '';
          let hasReturnCleanup = false;

          // Simple traversal of effect body statements
          const statements = effectFn.body.type === 'BlockStatement' ? effectFn.body.body : [];

          for (const stmt of statements) {
            if (stmt.type === 'ReturnStatement') {
              hasReturnCleanup = true;
            }
            // Check if statement contains timer call
            if (
              stmt.type === 'ExpressionStatement' &&
              stmt.expression &&
              stmt.expression.type === 'CallExpression' &&
              stmt.expression.callee &&
              timerMethods.has(stmt.expression.callee.name)
            ) {
              hasTimer = true;
              foundTimerName = stmt.expression.callee.name;
            } else if (
              stmt.type === 'VariableDeclaration' &&
              stmt.declarations.some(
                (d) =>
                  d.init &&
                  d.init.type === 'CallExpression' &&
                  d.init.callee &&
                  timerMethods.has(d.init.callee.name),
              )
            ) {
              hasTimer = true;
              foundTimerName = 'timer';
            }
          }

          if (hasTimer && !hasReturnCleanup) {
            context.report({
              node,
              messageId: 'missingTimerCleanup',
              data: { timer: foundTimerName },
            });
          }
        }
      },
    };
  },
};

import { describe, it, expect } from 'vitest';
import plugin from '../index';

describe('eslint-plugin-popover-trail custom rules', () => {
  it('exports all 80 custom AST rules', () => {
    expect(Object.keys(plugin.rules)).toHaveLength(80);

    // Group A
    expect(plugin.rules).toHaveProperty('require-ssr-guard');
    expect(plugin.rules).toHaveProperty('no-direct-dom-mutation');

    // Group B
    expect(plugin.rules).toHaveProperty('strict-layer-boundaries');
    expect(plugin.rules).toHaveProperty('no-raw-zindex-literals');

    // Group C
    expect(plugin.rules).toHaveProperty('require-memo-on-drag-handlers');
    expect(plugin.rules).toHaveProperty('no-inline-store-subscriptions');

    // Group D
    expect(plugin.rules).toHaveProperty('enforce-timer-cleanup');
    expect(plugin.rules).toHaveProperty('no-direct-state-mutation');
    expect(plugin.rules).toHaveProperty('enforce-pool-release-in-finally');

    // Group E
    expect(plugin.rules).toHaveProperty('enforce-finite-coordinates');
    expect(plugin.rules).toHaveProperty('no-detached-dom-in-store');

    // Group F
    expect(plugin.rules).toHaveProperty('enforce-focus-restoration');
    expect(plugin.rules).toHaveProperty('require-aria-expanded-sync');
    expect(plugin.rules).toHaveProperty('enforce-escape-handler');

    // Group G
    expect(plugin.rules).toHaveProperty('enforce-typed-event-dispatch');
    expect(plugin.rules).toHaveProperty('sanitize-snapshot-payload');

    // Group H
    expect(plugin.rules).toHaveProperty('require-display-name');
    expect(plugin.rules).toHaveProperty('prefer-early-return-on-inactive');

    // Group I
    expect(plugin.rules).toHaveProperty('no-unhandled-resolver-promise');
    expect(plugin.rules).toHaveProperty('enforce-cancellation-token-check');
    expect(plugin.rules).toHaveProperty('no-race-condition-in-fetch');

    // Group J
    expect(plugin.rules).toHaveProperty('enforce-finite-inertia-velocity');
    expect(plugin.rules).toHaveProperty('require-safe-quadtree-bounds');
    expect(plugin.rules).toHaveProperty('no-zero-damping-in-spring');

    // Group K
    expect(plugin.rules).toHaveProperty('require-provider-wrap-on-hooks');
    expect(plugin.rules).toHaveProperty('enforce-shallow-equal-on-composite-selectors');
    expect(plugin.rules).toHaveProperty('no-nested-popover-providers');

    // Group L
    expect(plugin.rules).toHaveProperty('no-dangerously-set-inner-html');
    expect(plugin.rules).toHaveProperty('sanitize-custom-html-attributes');

    // Group M
    expect(plugin.rules).toHaveProperty('enforce-cleanup-after-mock-timers');

    // Group N
    expect(plugin.rules).toHaveProperty('enforce-middleware-order');
    expect(plugin.rules).toHaveProperty('require-safe-collision-padding');
    expect(plugin.rules).toHaveProperty('no-redundant-floating-middleware');

    // Group O
    expect(plugin.rules).toHaveProperty('enforce-observer-unobserve');
    expect(plugin.rules).toHaveProperty('no-passive-false-on-scroll-wheel');
    expect(plugin.rules).toHaveProperty('enforce-event-listener-target-check');

    // Group P
    expect(plugin.rules).toHaveProperty('enforce-pure-reducer-return');
    expect(plugin.rules).toHaveProperty('no-async-in-reducers');
    expect(plugin.rules).toHaveProperty('enforce-action-registry-naming');

    // Group Q
    expect(plugin.rules).toHaveProperty('enforce-prefixed-data-attributes');
    expect(plugin.rules).toHaveProperty('no-inline-style-override-on-tokens');

    // Group R
    expect(plugin.rules).toHaveProperty('enforce-transition-timeout-sync');
    expect(plugin.rules).toHaveProperty('no-unbounded-scale-transform');

    // Group S
    expect(plugin.rules).toHaveProperty('enforce-prevent-default-on-nav-keys');
    expect(plugin.rules).toHaveProperty('no-unscoped-keyboard-listeners');
    expect(plugin.rules).toHaveProperty('enforce-case-insensitive-key-matching');

    // Group T
    expect(plugin.rules).toHaveProperty('enforce-max-history-limit');
    expect(plugin.rules).toHaveProperty('no-direct-history-stack-push');
    expect(plugin.rules).toHaveProperty('require-snapshot-deserializer-fallback');

    // Group U
    expect(plugin.rules).toHaveProperty('no-circular-dag-edges');
    expect(plugin.rules).toHaveProperty('enforce-orphan-cleanup-on-parent-close');

    // Group V
    expect(plugin.rules).toHaveProperty('enforce-positive-breakpoint-width');
    expect(plugin.rules).toHaveProperty('no-viewport-resize-without-debounce');

    // Group W
    expect(plugin.rules).toHaveProperty('enforce-use-isomorphic-layout-effect');

    // Group X
    expect(plugin.rules).toHaveProperty('enforce-touch-action-none-on-draggable');
    expect(plugin.rules).toHaveProperty('enforce-pointer-capture-release');
    expect(plugin.rules).toHaveProperty('no-mouse-touch-event-duplication');

    // Group Y
    expect(plugin.rules).toHaveProperty('enforce-inert-attribute-on-background');
    expect(plugin.rules).toHaveProperty('require-autofocus-cleanup');
    expect(plugin.rules).toHaveProperty('no-tabindex-greater-than-zero');

    // Group Z
    expect(plugin.rules).toHaveProperty('enforce-portal-target-validation');
    expect(plugin.rules).toHaveProperty('no-negative-zindex-in-layers');
    expect(plugin.rules).toHaveProperty('enforce-unique-stack-group-ids');

    // Group AA
    expect(plugin.rules).toHaveProperty('enforce-worker-terminate-on-unmount');
    expect(plugin.rules).toHaveProperty('no-dom-access-in-worker-resolver');

    // Group AB
    expect(plugin.rules).toHaveProperty('enforce-dev-warning-prefix');
    expect(plugin.rules).toHaveProperty('no-unfiltered-console-error-in-lib');

    // Group AC
    expect(plugin.rules).toHaveProperty('no-top-level-side-effects');
    expect(plugin.rules).toHaveProperty('enforce-explicit-type-only-exports');
    expect(plugin.rules).toHaveProperty('no-wildcard-internal-reexports');

    // Group AD
    expect(plugin.rules).toHaveProperty('prefer-weakmap-for-dom-associations');
    expect(plugin.rules).toHaveProperty('enforce-clear-on-lru-cache-destroy');
    expect(plugin.rules).toHaveProperty('no-closure-leak-in-timeout-callbacks');

    // Group AE
    expect(plugin.rules).toHaveProperty('enforce-logical-css-properties');
    expect(plugin.rules).toHaveProperty('require-dir-attribute-sync');

    // Group AF
    expect(plugin.rules).toHaveProperty('enforce-composed-path-for-outside-click');
    expect(plugin.rules).toHaveProperty('no-direct-body-append-in-components');

    // Group AG
    expect(plugin.rules).toHaveProperty('respect-prefers-reduced-motion');
    expect(plugin.rules).toHaveProperty('no-infinite-keyframes-in-library');
    expect(plugin.rules).toHaveProperty('enforce-will-change-cleanup');
  });

  it('each rule has meta and create functions conforming to ESLint / Oxlint specification', () => {
    for (const [name, rule] of Object.entries(plugin.rules)) {
      expect(typeof rule.create, `Rule ${name} must define a create function`).toBe('function');
      expect(rule.meta, `Rule ${name} must define meta object`).toBeDefined();
      expect(rule.meta.messages, `Rule ${name} must declare error message templates`).toBeDefined();
    }
  });

  it('require-ssr-guard rule structure matches AST visitors', () => {
    const rule = plugin.rules['require-ssr-guard'];
    const fakeContext = {
      filename: 'src/lib/popover/hooks/useGeometry.ts',
      getFilename: () => 'src/lib/popover/hooks/useGeometry.ts',
      report: () => {},
    };
    const visitor = rule.create(fakeContext);
    expect(typeof visitor.Identifier).toBe('function');
  });

  it('strict-layer-boundaries detects layer violations', () => {
    const rule = plugin.rules['strict-layer-boundaries'];
    let reported = false;
    const fakeContext = {
      filename: 'src/lib/popover/store/reducers.ts',
      getFilename: () => 'src/lib/popover/store/reducers.ts',
      report: () => {
        reported = true;
      },
    };
    const visitor = rule.create(fakeContext);
    visitor.ImportDeclaration({
      source: { value: '../components/PopoverCard' },
    });
    expect(reported).toBe(true);
  });
});

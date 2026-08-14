import { describe, it, expect } from 'vitest';
import plugin from '../index';

describe('eslint-plugin-popover-trail custom rules', () => {
  it('exports all 30 custom AST rules', () => {
    expect(Object.keys(plugin.rules)).toHaveLength(30);

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

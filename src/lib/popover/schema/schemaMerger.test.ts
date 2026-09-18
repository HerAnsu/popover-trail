import { describe, it, expect } from 'vitest';
import { createPopoverSchema } from './schemaBuilder';
import { mergePopoverSchemas } from './schemaMerger';

describe('schemaMerger', () => {
  it('combines multiple schema instances and definitions', async () => {
    const userSchema = createPopoverSchema({
      user: { resolver: () => ({ name: 'Alice' }) },
    });

    const billingDef = {
      invoice: { resolver: () => ({ id: 'inv-101', amount: 250 }) },
    };

    const combined = mergePopoverSchemas(userSchema, billingDef);

    expect(combined.keys.user).toBe('user');
    expect(combined.keys.invoice).toBe('invoice');

    const resolver = combined.createResolver();
    const userResult = await resolver('user');
    const invoiceResult = await resolver('invoice');

    expect(userResult).toEqual({ name: 'Alice' });
    expect(invoiceResult).toEqual({ id: 'inv-101', amount: 250 });
  });

  it('performs recursive multi-schema combination', async () => {
    const moduleA = {
      alpha: { resolver: () => 'A', children: ['beta'] },
    };
    const moduleB = {
      beta: { resolver: () => 'B', children: ['gamma'] },
    };
    const moduleC = {
      gamma: { resolver: () => 'C' },
    };

    const mergedABC = mergePopoverSchemas(moduleA, moduleB, moduleC);
    const fullyMerged = mergePopoverSchemas(mergedABC, {
      delta: { resolver: () => 'D' },
    });

    expect(fullyMerged.keys.alpha).toBe('alpha');
    expect(fullyMerged.keys.beta).toBe('beta');
    expect(fullyMerged.keys.gamma).toBe('gamma');

    const resolver = fullyMerged.createResolver();
    await expect(resolver('alpha')).resolves.toBe('A');
    await expect(resolver('beta')).resolves.toBe('B');
    await expect(resolver('gamma')).resolves.toBe('C');
  });

  it('handles conflicting keys with last-write-wins precedence', async () => {
    const primarySchema = createPopoverSchema({
      profile: {
        resolver: () => ({ version: 1, source: 'primary' }),
        placement: 'top',
        offset: 8,
      },
      audit: {
        resolver: () => ({ logCount: 5 }),
      },
    });

    const overrideSchema = createPopoverSchema({
      profile: {
        resolver: () => ({ version: 2, source: 'override' }),
        placement: 'bottom',
        offset: 16,
      },
    });

    const merged = mergePopoverSchemas(primarySchema, overrideSchema);

    expect(merged.keys.profile).toBe('profile');
    expect(merged.keys.audit).toBe('audit');

    const resolver = merged.createResolver();
    const profileResult = await resolver('profile');
    expect(profileResult).toEqual({ version: 2, source: 'override' });

    const auditResult = await resolver('audit');
    expect(auditResult).toEqual({ logCount: 5 });

    const profileNode = Reflect.get(merged.definition, 'profile') as
      | (typeof overrideSchema.definition)['profile']
      | undefined;
    expect(profileNode?.placement).toBe('bottom');
    expect(profileNode?.offset).toBe(16);
  });

  it('merges single schema without modifying its structure', async () => {
    const standalone = createPopoverSchema({
      settings: { resolver: () => ({ theme: 'dark' }) },
    });

    const merged = mergePopoverSchemas(standalone);
    expect(merged.keys.settings).toBe('settings');

    const resolver = merged.createResolver();
    await expect(resolver('settings')).resolves.toEqual({ theme: 'dark' });
  });
});

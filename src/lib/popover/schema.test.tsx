import React from 'react';
import { describe, it, expect } from 'vitest';
import { createPopoverSchema, defineSchemaNode, toSchemaKey, mergePopoverSchemas } from './schema';

describe('Typed Popover Schema Builder (createPopoverSchema)', () => {
  const userProfileNode = defineSchemaNode({
    resolver: async (key: string) => ({ id: key, name: 'Alice' }),
    placement: 'right' as const,
    offset: 12,
    children: ['orderDetails'] as const,
  });

  const appSchema = createPopoverSchema({
    userProfile: userProfileNode,
    orderDetails: {
      resolver: (key: string) => ({ orderId: key, total: 100 }),
      placement: 'bottom' as const,
    },
  });

  it('creates auto-completing keys map matching schema definitions', () => {
    expect(appSchema.keys.userProfile).toBe('userProfile');
    expect(appSchema.keys.orderDetails).toBe('orderDetails');
  });

  it('validates schema node builder defineSchemaNode', () => {
    const customNode = defineSchemaNode({
      resolver: () => ({ status: 'ok' }),
      placement: 'top' as const,
    });
    expect(typeof customNode.resolver).toBe('function');
    expect(customNode.placement).toBe('top');
  });

  it('validates schema key branded helper toSchemaKey', () => {
    const key = toSchemaKey(appSchema, 'userProfile');
    expect(key).toBe('userProfile');
  });

  it('generates unified resolver that calls matching node resolver', async () => {
    const resolver = appSchema.createResolver();

    const userResult = await resolver('userProfile');
    expect(userResult).toEqual({ id: 'userProfile', name: 'Alice' });

    const orderResult = await resolver('orderDetails');
    expect(orderResult).toEqual({ orderId: 'orderDetails', total: 100 });
  });

  it('rejects with error when resolving an unknown schema key', async () => {
    const resolver = appSchema.createResolver();
    await expect(resolver('unknownKey')).rejects.toThrow(
      'No schema resolver defined for key: "unknownKey"',
    );
  });

  it('instantiates schema.Trigger component without runtime errors', () => {
    const triggerElement = (
      <appSchema.Trigger popoverKey="userProfile">
        <button>Open User Profile</button>
      </appSchema.Trigger>
    );

    expect(React.isValidElement(triggerElement)).toBe(true);
    expect(triggerElement.props.popoverKey).toBe('userProfile');
  });

  it('merges multiple modular schemas into a single cohesive schema instance via mergePopoverSchemas', async () => {
    const userSchema = createPopoverSchema({
      user: { resolver: async () => ({ name: 'Alice' }) },
    });
    const billingSchema = createPopoverSchema({
      invoice: { resolver: async () => ({ amount: 500 }) },
    });

    const merged = mergePopoverSchemas(userSchema, billingSchema);

    expect(merged.keys.user).toBe('user');
    expect(merged.keys.invoice).toBe('invoice');

    const resolver = merged.createResolver();
    await expect(resolver('user')).resolves.toEqual({ name: 'Alice' });
    await expect(resolver('invoice')).resolves.toEqual({ amount: 500 });
  });
});

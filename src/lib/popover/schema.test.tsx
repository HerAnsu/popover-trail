import React from 'react';
import { describe, it, expect } from 'vitest';
import { createPopoverSchema } from './schema';

describe('Typed Popover Schema Builder (createPopoverSchema)', () => {
  const appSchema = createPopoverSchema({
    userProfile: {
      resolver: async (key: string) => ({ id: key, name: 'Alice' }),
      placement: 'right',
      offset: 12,
    },
    orderDetails: {
      resolver: (key: string) => ({ orderId: key, total: 100 }),
      placement: 'bottom',
    },
  });

  it('creates auto-completing keys map matching schema definitions', () => {
    expect(appSchema.keys.userProfile).toBe('userProfile');
    expect(appSchema.keys.orderDetails).toBe('orderDetails');
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
});

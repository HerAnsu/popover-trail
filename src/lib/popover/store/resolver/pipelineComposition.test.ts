import { describe, it, expect } from 'vitest';
import { composeResolverPipeline, type ResolverHandler } from './pipelineMiddleware';

describe('resolver/pipelineComposition', () => {
  it('composeResolverPipeline combines multiple middlewares in correct onion order', async () => {
    const order: string[] = [];

    const m1 =
      (next: ResolverHandler<string>): ResolverHandler<string> =>
      async (params) => {
        order.push('m1-in');
        const res = await next(params);
        order.push('m1-out');
        return res;
      };

    const m2 =
      (next: ResolverHandler<string>): ResolverHandler<string> =>
      async (params) => {
        order.push('m2-in');
        const res = await next(params);
        order.push('m2-out');
        return res;
      };

    const base: ResolverHandler<string> = async (params) => {
      order.push('base');
      return `result-${params.key}`;
    };

    const pipeline = composeResolverPipeline(base, [m1, m2]);
    const output = await pipeline({ key: 'target', signal: new AbortController().signal });

    expect(output).toBe('result-target');
    expect(order).toEqual(['m1-in', 'm2-in', 'base', 'm2-out', 'm1-out']);
  });
});

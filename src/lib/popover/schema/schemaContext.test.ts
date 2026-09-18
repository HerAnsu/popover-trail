import { describe, it, expect } from 'vitest';
import type { InferSchemaContext, PopoverSchemaDefinition } from './schemaTypes';
import {
  resolveSchemaContext,
  hasSchemaContext,
  createDefaultContextResolver,
} from './schemaContext';
import { defineSchemaNode } from './schemaNode';

describe('schemaContext', () => {
  interface AppContext {
    readonly locale: string;
    readonly userId: string;
  }

  const defaultContext: AppContext = {
    locale: 'en-US',
    userId: 'guest',
  };

  it('infers schema context type correctly from schema node definition', () => {
    const node = defineSchemaNode<string>({
      resolver: (_key, _parent, ctx) => `context: ${String(ctx)}`,
    });

    const schema: PopoverSchemaDefinition = { item: node };
    type InferredCtx = InferSchemaContext<typeof schema>;

    const testCtx: InferredCtx = 'custom-ctx';
    expect(testCtx).toBe('custom-ctx');
  });

  it('resolves runtime context with default fallback when undefined', () => {
    const customContext: AppContext = { locale: 'de-DE', userId: 'admin' };

    const resolvedCustom = resolveSchemaContext(customContext, defaultContext);
    expect(resolvedCustom).toEqual({ locale: 'de-DE', userId: 'admin' });

    const resolvedFallback = resolveSchemaContext(undefined, defaultContext);
    expect(resolvedFallback).toEqual({ locale: 'en-US', userId: 'guest' });
  });

  it('determines valid context presence with hasSchemaContext', () => {
    expect(hasSchemaContext({ role: 'admin' })).toBe(true);
    expect(hasSchemaContext(0)).toBe(true);
    expect(hasSchemaContext('')).toBe(true);
    expect(hasSchemaContext(undefined)).toBe(false);
    expect(hasSchemaContext(null)).toBe(false);
  });

  it('creates reusable context resolver with configured default context', () => {
    const contextResolver = createDefaultContextResolver(defaultContext);

    expect(contextResolver({ locale: 'es-ES', userId: 'usr-1' })).toEqual({
      locale: 'es-ES',
      userId: 'usr-1',
    });

    expect(contextResolver(undefined)).toEqual(defaultContext);
  });

  it('integrates context resolution within schema node execution', async () => {
    const node = defineSchemaNode<{ greeting: string }, unknown, AppContext>({
      resolver: (_key, _parent, rawCtx) => {
        const ctx = resolveSchemaContext(rawCtx, defaultContext);
        return { greeting: `Hello ${ctx.userId} [${ctx.locale}]` };
      },
    });

    const withCustom = await node.resolver('greeting-node', undefined, {
      locale: 'ja-JP',
      userId: 'tanaka',
    });
    expect(withCustom.greeting).toBe('Hello tanaka [ja-JP]');

    const withDefault = await node.resolver('greeting-node');
    expect(withDefault.greeting).toBe('Hello guest [en-US]');
  });
});

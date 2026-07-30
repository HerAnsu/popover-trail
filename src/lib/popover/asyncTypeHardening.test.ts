import { describe, it, expect } from 'vitest';
import {
  SimplePopoverCache,
  type TypedPopoverCache,
  type CancellablePopoverResolver,
  type ResolverParams,
  type NoCyclePath,
} from './index';

interface UserProfile {
  id: string;
  name: string;
}

interface UserStats {
  views: number;
  likes: number;
}

type AppCacheMap = {
  userProfile: UserProfile;
  userStats: UserStats;
};

describe('Async & Deep Type Hardening', () => {
  it('supports per-key typed data retrieval in TypedPopoverCache', () => {
    const cache: TypedPopoverCache<AppCacheMap> =
      new SimplePopoverCache() as unknown as TypedPopoverCache<AppCacheMap>;

    cache.set('userProfile', { id: 'usr-1', name: 'Alice' });
    cache.set('userStats', { views: 100, likes: 42 });

    const profile = cache.get('userProfile') as UserProfile | undefined;
    const stats = cache.get('userStats') as UserStats | undefined;

    expect(profile?.name).toBe('Alice');
    expect(stats?.views).toBe(100);
  });

  it('guarantees non-optional AbortSignal in CancellablePopoverResolver', async () => {
    const controller = new AbortController();

    const resolver: CancellablePopoverResolver<
      UserProfile,
      undefined,
      { apiToken: string }
    > = async (params: ResolverParams<undefined, { apiToken: string }>) => {
      expect(params.signal).toBeDefined();
      expect(params.context?.apiToken).toBe('secret-123');
      return { id: 'usr-1', name: 'Alice' };
    };

    const res = await resolver({
      key: 'userProfile',
      context: { apiToken: 'secret-123' },
      signal: controller.signal,
    });

    expect(res.name).toBe('Alice');
  });

  it('validates cycle-free paths with NoCyclePath type helper', () => {
    const validPath: NoCyclePath<['card-1', 'card-2', 'card-3']> = ['card-1', 'card-2', 'card-3'];
    expect(validPath).toHaveLength(3);
  });
});

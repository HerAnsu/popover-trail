import { describe, it, expect } from 'vitest';
import {
  isBrowser,
  isServer,
  isDOM,
  isTouchDevice,
  prefersReducedMotion,
  isBroadcastChannelSupported,
  isResizeObserverSupported,
  isMutationObserverSupported,
  isIntersectionObserverSupported,
  isAnimationFrameSupported,
} from './envGuards';

describe('envGuards', () => {
  it('detects execution environment correctly', () => {
    expect(isBrowser()).toBe(typeof window !== 'undefined');
    expect(isServer()).toBe(typeof window === 'undefined');
    expect(isDOM()).toBe(typeof document !== 'undefined');
  });

  it('checks touch capability and reduced motion safely', () => {
    expect(typeof isTouchDevice()).toBe('boolean');
    expect(typeof prefersReducedMotion()).toBe('boolean');
  });

  it('checks Web API feature availability', () => {
    expect(typeof isBroadcastChannelSupported()).toBe('boolean');
    expect(typeof isResizeObserverSupported()).toBe('boolean');
    expect(typeof isMutationObserverSupported()).toBe('boolean');
    expect(typeof isIntersectionObserverSupported()).toBe('boolean');
    expect(typeof isAnimationFrameSupported()).toBe('boolean');
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { TriggerRegistry } from './triggerRegistry';

function createMockElement(): HTMLElement {
  return {} as HTMLElement;
}

describe('triggerRegistry utility', () => {
  beforeEach(() => {
    TriggerRegistry.clear();
  });

  it('registers, retrieves, and checks existence of anchor elements', () => {
    const el = createMockElement();
    TriggerRegistry.register('card-1', el);

    expect(TriggerRegistry.has('card-1')).toBe(true);
    expect(TriggerRegistry.get('card-1')).toBe(el);
  });

  it('returns null for unregistered keys', () => {
    expect(TriggerRegistry.get('unknown')).toBeNull();
    expect(TriggerRegistry.has('unknown')).toBe(false);
  });

  it('unregisters anchor elements', () => {
    const el = createMockElement();
    TriggerRegistry.register('card-2', el);
    TriggerRegistry.unregister('card-2');

    expect(TriggerRegistry.get('card-2')).toBeNull();
    expect(TriggerRegistry.has('card-2')).toBe(false);
  });

  it('clears all registered elements', () => {
    const el1 = createMockElement();
    const el2 = createMockElement();
    TriggerRegistry.register('k1', el1);
    TriggerRegistry.register('k2', el2);

    TriggerRegistry.clear();

    expect(TriggerRegistry.has('k1')).toBe(false);
    expect(TriggerRegistry.has('k2')).toBe(false);
  });

  it('safely handles empty/null keys and reports size', () => {
    expect(TriggerRegistry.size).toBe(0);
    TriggerRegistry.register('', createMockElement());
    TriggerRegistry.register('valid', null as unknown as HTMLElement);
    expect(TriggerRegistry.size).toBe(0);

    const el = createMockElement();
    TriggerRegistry.register('valid', el);
    expect(TriggerRegistry.size).toBe(1);
    expect(TriggerRegistry.get('')).toBeNull();
    TriggerRegistry.unregister('');
    expect(TriggerRegistry.size).toBe(1);
  });
});

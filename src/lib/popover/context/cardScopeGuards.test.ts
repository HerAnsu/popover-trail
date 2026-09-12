import { describe, it, expect } from 'vitest';
import { isCardStaticScope, isCardDynamicScope, isPopoverCardScope } from './cardScopeGuards';

describe('cardScopeGuards', () => {
  const dummyEntry = { key: 'card-1' };
  const dummyActions = { closeByKey: () => {} };
  const dummyCard = { isTopmost: true };

  it('validates CardStaticScope objects', () => {
    const staticScope = {
      entryKey: 'card-1',
      entry: dummyEntry,
      index: 0,
      actions: dummyActions,
    };
    expect(isCardStaticScope(staticScope)).toBe(true);
    expect(isCardStaticScope({ entryKey: 'card-1' })).toBe(false);
    expect(isCardStaticScope(null)).toBe(false);
  });

  it('validates CardDynamicScope objects', () => {
    expect(isCardDynamicScope({ isPinned: true, card: dummyCard })).toBe(true);
    expect(isCardDynamicScope({ isPinned: 'true', card: dummyCard })).toBe(false);
    expect(isCardDynamicScope(null)).toBe(false);
  });

  it('validates full PopoverCardScope objects', () => {
    const fullScope = {
      entry: dummyEntry,
      index: 0,
      isPinned: false,
      card: dummyCard,
      actions: dummyActions,
    };
    expect(isPopoverCardScope(fullScope)).toBe(true);
    expect(isPopoverCardScope({ entry: dummyEntry })).toBe(false);
  });
});

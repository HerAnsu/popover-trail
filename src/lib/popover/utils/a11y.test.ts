import { describe, it, expect } from 'vitest';
import {
  resolvePopoverAria,
  resolveTriggerAria,
  resolveActionLabel,
} from './a11y';

describe('a11y utils', () => {
  it('resolves modal dialog attributes for unpinned card', () => {
    const attrs = resolvePopoverAria({ key: 'user' }, false);
    expect(attrs.role).toBe('dialog');
    expect(attrs['aria-modal']).toBe(true);
    expect(attrs['aria-label']).toBe('Popover user');
  });

  it('resolves non-modal dialog attributes for pinned card', () => {
    const attrs = resolvePopoverAria(
      { key: 'user', ariaDescribedby: 'desc-1' },
      true,
      'User Details',
    );
    expect(attrs['aria-modal']).toBe(false);
    expect(attrs['aria-label']).toBe('User Details');
    expect(attrs['aria-describedby']).toBe('desc-1');
  });

  it('resolves trigger attributes', () => {
    const attrs = resolveTriggerAria('profile', true);
    expect(attrs['aria-haspopup']).toBe('dialog');
    expect(attrs['aria-expanded']).toBe(true);
    expect(attrs['aria-controls']).toBe('popover-card-profile');
  });

  it('resolves capitalized action aria label via resolveActionLabel', () => {
    expect(resolveActionLabel('close')).toBe('Close popover');
    expect(resolveActionLabel('pin')).toBe('Pin popover');
    expect(resolveActionLabel('unpin')).toBe('Unpin popover');
    expect(resolveActionLabel('expand', 'card')).toBe('Expand card');
  });
});

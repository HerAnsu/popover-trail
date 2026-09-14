import { describe, it, expect } from 'vitest';
import {
  resolvePopoverAriaAttributes,
  resolveTriggerAriaAttributes,
  resolveActionAriaLabel,
} from './a11y';

describe('a11y utils', () => {
  it('resolves modal dialog attributes for unpinned card', () => {
    const attrs = resolvePopoverAriaAttributes({ key: 'user' }, false);
    expect(attrs.role).toBe('dialog');
    expect(attrs['aria-modal']).toBe(true);
    expect(attrs['aria-label']).toBe('Popover user');
  });

  it('resolves non-modal dialog attributes for pinned card', () => {
    const attrs = resolvePopoverAriaAttributes(
      { key: 'user', ariaDescribedby: 'desc-1' },
      true,
      'User Details',
    );
    expect(attrs['aria-modal']).toBe(false);
    expect(attrs['aria-label']).toBe('User Details');
    expect(attrs['aria-describedby']).toBe('desc-1');
  });

  it('resolves trigger attributes', () => {
    const attrs = resolveTriggerAriaAttributes('profile', true);
    expect(attrs['aria-haspopup']).toBe('dialog');
    expect(attrs['aria-expanded']).toBe(true);
    expect(attrs['aria-controls']).toBe('popover-card-profile');
  });

  it('resolves capitalized action aria label via resolveActionAriaLabel', () => {
    expect(resolveActionAriaLabel('close')).toBe('Close popover');
    expect(resolveActionAriaLabel('pin')).toBe('Pin popover');
    expect(resolveActionAriaLabel('unpin')).toBe('Unpin popover');
    expect(resolveActionAriaLabel('expand', 'card')).toBe('Expand card');
  });
});

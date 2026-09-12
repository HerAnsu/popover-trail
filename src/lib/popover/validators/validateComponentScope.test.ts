import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PopoverWarningCode } from './warningEngine';
import {
  validateCardSubComponentScope,
  validateTimelineSubComponentScope,
  validatePortalContainer,
  validatePortalExclusion,
} from './validateComponentScope';

describe('validateComponentScope', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('detects card subcomponent rendered outside scope (PT-106)', () => {
    validateCardSubComponentScope(false, 'CloseButton');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.CARD_SUBCOMPONENT_OUTSIDE_SCOPE),
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('<PopoverCard.CloseButton> was rendered outside of a <PopoverCard> container.'),
    );

    warnSpy.mockClear();
    validateCardSubComponentScope(true, 'CloseButton');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('detects timeline subcomponent rendered outside scope (PT-107)', () => {
    validateTimelineSubComponentScope(false, 'Step');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.TIMELINE_SUBCOMPONENT_OUTSIDE_SCOPE),
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('<PopoverTimeline.Step> was rendered outside of a <PopoverTimeline> container.'),
    );

    warnSpy.mockClear();
    validateTimelineSubComponentScope(true, 'Step');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('validates portal target container DOM node presence (PT-125)', () => {
    validatePortalContainer(null);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.MISSING_PORTAL_CONTAINER),
    );

    warnSpy.mockClear();
    const mockElement = {} as Element;
    validatePortalContainer(mockElement);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('warns about portal exclusion elements (PT-130)', () => {
    validatePortalExclusion('CustomPortalRoot');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.PORTAL_EXCLUSION),
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Element <CustomPortalRoot> is marked with data-popover-portal'),
    );
  });
});

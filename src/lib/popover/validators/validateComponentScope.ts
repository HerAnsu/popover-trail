import { isDevEnv, warnDevDetails, PopoverWarningCode } from './warningEngine';

/** PT-106: Validates card sub-component context placement. */
export function validateCardSubComponentScope(hasContext: boolean, subComponentName: string): void {
  if (!isDevEnv()) return;

  if (!hasContext) {
    warnDevDetails(true, {
      code: PopoverWarningCode.CARD_SUBCOMPONENT_OUTSIDE_SCOPE,
      message: `<PopoverCard.${subComponentName}> was rendered outside of a <PopoverCard> container.`,
    });
  }
}

/** PT-107: Validates timeline sub-component context placement. */
export function validateTimelineSubComponentScope(
  hasContext: boolean,
  subComponentName: string,
): void {
  if (!isDevEnv()) return;

  if (!hasContext) {
    warnDevDetails(true, {
      code: PopoverWarningCode.TIMELINE_SUBCOMPONENT_OUTSIDE_SCOPE,
      message: `<PopoverTimeline.${subComponentName}> was rendered outside of a <PopoverTimeline> container.`,
    });
  }
}

/** PT-125: Validates portal container DOM node existence. */
export function validatePortalContainer(container: Element | null): void {
  if (!isDevEnv()) return;

  if (!container) {
    warnDevDetails(true, {
      code: PopoverWarningCode.MISSING_PORTAL_CONTAINER,
      message: '<PopoverPortal> target container DOM node is null or unmounted.',
    });
  }
}

/** PT-130: Validates portal exclusion element attributes. */
export function validatePortalExclusion(elementName: string): void {
  if (!isDevEnv()) return;

  warnDevDetails(true, {
    code: PopoverWarningCode.PORTAL_EXCLUSION,
    message: `Element <${elementName}> is marked with data-popover-portal and will be excluded from click-outside teardown.`,
  });
}

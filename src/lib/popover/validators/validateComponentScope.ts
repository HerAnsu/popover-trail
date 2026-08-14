import { isDevEnv, warnDevDetails } from './warningEngine';

/** PT-106: Validates card sub-component context placement. */
export function validateCardSubComponentScope(hasContext: boolean, subComponentName: string): void {
  if (!isDevEnv()) return;

  if (!hasContext) {
    warnDevDetails(true, {
      code: 'PT-106',
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
      code: 'PT-107',
      message: `<PopoverTimeline.${subComponentName}> was rendered outside of a <PopoverTimeline> container.`,
    });
  }
}

/** PT-125: Validates portal container DOM node existence. */
export function validatePortalContainer(container: Element | null): void {
  if (!isDevEnv()) return;

  if (!container) {
    warnDevDetails(true, {
      code: 'PT-125',
      message: '<PopoverPortal> target container DOM node is null or unmounted.',
    });
  }
}

/** PT-130: Validates portal exclusion element attributes. */
export function validatePortalExclusion(elementName: string): void {
  if (!isDevEnv()) return;

  warnDevDetails(true, {
    code: 'PT-130',
    message: `Element <${elementName}> is marked with data-popover-portal and will be excluded from click-outside teardown.`,
  });
}

import { isDevEnv, warnDevDetails, PopoverWarningCode } from './warningEngine';

/**
 * Validates that card subcomponents (e.g. `Header`, `Body`, `CloseButton`) are rendered inside `<PopoverCard>`.
 * Emits dev warning `PT-106` if context is absent.
 *
 * @param hasContext - Whether `<PopoverCard>` context is present.
 * @param subComponentName - Name of the subcomponent being evaluated.
 *
 * @example
 * ```typescript
 * validateCardSubComponentScope(Boolean(cardContext), 'Header');
 * ```
 */
export function validateCardSubComponentScope(hasContext: boolean, subComponentName: string): void {
  if (!isDevEnv()) return;

  if (!hasContext) {
    warnDevDetails(true, {
      code: PopoverWarningCode.CARD_SUBCOMPONENT_OUTSIDE_SCOPE,
      message: `<PopoverCard.${subComponentName}> was rendered outside of a <PopoverCard> container.`,
    });
  }
}

/**
 * Validates that timeline subcomponents (e.g. `StepList`, `UndoButton`) are rendered inside `<PopoverTimeline>`.
 * Emits dev warning `PT-107` if context is absent.
 *
 * @param hasContext - Whether `<PopoverTimeline>` context is present.
 * @param subComponentName - Name of the subcomponent being evaluated.
 *
 * @example
 * ```typescript
 * validateTimelineSubComponentScope(Boolean(timelineContext), 'StepList');
 * ```
 */
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

/**
 * Validates that a DOM portal target element exists and is mounted.
 * Emits dev warning `PT-125` if container element is null.
 *
 * @param container - Target DOM Element or null.
 *
 * @example
 * ```typescript
 * validatePortalContainer(document.getElementById('portal-root'));
 * ```
 */
export function validatePortalContainer(container: Element | null): void {
  if (!isDevEnv()) return;

  if (!container) {
    warnDevDetails(true, {
      code: PopoverWarningCode.MISSING_PORTAL_CONTAINER,
      message: '<PopoverPortal> target container DOM node is null or unmounted.',
    });
  }
}

/**
 * Validates and logs notice for elements designated as portal exclusions from outside click dismissal.
 * Emits dev warning `PT-130`.
 *
 * @param elementName - HTML tag or identifier of the excluded element.
 *
 * @example
 * ```typescript
 * validatePortalExclusion('dialog');
 * ```
 */
export function validatePortalExclusion(elementName: string): void {
  if (!isDevEnv()) return;

  warnDevDetails(true, {
    code: PopoverWarningCode.PORTAL_EXCLUSION,
    message: `Element <${elementName}> is marked with data-popover-portal and will be excluded from click-outside teardown.`,
  });
}

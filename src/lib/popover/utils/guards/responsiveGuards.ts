/**
 * Responsive Placement & Layout Mode Type Guards.
 *
 * @module utils/guards/responsiveGuards
 */

/**
 * Checks whether the popover should render as a mobile bottom-sheet based on
 * explicit mode, automatic mobile viewport detection, or layout strategy.
 */
export function isBottomSheetMode(
  mode: string | undefined,
  isMobile: boolean,
  strategy?: string,
): boolean {
  return mode === 'bottom-sheet' || (mode === 'auto' && isMobile) || strategy === 'docked-bottom';
}

/**
 * Checks whether the popover should render as a viewport-centered modal card.
 */
export function isCenteredModalMode(mode: string | undefined, strategy?: string): boolean {
  return mode === 'modal' || strategy === 'fixed-center';
}

/**
 * Checks whether the popover should dock to the top edge navigation bar.
 */
export function isDockedTopMode(strategy: string | undefined): boolean {
  return strategy === 'docked-top';
}

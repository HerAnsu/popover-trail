/**
 * Unified Trail Entry Types Barrel for popover-trail.
 * Clean Architecture Layer 1: Core Domain.
 *
 * @module types/entry
 */

export * from './entryBase';
export * from './entryVariants';
export * from './entryGuards';
export { getEntryState } from '../../utils/typeGuards';
export { matchEntryState } from '../../utils/matchEntryState';

/**
 * Fluent Builder Read-Only Query Facade.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module utils/controller/fluentQueries
 */

import type { PopoverStore } from '../../types';
import { selectIsPinned } from '../../store/selectors';
import {
  getCardEntry,
  getCardOffset,
  getCardBreadcrumbs,
  getCardDepth,
  getCardParents,
  getCardChildren,
} from './cardQueries';
import type { PopoverCardFluentBuilder } from './controllerTypes';

export function createBuilderQueries<TData, TContext, TPopoverKey extends string>(
  key: TPopoverKey,
  getState: () => PopoverStore<TData, TContext, TPopoverKey>,
): Pick<
  PopoverCardFluentBuilder<TData, TPopoverKey>,
  | 'get'
  | 'isOpen'
  | 'isPinned'
  | 'isLoading'
  | 'data'
  | 'error'
  | 'offset'
  | 'breadcrumbs'
  | 'depth'
  | 'parents'
  | 'children'
> {
  return {
    get: () => getCardEntry(getState(), key),
    isOpen: () => getCardEntry(getState(), key) !== undefined,
    isPinned: () => selectIsPinned<TPopoverKey>(key)(getState()),
    isLoading: () => getCardEntry(getState(), key)?.isLoading ?? false,
    data: () => getCardEntry(getState(), key)?.data,
    error: () => getCardEntry(getState(), key)?.error ?? null,
    offset: () => getCardOffset(getState(), key),
    breadcrumbs: () => getCardBreadcrumbs(getState(), key),
    depth: () => getCardDepth(getState(), key),
    parents: () => getCardParents(getState(), key),
    children: () => getCardChildren(getState(), key),
  };
}

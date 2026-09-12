/**
 * Action Signatures for Asynchronous Data Resolution Pipeline Slices.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module types/actions/resolverActions
 */

import type { OpenNestedOptions, OpenRootOptions } from '../config/optionsConfig';
import type { AnchorEventLike } from '../state/taxonomy';

export interface ResolverSliceActions<
  TData = unknown,
  _TContext = unknown,
  TPopoverKey extends string = string,
> {
  openRootWithResolver: (
    keyOrName: TPopoverKey,
    anchorEvent?: AnchorEventLike,
    options?: Readonly<OpenRootOptions>,
  ) => Promise<void>;
  openNestedWithResolver: (
    keyOrName: TPopoverKey,
    sourceKey: TPopoverKey,
    options?: Readonly<OpenNestedOptions>,
    anchorEvent?: AnchorEventLike,
  ) => Promise<void>;
  retryPopover: (key: TPopoverKey, options?: Readonly<{ forceRefresh?: boolean }>) => Promise<void>;
  prefetchPopover: (key: TPopoverKey, parentData?: TData) => Promise<TData | undefined>;
  invalidate: (keyOrKeys: TPopoverKey | readonly TPopoverKey[]) => Promise<void>;
}

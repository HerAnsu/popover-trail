/**
 * Popover Imperative Controller and Fluent Builder Type Contracts.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module utils/controller/controllerTypes
 */

import type {
  PopoverStore,
  TrailEntry,
  AnchorEventLike,
  OpenRootOptions,
  OpenNestedOptions,
  DragOffset,
  PopoverPlacement,
} from '../../types';
import type { PopoverError } from '../errors';

export interface PopoverCardFluentBuilder<TData = unknown, TPopoverKey extends string = string> {
  readonly key: TPopoverKey;
  get(): TrailEntry<TData, TPopoverKey> | undefined;
  isOpen(): boolean;
  isPinned(): boolean;
  isLoading(): boolean;
  data(): TData | null | undefined;
  error(): PopoverError | Error | null;
  offset(): DragOffset;
  breadcrumbs(): readonly TPopoverKey[];
  depth(): number;
  parents(): readonly TPopoverKey[];
  children(): readonly TPopoverKey[];
  open(options?: OpenRootOptions): this;
  openWithResolver(anchorEvent?: AnchorEventLike, options?: OpenRootOptions): Promise<this>;
  atPlacement(placement: PopoverPlacement): this;
  withOffset(x: number, y: number): this;
  withData(data: TData): this;
  pin(rect?: DOMRect): this;
  unpin(): this;
  togglePin(rect?: DOMRect): this;
  bringToFront(): this;
  close(options?: { transition?: boolean }): this;
  retry(): Promise<this>;
  prefetch(parentData?: TData): Promise<TData | undefined>;
  addParent(parentKey: TPopoverKey): this;
  removeParent(parentKey: TPopoverKey): this;
  when(condition: boolean, mutate: (builder: this) => void): this;
}

export interface PopoverController<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  focus: (key: TPopoverKey) => PopoverCardFluentBuilder<TData, TPopoverKey>;
  openRoot: (ownerId: string, entry: TrailEntry<TData, TPopoverKey>) => void;
  openNested: (index: number, entry: TrailEntry<TData, TPopoverKey>) => void;
  openRootWithResolver: (
    key: TPopoverKey,
    evt?: AnchorEventLike,
    opts?: OpenRootOptions,
  ) => Promise<void>;
  openNestedWithResolver: (
    key: TPopoverKey,
    src: TPopoverKey,
    opts?: OpenNestedOptions,
  ) => Promise<void>;
  closeByKey: (key: TPopoverKey, options?: { transition?: boolean }) => void;
  togglePin: (key: TPopoverKey, rect?: DOMRect) => void;
  bringToFront: (key: TPopoverKey) => void;
  updateOffset: (key: TPopoverKey, x: number, y: number) => void;
  hoverEnter: (key: TPopoverKey) => void;
  hoverLeave: (key: TPopoverKey, delay?: number) => void;
  closeTopmost: (options?: { transition?: boolean }) => void;
  clear: () => void;
  clearTrail: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  retryPopover: (key: TPopoverKey) => Promise<void>;
  addParent: (childKey: TPopoverKey, parentKey: TPopoverKey) => boolean;
  removeParent: (childKey: TPopoverKey, parentKey: TPopoverKey) => void;
  getParents: (key: TPopoverKey) => readonly TPopoverKey[];
  getChildren: (key: TPopoverKey) => readonly TPopoverKey[];
  getState: () => PopoverStore<TData, TContext, TPopoverKey>;
  dispose: () => void;
}

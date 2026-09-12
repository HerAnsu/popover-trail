/**
 * Store Event Definitions, Event Actions, and Dispatcher Maps.
 *
 * @module types/events/storeEvents
 */

export const POPOVER_EVENT_ACTIONS = [
  'open_root',
  'push_nested',
  'close',
  'pin',
  'unpin',
  'resolve_start',
  'resolve_success',
  'resolve_error',
  'resolve_perf',
  'clear',
  'drag_start',
  'drag_end',
  'dag_edge_added',
  'dag_edge_removed',
] as const;

export type PopoverEventAction = (typeof POPOVER_EVENT_ACTIONS)[number];

export type ResolutionSource = 'cache' | 'in-flight' | 'sync' | 'async' | 'deduped';

export interface ResolutionMetric<TPopoverKey extends string = string> {
  readonly key: TPopoverKey;
  readonly source: ResolutionSource;
  readonly durationMs: number;
  readonly timestamp: number;
  readonly success: boolean;
  readonly error?: Error;
}

export type PopoverStoreEventName = `popover:${PopoverEventAction}`;

export type PopoverEmptyAction = 'clear';
export type PopoverPayloadAction = Exclude<PopoverEventAction, PopoverEmptyAction>;

export interface PopoverEventPayloadDefinitions<
  TData = unknown,
  TPopoverKey extends string = string,
> {
  open_root: { key: TPopoverKey; ownerId: string };
  push_nested: { key: TPopoverKey; parentKey?: TPopoverKey };
  close: { keys: TPopoverKey[]; key?: TPopoverKey };
  pin: { key: TPopoverKey };
  unpin: { key: TPopoverKey };
  resolve_start: { key: TPopoverKey };
  resolve_success: { key: TPopoverKey; data: TData };
  resolve_error: { key: TPopoverKey; error: Error };
  resolve_perf: { metric: ResolutionMetric<TPopoverKey> };
  clear: Record<string, never>;
  drag_start: { key: TPopoverKey; x: number; y: number };
  drag_end: { key: TPopoverKey; x: number; y: number };
  dag_edge_added: { parentKey: TPopoverKey; childKey: TPopoverKey };
  dag_edge_removed: { parentKey: TPopoverKey; childKey: TPopoverKey };
}

export type PopoverStoreEvent<TData = unknown, TPopoverKey extends string = string> =
  | { type: PopoverEmptyAction | `popover:${PopoverEmptyAction}` }
  | {
      [K in PopoverPayloadAction]: {
        type: K | `popover:${K}`;
      } & PopoverEventPayloadDefinitions<TData, TPopoverKey>[K];
    }[PopoverPayloadAction];

export type PopoverStoreEventMap<TData = unknown, TPopoverKey extends string = string> = {
  [E in PopoverStoreEvent<TData, TPopoverKey> as E['type']]: E;
};

export type PopoverEventMap<
  TData = unknown,
  TPopoverKey extends string = string,
> = PopoverStoreEventMap<TData, TPopoverKey>;

export type OnPopoverEventMap<TData = unknown, TPopoverKey extends string = string> = Record<
  string,
  (event: PopoverStoreEvent<TData, TPopoverKey>) => void
>;

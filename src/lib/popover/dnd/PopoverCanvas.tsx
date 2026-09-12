/**
 * Multi-layer Popover Canvas with DnDContext and coordinate boundary clamping.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module dnd/PopoverCanvas
 */

import { useCallback, useRef, useMemo } from 'react';
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  DEFAULT_DRAG_DISTANCE_THRESHOLD,
  DEFAULT_TOUCH_DELAY_MS,
  DEFAULT_TOUCH_TOLERANCE_PX,
} from '../constants';
import { usePopoverTrail, usePopoverFloating } from '../hooks/usePopoverSelectors';
import { usePopoverStore, usePopoverStoreApi, usePopoverActions } from '../context/usePopoverStore';
import type { PopoverCanvasProps } from './dndTypes';
import { FIXED_CONTAINER_STYLE, AUTO_POINTER_STYLE } from './dndCardConfig';
import { useCanvasModifiers } from './dndCanvasModifiers';

export function PopoverCanvas<TData = unknown>({
  children,
  modifiers,
  restrictToWindow = false,
  restrictToContainer = false,
  enableSnapping = false,
  snapThreshold = 12,
}: Readonly<PopoverCanvasProps<TData>>) {
  const trail = usePopoverTrail<TData>();
  const floating = usePopoverFloating<TData>();
  const store = usePopoverStoreApi<TData>();
  const { updateOffset, bringToFront } = usePopoverActions<TData>();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: DEFAULT_DRAG_DISTANCE_THRESHOLD },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: DEFAULT_TOUCH_DELAY_MS,
        tolerance: DEFAULT_TOUCH_TOLERANCE_PX,
      },
    }),
    useSensor(KeyboardSensor),
  );

  const zIndexOrder = usePopoverStore((state) => state.zIndexOrder);
  const activeEntries = useMemo(() => {
    const raw = [
      ...floating.map((entry, idx) => ({ entry, isPinned: true, index: idx })),
      ...trail.map((entry, idx) => ({ entry, isPinned: false, index: floating.length + idx })),
    ];
    if (zIndexOrder.length === 0) return raw;
    const orderMap = new Map(zIndexOrder.filter(Boolean).map((k, i) => [k, i]));
    return raw.sort(
      (a, b) => (orderMap.get(a.entry.key) ?? a.index) - (orderMap.get(b.entry.key) ?? b.index),
    );
  }, [floating, trail, zIndexOrder]);

  const computedModifiers = useCanvasModifiers({
    modifiers,
    restrictToWindow,
    restrictToContainer,
    enableSnapping,
    snapThreshold,
    containerRef,
    activeEntries,
  });

  const handleDragStart = useCallback(
    (e: DragStartEvent) => bringToFront(String(e.active.id)),
    [bringToFront],
  );
  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      const key = String(e.active.id);
      const cur = store.getState().offsets[key] ?? { x: 0, y: 0 };
      updateOffset(
        key,
        cur.x + (Number.isFinite(e.delta?.x) ? e.delta.x : 0),
        cur.y + (Number.isFinite(e.delta?.y) ? e.delta.y : 0),
      );
    },
    [store, updateOffset],
  );

  if (activeEntries.length === 0) return null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={computedModifiers}>
      <div ref={containerRef} style={FIXED_CONTAINER_STYLE}>
        {activeEntries.map(({ entry, isPinned, index: entryIndex }) => (
          <div key={entry.key} style={AUTO_POINTER_STYLE}>
            {children({ entry, index: entryIndex, isPinned })}
          </div>
        ))}
      </div>
    </DndContext>
  );
}

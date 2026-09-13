/**
 * Imperative Store Controller Core Factory.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module utils/controller/controllerCore
 */

import type { StoreApi } from 'zustand';
import type { PopoverStore } from '../../types';
import { EMPTY_READONLY_ARRAY } from '../../types/branded';
import { validateStoreControllerInstance } from '../devWarnings';
import { createFluentBuilder } from './fluentBuilder';
import type { PopoverController } from './controllerTypes';

export function createPopoverController<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  store: StoreApi<PopoverStore<TData, TContext, TPopoverKey>>,
): PopoverController<TData, TContext, TPopoverKey> {
  validateStoreControllerInstance(store);

  const getState = (): PopoverStore<TData, TContext, TPopoverKey> => {
    const s = store?.getState?.();
    if (!s) {
      throw new Error(
        '[popover-trail controller error]: Store instance is uninitialized or destroyed.',
      );
    }
    return s;
  };

  const clear = () => getState().clear();

  return {
    focus: (key) => createFluentBuilder(store, key, getState),
    openRoot: (ownerId, entry) => getState().openRoot(ownerId, entry),
    openNested: (index, entry) => getState().pushNested(index, entry),
    openRootWithResolver: (k, ev, o) => getState().openRootWithResolver(k, ev, o),
    openNestedWithResolver: (k, src, o) => getState().openNestedWithResolver(k, src, o),
    closeByKey: (key, opts) => getState().closeByKey(key, opts),
    togglePin: (key, rect) => getState().togglePin(key, rect),
    bringToFront: (key) => getState().bringToFront(key),
    updateOffset: (key, x, y) => getState().updateOffset(key, x, y),
    hoverEnter: (key) => getState().hoverEnter(key),
    hoverLeave: (key, delay) => getState().hoverLeave(key, delay),
    closeTopmost: (opts) => getState().closeTopmost(opts),
    clear,
    clearTrail: () => getState().clearTrail(),
    undo: () => getState().undo(),
    redo: () => getState().redo(),
    canUndo: () => getState().canUndo(),
    canRedo: () => getState().canRedo(),
    retryPopover: (key) => getState().retryPopover(key),
    addParent: (child, parent) => getState().addEdge(parent, child),
    removeParent: (child, parent) => getState().removeEdge(parent, child),
    getParents: (key) => {
      const parents = getState().getParents(key);
      return parents.size === 0 ? EMPTY_READONLY_ARRAY : [...parents];
    },
    getChildren: (key) => {
      const children = getState().getChildren(key);
      return children.size === 0 ? EMPTY_READONLY_ARRAY : [...children];
    },
    getState,
    dispose: clear,
  };
}

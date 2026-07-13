import { describe, it, expect, vi } from 'vitest'
import { createPopoverStore } from './store'
import type { TrailEntry } from './types'

// Mock DOMRect for the Node environment
if (typeof globalThis.DOMRect === 'undefined') {
  globalThis.DOMRect = class DOMRect {
    x: number
    y: number
    width: number
    height: number
    top: number
    bottom: number
    left: number
    right: number

    constructor(
      x = 0,
      y = 0,
      width = 0,
      height = 0
    ) {
      this.x = x
      this.y = y
      this.width = width
      this.height = height
      this.top = y
      this.bottom = y + height
      this.left = x
      this.right = x + width
    }
    static fromRect(other?: any) {
      return new DOMRect(other?.x, other?.y, other?.width, other?.height)
    }
  } as any
}

describe('createPopoverStore', () => {
  const dummyResolver = vi.fn<(key: string) => any>().mockImplementation((key) => {
    return { title: `Resolved ${key}`, value: 42 }
  })

  it('should initialize with correct default state', () => {
    const store = createPopoverStore(dummyResolver)
    const state = store.getState()

    expect(state.trail).toEqual([])
    expect(state.floating).toEqual([])
    expect(state.ownerId).toBeNull()
    expect(state.offsets).toEqual({})
    expect(state.pinnedStates).toEqual({})
    expect(state.zIndexOrder).toEqual([])
    expect(state.anchorElement).toBeNull()
    expect(state.anchorRect).toBeNull()
  })

  it('should open a root popover correctly', () => {
    const store = createPopoverStore(dummyResolver)
    const entry: TrailEntry = { key: 'root-item', isLoading: false }

    store.getState().openRoot('owner-1', entry)

    const state = store.getState()
    expect(state.ownerId).toBe('owner-1')
    expect(state.trail).toHaveLength(1)
    expect(state.trail[0].key).toBe('root-item')
    expect(state.zIndexOrder).toEqual(['root-item'])
  })

  it('should push a nested popover correctly', () => {
    const store = createPopoverStore(dummyResolver)
    const rootEntry: TrailEntry = { key: 'root-item', isLoading: false }
    const childEntry: TrailEntry = { key: 'child-item', parentKey: 'root-item', isLoading: false }

    store.getState().openRoot('owner-1', rootEntry)
    store.getState().pushNested(0, childEntry)

    const state = store.getState()
    expect(state.trail).toHaveLength(2)
    expect(state.trail[0].key).toBe('root-item')
    expect(state.trail[1].key).toBe('child-item')
    expect(state.zIndexOrder).toEqual(['root-item', 'child-item'])
  })

  it('should close popovers starting from index correctly', () => {
    const store = createPopoverStore(dummyResolver)
    const rootEntry: TrailEntry = { key: 'root-item', isLoading: false }
    const childEntry: TrailEntry = { key: 'child-item', parentKey: 'root-item', isLoading: false }

    store.getState().openRoot('owner-1', rootEntry)
    store.getState().pushNested(0, childEntry)
    
    // Close from index 1 (removes child-item)
    store.getState().closeFrom(1)

    const state = store.getState()
    expect(state.trail).toHaveLength(1)
    expect(state.trail[0].key).toBe('root-item')
    expect(state.zIndexOrder).toEqual(['root-item'])
  })

  it('should toggle pinning state between trail and floating', () => {
    const store = createPopoverStore(dummyResolver)
    const rootEntry: TrailEntry = { key: 'root-item', isLoading: false }
    
    store.getState().openRoot('owner-1', rootEntry)
    
    // Pin root popover
    store.getState().togglePin('root-item', new DOMRect(10, 20, 100, 200))

    const state = store.getState()
    expect(state.trail).toHaveLength(0)
    expect(state.floating).toHaveLength(1)
    expect(state.floating[0].key).toBe('root-item')
    expect(state.pinnedStates['root-item']).toBe(true)
    expect(state.floating[0].pinnedLayoutPos).toEqual({ top: 20, left: 10 })

    // Unpin root popover
    store.getState().togglePin('root-item')
    const nextState = store.getState()
    expect(nextState.floating).toHaveLength(0)
    expect(nextState.trail).toHaveLength(1)
    expect(nextState.trail[0].key).toBe('root-item')
    expect(nextState.pinnedStates['root-item']).toBe(false)
  })

  it('should clear all popovers on clear', () => {
    const store = createPopoverStore(dummyResolver)
    const rootEntry: TrailEntry = { key: 'root-item', isLoading: false }
    
    store.getState().openRoot('owner-1', rootEntry)
    store.getState().clear()

    const state = store.getState()
    expect(state.trail).toEqual([])
    expect(state.ownerId).toBeNull()
    expect(state.zIndexOrder).toEqual([])
  })

  it('should ignore stale root hydration responses (prevent race conditions)', async () => {
    let resolveCallCount = 0
    const delayResolver = async (_key: string) => {
      resolveCallCount++
      const currentCall = resolveCallCount
      const delayTime = currentCall === 1 ? 50 : 10
      await new Promise((r) => setTimeout(r, delayTime))
      return { title: `Resolved Call ${currentCall}` }
    }

    const store = createPopoverStore(delayResolver)
    const mockButton1 = {
      currentTarget: {
        getBoundingClientRect: () => new DOMRect(10, 20, 100, 200)
      } as any,
      stopPropagation: () => {}
    }
    const mockButton2 = {
      currentTarget: {
        getBoundingClientRect: () => new DOMRect(30, 40, 100, 200)
      } as any,
      stopPropagation: () => {}
    }

    // Trigger first slow request
    const p1 = store.getState().openRootWithResolver('item-a', mockButton1, 'owner-1')
    // Trigger second fast request
    const p2 = store.getState().openRootWithResolver('item-b', mockButton2, 'owner-2')

    await Promise.all([p1, p2])

    const state = store.getState()
    expect(state.trail).toHaveLength(1)
    expect(state.trail[0].key).toBe('item-b')
    expect(state.trail[0].data?.title).toBe('Resolved Call 2')
  })

  it('should ignore stale nested hydration responses', async () => {
    let resolveCallCount = 0
    const delayResolver = async (_key: string) => {
      resolveCallCount++
      const currentCall = resolveCallCount
      const delayTime = currentCall === 1 ? 50 : 10
      await new Promise((r) => setTimeout(r, delayTime))
      return { title: `Nested Call ${currentCall}` }
    }

    const store = createPopoverStore(delayResolver)
    const rootEntry: TrailEntry = { key: 'root-item', isLoading: false }
    store.getState().openRoot('owner-1', rootEntry)

    // Trigger nested slow call (parentKey: 'root-item')
    const p1 = store.getState().openNestedWithResolver('child-a', 'root-item')
    // Trigger nested fast call
    const p2 = store.getState().openNestedWithResolver('child-b', 'root-item')

    await Promise.all([p1, p2])

    const state = store.getState()
    expect(state.trail).toHaveLength(2)
    expect(state.trail[1].key).toBe('child-b')
    expect(state.trail[1].data?.title).toBe('Nested Call 2')
  })

  it('should support retrying failed popover data resolution', async () => {
    let callCount = 0
    const flakyResolver = async (_key: string) => {
      callCount++
      if (callCount === 1) {
        throw new Error('Network failure')
      }
      return { title: 'Success resolved data' }
    }

    const store = createPopoverStore(flakyResolver)
    const mockButton = {
      currentTarget: {
        getBoundingClientRect: () => new DOMRect(10, 20, 100, 200)
      } as any,
      stopPropagation: () => {}
    }

    // First attempt fails
    await store.getState().openRootWithResolver('item-a', mockButton)
    
    let state = store.getState()
    expect(state.trail[0].error).toBeDefined()
    expect(state.trail[0].error?.message).toBe('Network failure')
    expect(state.trail[0].data).toBeUndefined()

    // Retry resolves successfully
    await store.getState().retryPopover('item-a')

    state = store.getState()
    expect(state.trail[0].error).toBeNull()
    expect(state.trail[0].data?.title).toBe('Success resolved data')
    expect(state.trail[0].isLoading).toBe(false)
  })
})

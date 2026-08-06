import { describe, it, expect } from 'vitest';
import * as PopoverLib from './index';

describe('index entry point exports', () => {
  it('re-exports all core components, functions, and utilities', () => {
    expect(PopoverLib.PopoverProvider).toBeDefined();
    expect(PopoverLib.PopoverCard).toBeDefined();
    expect(PopoverLib.PopoverTrigger).toBeDefined();
    expect(PopoverLib.PopoverTrail).toBeDefined();
    expect(PopoverLib.PopoverPortal).toBeDefined();
    expect(PopoverLib.createPopoverStore).toBeDefined();
    expect(PopoverLib.createPopoverSchema).toBeDefined();
    expect(PopoverLib.createPopoverTrail).toBeDefined();
    expect(PopoverLib.PopoverError).toBeDefined();
    expect(PopoverLib.Ok).toBeDefined();
    expect(PopoverLib.Err).toBeDefined();
  });
});
